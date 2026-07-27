# frozen_string_literal: true

require_relative 'shopify_importer'
require_relative 'woo_commerce_importer'
require_relative 'catalogue_importer'

module CSVImporters
  class AutoImporter
    def self.detect_format(file_path)
      headers = CSV.open(file_path, &:readline).map(&:to_s)
      
      headers_lower = headers.map(&:downcase)

      if headers_lower.include?('migration_key') || headers_lower.include?('primary_taxon_path') || headers_lower.include?('variant_skus')
        :catalogue
      elsif headers_lower.include?('handle') && (headers_lower.include?('title') || headers_lower.include?('variant sku'))
        :shopify
      elsif headers_lower.include?('regular price') || headers_lower.include?('short description') || headers_lower.include?('attribute 1 name')
        :woocommerce
      else
        if headers.any? { |h| h =~ /option\d+ name/i || h =~ /variant /i }
          :shopify
        elsif headers.any? { |h| h =~ /categories/i || h =~ /sale price/i }
          :woocommerce
        else
          :shopify
        end
      end
    end

    def self.import(file_path, format = nil, options = {})
      format ||= detect_format(file_path)
      format = format.to_sym

      importer_class = case format
                       when :catalogue
                         CatalogueImporter
                       when :shopify
                         ShopifyImporter
                       when :woocommerce
                         WooCommerceImporter
                       else
                         raise ArgumentError, "Unsupported CSV format: #{format}. Supported formats are :catalogue, :shopify, :woocommerce"
                       end

      importer = importer_class.new(file_path, options)
      stats = importer.run
      { format: format, stats: stats, errors: importer.errors }
    end
  end
end
