# frozen_string_literal: true

module Spree
  class ProductStoryModule < Spree.base_class
    self.table_name = "spree_product_story_modules"

    TYPES = %w[
      story_hero image_text_split full_width_image feature_grid technical_detail
      material_construction product_anatomy usage_context video image_gallery
      comparison included_in_box compatibility sizing_fit key_benefit_strip
      buyer_note trust_warranty closing_conversion
    ].freeze
    VISIBILITIES = %w[visible hidden desktop_only mobile_only].freeze

    belongs_to :product_story, inverse_of: :modules

    validates :module_type, inclusion: { in: TYPES }
    validates :visibility, inclusion: { in: VISIBILITIES }
    validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
    validate :feature_grid_limit

    private

    def feature_grid_limit
      return unless module_type == "feature_grid" && callouts.size > 6

      errors.add(:callouts, "supports at most six features")
    end
  end
end
