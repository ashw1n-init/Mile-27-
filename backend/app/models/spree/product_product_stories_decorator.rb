# frozen_string_literal: true

module Spree
  module ProductProductStoriesDecorator
    def self.prepended(base)
      base.has_many :product_stories, class_name: "Spree::ProductStory", dependent: :destroy,
                    inverse_of: :product
    end
  end
end
