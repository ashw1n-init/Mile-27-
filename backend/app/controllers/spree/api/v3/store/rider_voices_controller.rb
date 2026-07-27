module Spree
  module Api
    module V3
      module Store
        class RiderVoicesController < Spree::Api::V3::BaseController
          MAX_PAGE_SIZE = 24

          prepend_before_action :require_authentication!, only: %i[create helpful unhelpful report]
          before_action :load_product, only: %i[index create]
          before_action :load_contribution, only: %i[helpful unhelpful report]

          def index
            scope = filtered_scope
            pagy, records = pagy(scope, limit: page_size)

            render json: {
              data: records.map { |record| serialize_contribution(record) },
              meta: pagination_meta(pagy).merge(summary: summary_for(@product))
            }
          end

          def create
            contribution = @product.rider_contributions.new(contribution_params)
            contribution.user = current_user
            contribution.status = :pending

            if contribution.review_content?
              verification = Spree::RiderVoices::PurchaseVerifier.new(
                user: current_user,
                product: @product,
                variant_id: contribution.variant_id
              ).call
              contribution.verified_purchase = verification.verified
              contribution.line_item = verification.line_item
              contribution.variant ||= verification.variant
            end

            if contribution.save
              attach_media(contribution)
              render json: {
                data: serialize_contribution(contribution),
                meta: { message: "Submitted for review" }
              }, status: :created
            else
              render json: { errors: contribution.errors.to_hash(true) },
                     status: :unprocessable_content
            end
          end

          def helpful
            vote = @contribution.helpful_votes.find_or_initialize_by(user: current_user)
            if vote.save
              render json: { helpful_count: @contribution.reload.helpful_count }
            else
              render json: { errors: vote.errors.to_hash(true) },
                     status: :unprocessable_content
            end
          end

          def unhelpful
            @contribution.helpful_votes.where(user: current_user).destroy_all
            render json: { helpful_count: @contribution.reload.helpful_count }
          end

          def report
            report = @contribution.reports.find_or_initialize_by(user: current_user)
            report.assign_attributes(report_params)
            if report.save
              @contribution.update!(status: :flagged) if @contribution.reports.open.count >= 3
              render json: { message: "Report received" }, status: :created
            else
              render json: { errors: report.errors.to_hash(true) },
                     status: :unprocessable_content
            end
          end

          private

          def load_product
            @product = if Spree::Product.prefixed_id?(params[:product_id])
                         Spree::Product.find_by_prefix_id!(params[:product_id])
                       else
                         Spree::Product.find_by(id: params[:product_id]) ||
                           Spree::Product.friendly.find(params[:product_id])
                       end
          rescue ActiveRecord::RecordNotFound
            render json: { error: { code: "not_found", message: "Product not found" } },
                   status: :not_found
          end

          def load_contribution
            @contribution = Spree::RiderContribution.published.find(params[:id])
          end

          def filtered_scope
            scope = @product.rider_contributions.published.root.with_public_associations
            scope = scope.where(contribution_type: contribution_types) if params[:view].present?
            scope = scope.where(rating: params[:rating]) if params[:rating].present?
            scope = scope.where(verified_purchase: true) if params[:verified] == "true"
            scope = scope.joins(:media).where(spree_rider_media: { media_type: params[:media_type] }).distinct if params[:media_type].present?

            case params[:sort]
            when "newest" then scope.order(published_at: :desc)
            when "highest_rated" then scope.order(rating: :desc, published_at: :desc)
            when "lowest_rated" then scope.order(rating: :asc, published_at: :desc)
            else scope.order(featured: :desc, helpful_count: :desc, published_at: :desc)
            end
          end

          def contribution_types
            case params[:view]
            when "questions" then %w[question]
            when "discussions" then %w[review rider_story question]
            else %w[review rider_story]
            end
          end

          def summary_for(product)
            published = product.rider_contributions.published
            reviews = published.reviews
            counts = reviews.group(:rating).count
            {
              average_rating: reviews.average(:rating)&.round(2)&.to_f,
              review_count: reviews.count,
              verified_percentage: percentage(reviews.where(verified_purchase: true).count, reviews.count),
              media_count: Spree::RiderMedia.published.joins(:contribution).
                           merge(published.where(product_id: product.id)).count,
              question_count: published.questions.count,
              answered_question_count: published.questions.joins(:replies).
                                       merge(Spree::RiderContribution.published).distinct.count,
              rating_distribution: (1..5).to_h { |rating| [rating, counts.fetch(rating, 0)] }
            }
          end

          def percentage(value, total)
            return 0 if total.zero?

            ((value.to_f / total) * 100).round
          end

          def serialize_contribution(record)
            {
              id: record.id.to_s,
              type: record.contribution_type,
              title: record.title,
              body: record.body,
              quote: record.public_quote,
              rating: record.rating,
              verified_purchase: record.verified_purchase,
              featured: record.featured,
              display_name: record.display_name,
              rider_type: record.rider_type,
              usage_type: record.usage_type,
              ownership_duration: record.ownership_duration,
              variant: record.variant && { id: record.variant.id.to_s, name: record.variant.options_text },
              feedback: Spree::RiderContribution::STRUCTURED_FEEDBACK.keys.to_h { |key| [key, record.public_send(key)] }.compact,
              helpful_count: record.helpful_count,
              replies_count: record.replies_count,
              published_at: record.published_at&.iso8601,
              media: record.media.select(&:published?).filter_map { |item| serialize_media(item) },
              replies: record.replies.select(&:published?).first(3).map { |reply| serialize_reply(reply) }
            }
          end

          def serialize_reply(reply)
            {
              id: reply.id.to_s,
              type: reply.contribution_type,
              body: reply.body,
              display_name: reply.display_name,
              verified_purchase: reply.verified_purchase,
              helpful_count: reply.helpful_count,
              published_at: reply.published_at&.iso8601
            }
          end

          def serialize_media(item)
            return unless item.file.attached?

            {
              id: item.id.to_s,
              type: item.media_type,
              url: rails_blob_url(item.file),
              caption: item.caption,
              alt_text: item.alt_text,
              transcript: item.transcript,
              width: item.width,
              height: item.height,
              duration_seconds: item.duration_seconds
            }
          end

          def attach_media(contribution)
            Array(params[:media]).first(6).each_with_index do |upload, index|
              next unless upload.respond_to?(:content_type)

              media_type = upload.content_type.to_s.split("/").first
              item = contribution.media.build(media_type:, position: index, status: :pending)
              item.file.attach(upload)
              item.save!
            end
          end

          def contribution_params
            params.permit(
              :contribution_type, :title, :body, :highlighted_quote, :rating,
              :variant_id, :parent_id, :display_name, :rider_type, :usage_type,
              :ownership_duration, :fit_feedback, :head_shape, :comfort, :noise,
              :ventilation, :locale
            )
          end

          def report_params
            params.permit(:reason, :details)
          end

          def page_size
            params.fetch(:per_page, 10).to_i.clamp(1, MAX_PAGE_SIZE)
          end

          def pagination_meta(pagy)
            { page: pagy.page, pages: pagy.pages, count: pagy.count, per_page: pagy.limit }
          end
        end
      end
    end
  end
end
