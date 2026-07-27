module Spree
  module RiderVoices
    class PurchaseVerifier
      Result = Data.define(:verified, :line_item, :variant)

      def initialize(user:, product:, variant_id: nil)
        @user = user
        @product = product
        @variant_id = variant_id
      end

      def call
        return Result.new(verified: false, line_item: nil, variant: nil) unless user

        scope = Spree::LineItem.
                joins(:order, :variant).
                where(spree_orders: { user_id: user.id }).
                where.not(spree_orders: { completed_at: nil }).
                where(spree_variants: { product_id: product.id }).
                order("spree_orders.completed_at DESC")
        scope = scope.where(variant_id:) if variant_id.present?
        line_item = scope.first

        Result.new(
          verified: line_item.present?,
          line_item:,
          variant: line_item&.variant
        )
      end

      private

      attr_reader :user, :product, :variant_id
    end
  end
end
