# frozen_string_literal: true

require 'csv'
require 'open-uri'
require 'timeout'

module CSVImporters
  class BaseImporter
    attr_reader :file_path, :options, :stats, :errors

    def initialize(file_path, options = {})
      @file_path = file_path
      @options = options
      @stats = { products_created: 0, variants_created: 0, errors_count: 0 }
      @errors = []
    end

    def default_store
      @default_store ||= Spree::Store.default
    end

    def default_channels
      @default_channels ||= Spree::Channel.all.to_a
    end

    def default_currency
      @default_currency ||= default_store&.default_currency || 'USD'
    end

    def default_stock_location
      @default_stock_location ||= Spree::StockLocation.first_or_create!(
        name: 'Default',
        default: true,
        admin_name: 'Default'
      )
    end

    def publish_product(product)
      default_channels.each do |channel|
        product.product_publications.find_or_create_by!(channel: channel) do |pub|
          pub.published_at = Time.current
        end
      end
    end

    def find_or_create_taxon(taxonomy_name, taxon_path)
      return nil if taxon_path.blank?

      taxonomy = Spree::Taxonomy.find_or_create_by!(name: taxonomy_name, store: default_store)
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

    def find_or_create_option_type(name, presentation = nil)
      presentation ||= name.to_s.humanize
      Spree::OptionType.find_or_create_by!(name: name.to_s.parameterize) do |ot|
        ot.presentation = presentation
      end
    end

    def find_or_create_option_value(option_type, name, presentation = nil)
      presentation ||= name.to_s
      option_type.option_values.find_or_create_by!(name: name.to_s.parameterize) do |ov|
        ov.presentation = presentation
      end
    end

    def set_variant_price(variant, amount, currency = nil)
      return if amount.blank?

      currency ||= default_currency
      price = variant.prices.find_or_initialize_by(currency: currency)
      price.amount = amount.to_d
      price.save!
    end

    def set_variant_stock(variant, quantity)
      return if quantity.blank?

      stock_item = default_stock_location.stock_items.find_or_initialize_by(variant: variant)
      stock_item.count_on_hand = quantity.to_i
      stock_item.save!
    end

    def attach_image_url(product_or_variant, image_url, alt_text = nil)
      return if image_url.blank?
      return if options[:skip_images]

      begin
        parsed_uri = URI.parse(image_url)
        filename = File.basename(parsed_uri.path)
        filename = "image_#{SecureRandom.hex(4)}.jpg" if filename.blank? || !filename.include?('.')

        Timeout.timeout(10) do
          downloaded_file = URI.open(image_url, 'User-Agent' => 'Mozilla/5.0')
          img = product_or_variant.images.build
          img.attachment.attach(
            io: downloaded_file,
            filename: filename,
            content_type: downloaded_file.content_type || 'image/jpeg'
          )
          img.alt = alt_text if alt_text.present?
          img.save!
        end
      rescue StandardError => e
        Rails.logger.warn("Image attachment skipped for #{image_url}: #{e.message}")
      end
    end
  end
end
