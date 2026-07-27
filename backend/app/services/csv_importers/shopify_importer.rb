# frozen_string_literal: true

require_relative 'base_importer'

module CSVImporters
  class ShopifyImporter < BaseImporter
    def run
      rows = CSV.read(file_path, headers: true, encoding: 'bom|utf-8')
      
      # Group rows by Handle
      grouped = rows.group_by { |r| r['Handle'].presence || r['Title'].presence }
      total_products = grouped.keys.compact.size
      processed_count = 0

      puts "Importing #{total_products} products from Shopify CSV..."

      grouped.each do |handle, product_rows|
        next if handle.blank?

        processed_count += 1
        if processed_count % 50 == 0 || processed_count == total_products
          puts "Progress: #{processed_count}/#{total_products} products processed..."
        end

        begin
          ActiveRecord::Base.transaction do
            first_row = product_rows.first

            title = first_row['Title'].presence || handle.titleize
            description = first_row['Body (HTML)'].presence || first_row['Body'].presence || ''
            vendor = first_row['Vendor'].presence
            category = first_row['Product Category'].presence || first_row['Type'].presence
            status_str = first_row['Status'].to_s.downcase
            status = %w[active draft archived].include?(status_str) ? status_str : 'active'
            tags = first_row['Tags'].to_s.split(',').map(&:strip).reject(&:blank?)

            slug = handle.parameterize
            product = Spree::Product.find_or_initialize_by(slug: slug)
            is_new = product.new_record?

            product.assign_attributes(
              name: title,
              description: description,
              status: status,
              available_on: Time.current
            )
            product.store = default_store if product.respond_to?(:store=)

            product.save!
            publish_product(product)
            @stats[:products_created] += 1 if is_new

            # Taxons / Categories
            if category.present?
              taxon = find_or_create_taxon('Categories', category)
              product.taxons << taxon if taxon && !product.taxons.include?(taxon)
            end

            # Vendor / Brand taxon
            if vendor.present?
              brand_taxon = find_or_create_taxon('Brands', vendor)
              product.taxons << brand_taxon if brand_taxon && !product.taxons.include?(brand_taxon)
            end

            # Tags as taxons
            tags.each do |tag|
              tag_taxon = find_or_create_taxon('Tags', tag)
              product.taxons << tag_taxon if tag_taxon && !product.taxons.include?(tag_taxon)
            end

            # Identify option names
            option_names = []
            [1, 2, 3].each do |idx|
              opt_name = first_row["Option#{idx} Name"].presence
              next if opt_name.blank? || opt_name.downcase == 'title'

              opt_type = find_or_create_option_type(opt_name)
              option_names << { idx: idx, type: opt_type }
              product.option_types << opt_type unless product.option_types.include?(opt_type)
            end

            seen_images = Set.new

            # Process variants and images
            product_rows.each do |row|
              sku = row['Variant SKU'].presence
              price_amount = row['Variant Price'].presence
              qty = row['Variant Inventory Qty'].presence
              image_url = row['Image Src'].presence
              image_alt = row['Image Alt Text'].presence

              # Attach main image once per unique image URL per product
              if image_url.present? && !seen_images.include?(image_url)
                seen_images.add(image_url)
                attach_image_url(product, image_url, image_alt)
              end

              # Determine if this row defines a standalone master variant or option variant
              option_values = []
              option_names.each do |opt_info|
                opt_val_str = row["Option#{opt_info[:idx]} Value"].presence
                next if opt_val_str.blank? || opt_val_str.downcase == 'default title'

                opt_val = find_or_create_option_value(opt_info[:type], opt_val_str)
                option_values << opt_val
              end

              if option_values.empty?
                # Update master variant
                master = product.master
                master.sku = sku if sku.present?
                master.save!
                set_variant_price(master, price_amount) if price_amount.present?
                set_variant_stock(master, qty) if qty.present?
              else
                # Variant with options
                variant = product.variants.find_or_initialize_by(sku: sku) if sku.present?
                variant ||= product.variants.build

                variant.option_values = option_values
                variant.save!
                set_variant_price(variant, price_amount) if price_amount.present?
                set_variant_stock(variant, qty) if qty.present?
                @stats[:variants_created] += 1
              end
            end
          end
        rescue StandardError => e
          @stats[:errors_count] += 1
          @errors << "Product '#{handle}': #{e.message}"
          Rails.logger.error("Shopify Importer Error [#{handle}]: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
        end
      end

      stats
    end
  end
end
