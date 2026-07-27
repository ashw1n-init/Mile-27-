# frozen_string_literal: true

require_relative 'base_importer'
require 'open-uri'
require 'timeout'

module CSVImporters
  class CatalogueImporter < BaseImporter
    def run
      rows = CSV.read(file_path, headers: true, encoding: 'bom|utf-8')
      total_products = rows.size
      puts "Starting Catalogue Import for #{total_products} products from #{file_path}..."

      old_logger_level = ActiveRecord::Base.logger&.level
      ActiveRecord::Base.logger.level = Logger::WARN if ActiveRecord::Base.logger

      @taxonomy_cache = {}
      @taxon_cache = {}
      @option_type_cache = {}
      @option_value_cache = {}

      processed_count = 0

      rows.each do |row|
        name = row['name'].presence || row['source_title'].presence
        next if name.blank?

        slug = row['slug'].presence || row['source_shopify_handle'].presence || name.parameterize
        processed_count += 1

        if processed_count % 25 == 0 || processed_count == total_products
          puts "Progress: #{processed_count}/#{total_products} products imported..."
        end

        begin
          ActiveRecord::Base.transaction do
            description = row['source_description_html'].presence || row['description'].presence || ''
            status_str = row['status'].to_s.downcase
            status = %w[active draft archived].include?(status_str) ? status_str : 'active'
            price_amount = row['price'].presence
            brand_name = row['brand'].presence
            primary_taxon_path = row['primary_taxon_path'].presence
            tags_str = row['tags'].presence

            product = Spree::Product.unscoped.find_or_initialize_by(slug: slug)
            product.deleted_at = nil if product.respond_to?(:deleted_at=)

            product.assign_attributes(
              name: name,
              description: description,
              status: status,
              meta_title: row['meta_title'].presence,
              meta_description: row['meta_description'].presence
            )
            product.store = default_store if product.respond_to?(:store=)

            product.save!
            publish_product(product)
            @stats[:products_created] += 1

            if primary_taxon_path.present?
              taxon = cached_taxon('Categories', primary_taxon_path)
              product.taxons << taxon if taxon && !product.taxons.include?(taxon)
            end

            if brand_name.present?
              brand_taxon = cached_taxon('Brands', brand_name)
              product.taxons << brand_taxon if brand_taxon && !product.taxons.include?(brand_taxon)
            end

            if tags_str.present?
              tags = tags_str.split('|').flat_map { |t| t.split(',') }.map(&:strip).reject(&:blank?).first(5)
              tags.each do |tag|
                tag_taxon = cached_taxon('Tags', tag)
                product.taxons << tag_taxon if tag_taxon && !product.taxons.include?(tag_taxon)
              end
            end

            master = product.master
            set_variant_price(master, price_amount) if price_amount.present?

            images_str = row['images'].presence
            if images_str.present? && !options[:skip_images]
              seen_urls = Set.new
              image_entries = images_str.split('||').map(&:strip).reject(&:blank?).first(3)
              image_entries.each do |entry|
                parts = entry.split('|')
                img_url = parts.first&.strip
                next if img_url.blank? || !img_url.start_with?('http')
                next if seen_urls.include?(img_url)

                seen_urls.add(img_url)
                alt_part = parts.find { |p| p.start_with?('alt:') }
                alt_text = alt_part ? alt_part.sub(/^alt:/, '').strip : nil

                attach_image_url(product, img_url, alt_text)
              end
            end

            variants_str = row['variants'].presence
            if variants_str.present?
              v_tokens = variants_str.split(' | ').map(&:strip).reject(&:blank?)

              v_tokens.each do |v_token|
                parts = v_token.split('|').map(&:strip)
                next if parts.empty?

                sku = parts.first
                option_values = []
                v_price = nil
                v_qty = nil

                parts[1..-1].each do |part|
                  if part.start_with?('price:')
                    v_price = part.sub(/^price:/, '').strip.presence
                  elsif part.start_with?('qty:')
                    v_qty = part.sub(/^qty:/, '').strip.presence
                  elsif part.include?(':')
                    opt_name, opt_val_str = part.split(':', 2).map(&:strip)
                    next if opt_name.blank? || opt_val_str.blank?
                    next if %w[compare weight barcode].include?(opt_name.downcase)

                    opt_type = cached_option_type(opt_name)
                    product.option_types << opt_type unless product.option_types.include?(opt_type)

                    opt_val = cached_option_value(opt_type, opt_val_str)
                    option_values << opt_val
                  end
                end

                if option_values.empty?
                  master.sku = sku if sku.present?
                  master.save!
                  set_variant_price(master, v_price) if v_price.present?
                  set_variant_stock(master, v_qty) if v_qty.present?
                else
                  variant = product.variants.find_or_initialize_by(sku: sku) if sku.present?
                  variant ||= product.variants.build

                  variant.option_values = option_values
                  variant.save!
                  set_variant_price(variant, v_price || price_amount) if (v_price || price_amount).present?
                  set_variant_stock(variant, v_qty) if v_qty.present?
                  @stats[:variants_created] += 1
                end
              end
            end
          end
        rescue StandardError => e
          @stats[:errors_count] += 1
          @errors << "Product '#{name}': #{e.message}"
        end
      end

      ActiveRecord::Base.logger.level = old_logger_level if ActiveRecord::Base.logger

      stats
    end

    private

    def cached_taxon(taxonomy_name, taxon_path)
      key = "#{taxonomy_name}::#{taxon_path}"
      @taxon_cache[key] ||= begin
        taxonomy = @taxonomy_cache[taxonomy_name] ||= Spree::Taxonomy.find_or_create_by!(name: taxonomy_name, store: default_store)
        parent = taxonomy.root
        taxon_names = taxon_path.is_a?(Array) ? taxon_path : taxon_path.split('>').map(&:strip)
        current_taxon = parent

        taxon_names.each do |t_name|
          next if t_name.blank?

          current_taxon = taxonomy.taxons.find_or_create_by!(
            name: t_name,
            parent: current_taxon
          )
        end
        current_taxon
      end
    end

    def cached_option_type(name)
      @option_type_cache[name] ||= find_or_create_option_type(name)
    end

    def cached_option_value(option_type, name)
      key = "#{option_type.id}::#{name}"
      @option_value_cache[key] ||= find_or_create_option_value(option_type, name)
    end
  end
end
