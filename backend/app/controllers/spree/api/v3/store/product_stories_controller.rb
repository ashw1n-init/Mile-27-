# frozen_string_literal: true

module Spree
  module Api
    module V3
      module Store
        class ProductStoriesController < Spree::Api::V3::BaseController
          def show
            product = find_product(params[:product_id])
            locale = params[:locale].presence || I18n.locale.to_s
            story = product.product_stories.published.includes(:modules).find_by(locale:) ||
                    product.product_stories.published.includes(:modules).find_by(locale: I18n.default_locale.to_s)
            return head :not_found unless story

            render json: { data: serialize_story(story) }
          rescue ActiveRecord::RecordNotFound
            head :not_found
          end

          private

          def find_product(identifier)
            return Spree::Product.find_by_prefix_id!(identifier) if Spree::Product.prefixed_id?(identifier)

            Spree::Product.find_by(id: identifier) || Spree::Product.friendly.find(identifier)
          end

          def serialize_story(story)
            {
              id: story.id.to_s, title: story.title, eyebrow: story.eyebrow,
              introduction: story.introduction, theme: story.theme, locale: story.locale,
              reviewed_by: story.reviewed_by, reviewed_at: story.reviewed_at&.iso8601,
              published_at: story.published_at&.iso8601,
              modules: story.modules.reject { |item| item.visibility == "hidden" }.map { |item| serialize_module(item) }
            }
          end

          def serialize_module(item)
            item.attributes.slice(
              "module_type", "position", "heading", "subheading", "body", "layout",
              "background_style", "media", "callouts", "product_relations",
              "source_references", "visibility", "mobile_configuration", "configuration"
            ).merge("id" => item.id.to_s)
          end
        end
      end
    end
  end
end
