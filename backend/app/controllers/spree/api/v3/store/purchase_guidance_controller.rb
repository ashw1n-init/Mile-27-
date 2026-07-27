# frozen_string_literal: true

module Spree
  module Api
    module V3
      module Store
        class PurchaseGuidanceController < Spree::Api::V3::BaseController
          def index
            slugs = Array(params[:product_slugs]).map(&:to_s).reject(&:blank?).uniq.first(20)
            product_ids = Spree::Product.where(slug: slugs).pluck(:id)
            guidance = Spree::ProductCompatibility.active.positioned
              .where(source_product_id: product_ids)
              .includes(:source_product, compatible_product: [:images])

            render json: { data: guidance.map { |entry| serialize(entry) } }
          end

          private

          def serialize(entry)
            product = entry.compatible_product
            {
              id: entry.id.to_s,
              source_product_id: entry.source_product_id.to_s,
              role: entry.role,
              rationale: entry.rationale,
              product: {
                id: product.id.to_s,
                name: product.name,
                slug: product.slug,
                available: product.available?,
                image_url: product.images.first&.url(:large)
              }
            }
          end
        end
      end
    end
  end
end
