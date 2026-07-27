# frozen_string_literal: true

module Spree
  class ProductStory < Spree.base_class
    self.table_name = "spree_product_stories"

    STATUSES = %w[draft in_review published archived].freeze

    belongs_to :product, inverse_of: :product_stories
    has_many :modules, -> { order(:position, :id) }, class_name: "Spree::ProductStoryModule",
             inverse_of: :product_story, dependent: :destroy

    accepts_nested_attributes_for :modules, allow_destroy: true

    validates :title, :locale, presence: true
    validates :status, inclusion: { in: STATUSES }
    validates :locale, uniqueness: { scope: :product_id }
    validate :published_story_has_date

    scope :published, -> { where(status: "published").where("published_at <= ?", Time.current) }

    private

    def published_story_has_date
      errors.add(:published_at, "must be set before publishing") if status == "published" && published_at.blank?
    end
  end
end
