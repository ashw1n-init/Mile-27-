# frozen_string_literal: true

require_relative 'base_importer'

module CSVImporters
  class WooCommerceImporter < BaseImporter
    def run
      rows = CSV.read(file_path, headers: true, encoding: 'bom|utf-8')

      # Separate parent products (simple, variable) from variation rows
      parents = []
      variations = []

      rows.each do |row|
        type = row['Type'].to_s.downcase.strip
        if type == 'variation'
          variations << row
        else
          parents << row
        end
      end

      # 1. Process parent products
      parent_map = {} # Maps parent SKU or Name -> Spree::Product

      parents.each do |row|
        sku = row['SKU'].presence
        name = row['Name'].presence || 'Untitled Product'
        description = row['Description'].presence || row['Short description'].presence || ''
        status = row['Published'].to_s.strip == '1' ? 'active' : 'draft'
        regular_price = row['Regular price'].presence || row['Sale price'].presence
        stock = row['Stock'].presence
        categories_str = row['Categories'].presence
        images_str = row['Images'].presence

        begin
          ActiveRecord::Base.transaction do
            slug = name.parameterize
            slug = "prod-#{SecureRandom.hex(4)}" if slug.blank?

            product = Spree::Product.find_or_initialize_by(slug: slug)
            is_new = product.new_record?

            product.assign_attributes(
              name: name,
              description: description,
              status: status,
              available_on: Time.current
            )
            product.store = default_store if product.respond_to?(:store=)

            product.save!
            publish_product(product)
            @stats[:products_created] += 1 if is_new

            key = sku.presence || name
            parent_map[key] = product
            parent_map[sku] = product if sku.present?

            # Set Master Variant price and SKU
            master = product.master
            master.sku = sku if sku.present?
            master.save!
            set_variant_price(master, regular_price) if regular_price.present?
            set_variant_stock(master, stock) if stock.present?

            # Categories (e.g. "Clothing > Tops, Accessories")
            if categories_str.present?
              categories_str.split(',').each do |cat_path|
                taxon = find_or_create_taxon('Categories', cat_path.strip)
                product.taxons << taxon if taxon && !product.taxons.include?(taxon)
              end
            end

            # Images (comma-separated URLs)
            if images_str.present?
              images_str.split(',').each do |img_url|
                attach_image_url(product, img_url.strip)
              end
            end
          end
        rescue StandardError => e
          @stats[:errors_count] += 1
          @errors << "WooCommerce Product '#{name}': #{e.message}"
          Rails.logger.error("WooCommerce Importer Error [#{name}]: #{e.message}")
        end
      end

      # 2. Process variations
      variations.each do |row|
        parent_ref = row['Parent'].presence
        sku = row['SKU'].presence
        price_amount = row['Sale price'].presence || row['Regular price'].presence
        stock = row['Stock'].presence
        images_str = row['Images'].presence

        next if parent_ref.blank?

        product = parent_map[parent_ref]
        unless product
          # Fallback lookup by SKU or Name in DB
          product = Spree::Product.joins(:master).find_by(spree_variants: { sku: parent_ref }) ||
                    Spree::Product.find_by(name: parent_ref)
        end

        next unless product

        begin
          ActiveRecord::Base.transaction do
            # Extract attribute option values
            option_values = []
            row.headers.each do |h|
              next unless h.to_s.start_with?('Attribute') && h.to_s.include?('name')

              attr_num = h.scan(/\d+/).first
              next unless attr_num

              attr_name = row["Attribute #{attr_num} name"].presence
              attr_val_str = row["Attribute #{attr_num} value(s)"].presence || row["Attribute #{attr_num} value"].presence
              next if attr_name.blank? || attr_val_str.blank?

              opt_type = find_or_create_option_type(attr_name)
              product.option_types << opt_type unless product.option_types.include?(opt_type)

              opt_val = find_or_create_option_value(opt_type, attr_val_str)
              option_values << opt_val
            end

            variant = product.variants.find_or_initialize_by(sku: sku) if sku.present?
            variant ||= product.variants.build

            variant.option_values = option_values unless option_values.empty?
            variant.save!
            set_variant_price(variant, price_amount) if price_amount.present?
            set_variant_stock(variant, stock) if stock.present?
            @stats[:variants_created] += 1

            if images_str.present?
              images_str.split(',').each do |img_url|
                attach_image_url(variant, img_url.strip)
              end
            end
          end
        rescue StandardError => e
          @stats[:errors_count] += 1
          @errors << "WooCommerce Variation '#{sku}': #{e.message}"
        end
      end

      stats
    end
  end
end
