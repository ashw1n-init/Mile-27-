# frozen_string_literal: true

namespace :product_stories do
  desc "Migrate authored product-story metafields and product descriptions into structured stories"
  task migrate_legacy: :environment do
    headings = [
      "Product Overview", "Key Features", "Materials and Construction",
      "Safety and Certification", "Visor and Visibility", "Comfort and Interior",
      "Ventilation System", "Intended Rider Profile", "Best Use Cases",
      "What is in the Box", "Shipping and Warranty"
    ]

    product_ids = Spree::Metafield.joins(:metafield_definition)
      .where(resource_type: "Spree::Product", spree_metafield_definitions: { namespace: "product_story" })
      .distinct.pluck(:resource_id)

    product_ids.each do |product_id|
      product = Spree::Product.find_by(id: product_id)
      next unless product

      fields = Spree::Metafield.joins(:metafield_definition)
        .where(resource: product, spree_metafield_definitions: { namespace: "product_story" })
        .pluck("spree_metafield_definitions.key", "spree_metafields.value").to_h
      document = Nokogiri::HTML.fragment(product.description.to_s)
      sections = document.css("h3").to_h do |node|
        content = []
        sibling = node.next_sibling
        while sibling && sibling.name != "h3"
          content << sibling.text.squish if sibling.element?
          sibling = sibling.next_sibling
        end
        [node.text.squish, content.reject(&:blank?).join(" ").presence]
      end.compact.slice(*headings)

      story = product.product_stories.find_or_initialize_by(locale: I18n.default_locale.to_s)
      story.assign_attributes(
        eyebrow: fields["kicker"].presence || "Product, deconstructed",
        title: fields["headline"].presence || product.name,
        introduction: fields["intro"].presence || sections["Product Overview"] || product.description.to_s.truncate(320),
        status: "published", published_at: Time.current, reviewed_by: "Legacy content migration",
        reviewed_at: Time.current
      )
      story.save!
      story.modules.destroy_all

      module_map = {
        "Materials and Construction" => "material_construction",
        "Safety and Certification" => "technical_detail",
        "Visor and Visibility" => "technical_detail",
        "Comfort and Interior" => "image_text_split",
        "Ventilation System" => "technical_detail",
        "Intended Rider Profile" => "usage_context",
        "What is in the Box" => "included_in_box",
        "Shipping and Warranty" => "trust_warranty"
      }
      module_map.each_with_index do |(heading, module_type), position|
        next if sections[heading].blank?

        story.modules.create!(module_type:, position:, heading:, body: sections[heading],
                              source_references: [{ type: "product_description", product_id: product.id }])
      end
      puts "Migrated Product Story for #{product.slug} (#{story.modules.count} modules)"
    end
  end
end
