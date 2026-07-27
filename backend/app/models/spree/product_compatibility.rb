# frozen_string_literal: true

module Spree
  class ProductCompatibility < Spree.base_class
    self.table_name = "spree_product_compatibilities"

    ROLES = %w[completes_kit required_for_fit protection_layer communication accessory].freeze

    belongs_to :source_product, class_name: "Spree::Product"
    belongs_to :compatible_product, class_name: "Spree::Product"

    validates :rationale, presence: true
    validates :role, inclusion: { in: ROLES }
    validates :compatible_product_id, uniqueness: { scope: %i[source_product_id role] }
    validate :products_must_differ

    scope :active, -> { where(active: true) }
    scope :positioned, -> { order(:position, :id) }

    private

    def products_must_differ
      errors.add(:compatible_product, "must differ from source product") if source_product_id == compatible_product_id
    end
  end
end
