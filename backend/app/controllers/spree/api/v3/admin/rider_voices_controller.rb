module Spree
  module Api
    module V3
      module Admin
        class RiderVoicesController < Spree::Api::V3::Admin::BaseController
          before_action :load_contribution, only: %i[show update moderate]

          def index
            scope = Spree::RiderContribution.includes(:product, :user, :media)
            scope = scope.where(status: params[:status]) if params[:status].present?
            scope = scope.where(contribution_type: params[:type]) if params[:type].present?
            scope = scope.where(product_id: params[:product_id]) if params[:product_id].present?
            scope = scope.where("body ILIKE :query OR title ILIKE :query", query: "%#{sanitize_sql_like(params[:q])}%") if params[:q].present?
            pagy, records = pagy(scope.order(created_at: :desc), limit: params.fetch(:per_page, 25).to_i.clamp(1, 100))

            render json: {
              data: records.map { |record| serialize_admin(record) },
              meta: { page: pagy.page, pages: pagy.pages, count: pagy.count }
            }
          end

          def show
            render json: { data: serialize_admin(@contribution, audit: true) }
          end

          def update
            if @contribution.update(editorial_params)
              render json: { data: serialize_admin(@contribution) }
            else
              render json: { errors: @contribution.errors.to_hash(true) },
                     status: :unprocessable_content
            end
          end

          def moderate
            action = params.require(:moderation_action)
            new_status = status_for(action)
            previous_status = @contribution.status

            Spree::RiderContribution.transaction do
              @contribution.update!(
                status: new_status || previous_status,
                locked: lock_value(action, @contribution.locked)
              )
              moderate_media!(action)
              @contribution.moderation_actions.create!(
                admin_user: current_user,
                action:,
                previous_status:,
                new_status: @contribution.status,
                note: params[:note]
              )
            end

            render json: { data: serialize_admin(@contribution.reload, audit: true) }
          end

          private

          def load_contribution
            @contribution = Spree::RiderContribution.find(params[:id])
          end

          def editorial_params
            params.permit(:highlighted_quote, :featured)
          end

          def status_for(action)
            {
              "approve" => "published", "reject" => "rejected",
              "hide" => "hidden", "restore" => "published",
              "flag" => "flagged", "archive" => "archived",
              "mark_spam" => "rejected"
            }[action]
          end

          def lock_value(action, current)
            return true if action == "lock"
            return false if action == "unlock"

            current
          end

          def moderate_media!(action)
            return @contribution.media.update_all(status: "published", updated_at: Time.current) if action == "approve"
            return @contribution.media.update_all(status: "rejected", updated_at: Time.current) if %w[reject mark_spam].include?(action)

            nil
          end

          def serialize_admin(record, audit: false)
            {
              id: record.id.to_s,
              type: record.contribution_type,
              status: record.status,
              product: { id: record.product_id.to_s, name: record.product.name },
              author: { id: record.user_id&.to_s, display_name: record.display_name },
              title: record.title,
              body: record.body,
              highlighted_quote: record.highlighted_quote,
              rating: record.rating,
              verified_purchase: record.verified_purchase,
              featured: record.featured,
              locked: record.locked,
              reports_count: record.reports.open.count,
              media_count: record.media.size,
              created_at: record.created_at.iso8601,
              audit: if audit
                       record.moderation_actions.order(created_at: :desc).map do |item|
                         {
                           action: item.action,
                           previous_status: item.previous_status,
                           new_status: item.new_status,
                           note: item.note,
                           admin_user_id: item.admin_user_id.to_s,
                           created_at: item.created_at.iso8601
                         }
                       end
                     end
            }
          end

          def sanitize_sql_like(value)
            ActiveRecord::Base.sanitize_sql_like(value.to_s)
          end
        end
      end
    end
  end
end
