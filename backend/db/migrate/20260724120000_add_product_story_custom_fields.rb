# frozen_string_literal: true

class AddProductStoryCustomFields < ActiveRecord::Migration[8.1]
  STORY_FIELDS = [
    {
      key: 'kicker',
      name: 'Product Story · Kicker',
      metafield_type: 'Spree::Metafields::ShortText'
    },
    {
      key: 'headline',
      name: 'Product Story · Headline',
      metafield_type: 'Spree::Metafields::ShortText'
    },
    {
      key: 'intro',
      name: 'Product Story · Introduction',
      metafield_type: 'Spree::Metafields::LongText'
    },
    {
      key: 'chapter_one_title',
      name: 'Product Story · Chapter 1 title',
      metafield_type: 'Spree::Metafields::ShortText'
    },
    {
      key: 'chapter_one_body',
      name: 'Product Story · Chapter 1 body',
      metafield_type: 'Spree::Metafields::RichText'
    },
    {
      key: 'chapter_two_title',
      name: 'Product Story · Chapter 2 title',
      metafield_type: 'Spree::Metafields::ShortText'
    },
    {
      key: 'chapter_two_body',
      name: 'Product Story · Chapter 2 body',
      metafield_type: 'Spree::Metafields::RichText'
    },
    {
      key: 'chapter_three_title',
      name: 'Product Story · Chapter 3 title',
      metafield_type: 'Spree::Metafields::ShortText'
    },
    {
      key: 'chapter_three_body',
      name: 'Product Story · Chapter 3 body',
      metafield_type: 'Spree::Metafields::RichText'
    }
  ].freeze

  def up
    STORY_FIELDS.each do |attributes|
      definition = Spree::CustomFieldDefinition.find_or_initialize_by(
        resource_type: 'Spree::Product',
        namespace: 'product_story',
        key: attributes.fetch(:key)
      )
      definition.assign_attributes(
        name: attributes.fetch(:name),
        metafield_type: attributes.fetch(:metafield_type),
        display_on: 'both'
      )
      definition.save!
    end
  end

  def down
    Spree::CustomFieldDefinition.where(
      resource_type: 'Spree::Product',
      namespace: 'product_story',
      key: STORY_FIELDS.pluck(:key)
    ).destroy_all
  end
end
