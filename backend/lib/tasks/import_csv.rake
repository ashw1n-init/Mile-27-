# frozen_string_literal: true

namespace :spree do
  namespace :import do
    desc 'Import products from a CSV file (auto-detects format, or specify format: shopify, woocommerce)'
    task :csv, [:file_path, :format] => :environment do |_t, args|
      file_path = args[:file_path]
      format = args[:format]

      if file_path.blank?
        puts "Usage: bin/rails spree:import:csv[file_path,format]"
        puts "Example: bin/rails spree:import:csv[tmp/products.csv,shopify]"
        next
      end

      unless File.exist?(file_path)
        puts "Error: File '#{file_path}' not found."
        next
      end

      puts "Starting CSV product import from: #{file_path}..."
      result = CSVImporters::AutoImporter.import(file_path, format)

      puts "Import completed using format [#{result[:format].to_s.upcase}]."
      puts "Products created/updated: #{result[:stats][:products_created]}"
      puts "Variants created/updated: #{result[:stats][:variants_created]}"
      puts "Errors encountered: #{result[:stats][:errors_count]}"

      if result[:errors].any?
        puts "\nErrors:"
        result[:errors].each { |err| puts " - #{err}" }
      end
    end

    desc 'Import products from a Shopify CSV file'
    task :shopify, [:file_path] => :environment do |_t, args|
      Rake::Task['spree:import:csv'].invoke(args[:file_path], 'shopify')
    end

    desc 'Import products from a WooCommerce CSV file'
    task :woocommerce, [:file_path] => :environment do |_t, args|
      Rake::Task['spree:import:csv'].invoke(args[:file_path], 'woocommerce')
    end
  end
end
