# frozen_string_literal: true

require 'csv'

puts "=== Curating ~300 products from spree_catalogue_final.csv & by_brand files ==="

selected_rows = []
selected_slugs = Set.new

major_brands = [
  'AGV', 'Alpinestars', 'Arai', 'Dainese', 'HJC', 'Shoei', 'Sena', 'Akrapovic',
  'Brembo', 'Arrow', 'Cardo', 'Icon', 'Kriega', 'Leatt', 'LS2', 'Nolan', 'Puig',
  'R&G', 'Revit', 'Rizoma', 'Rukka', 'Scorpion', 'Shark', 'Sidi', 'TCX', 'Yoshimura',
  'Evotech Performance', 'GIVI', 'SW-Motech', 'SC Project', 'Biltwell', 'Forma'
]

# Helper to process a row
process_row = lambda do |row, max_per_brand|
  brand = row['brand'].to_s.strip
  slug = row['slug'].presence || row['name'].to_s.parameterize
  next if slug.blank?
  next if selected_slugs.include?(slug)
  next if row['images'].blank? # Ensure product has image!

  selected_slugs.add(slug)
  selected_rows << row
end

# 1. Read from by_brand CSVs for guaranteed top major brand products with images
by_brand_dir = File.expand_path('../by_brand', __dir__)
if Dir.exist?(by_brand_dir)
  major_brands.each do |brand_name|
    # Look for matching CSV file
    file_pattern = File.join(by_brand_dir, "#{brand_name}*.csv")
    matching_files = Dir.glob(file_pattern)
    
    matching_files.each do |file_path|
      begin
        b_rows = CSV.read(file_path, headers: true, encoding: 'bom|utf-8')
        count = 0
        b_rows.each do |r|
          break if count >= 10
          slug = r['slug'].presence || r['name'].to_s.parameterize
          next if slug.blank? || selected_slugs.include?(slug)
          next if r['images'].blank?

          selected_slugs.add(slug)
          selected_rows << r
          count += 1
        end
      rescue StandardError => e
        puts "Skipping #{file_path}: #{e.message}"
      end
    end
  end
end

puts "Selected from by_brand CSVs: #{selected_rows.size} products."

# 2. Read from spree_catalogue_final.csv for additional brand & category balance
catalogue_path = 'spree_catalogue_final.csv'
if File.exist?(catalogue_path) && selected_rows.size < 300
  rows = CSV.read(catalogue_path, headers: true, encoding: 'bom|utf-8')
  
  # Ensure all major brands get up to 10 products
  major_brands.each do |mb|
    mb_lower = mb.downcase
    b_rows = rows.select { |r| r['brand'].to_s.strip.downcase == mb_lower }
    b_rows.each do |r|
      break if selected_rows.count { |x| x['brand'].to_s.strip.downcase == mb_lower } >= 10
      slug = r['slug'].presence || r['name'].to_s.parameterize
      next if slug.blank? || selected_slugs.include?(slug)
      next if r['images'].blank?

      selected_slugs.add(slug)
      selected_rows << r
    end
  end

  # Group by primary_taxon_path to ensure category balance
  cat_groups = rows.group_by { |r| r['primary_taxon_path'].presence || 'General' }
  cat_groups.each do |_cat, c_rows|
    break if selected_rows.size >= 300
    c_rows.each do |r|
      break if selected_rows.size >= 300
      slug = r['slug'].presence || r['name'].to_s.parameterize
      next if slug.blank? || selected_slugs.include?(slug)
      next if r['images'].blank?

      selected_slugs.add(slug)
      selected_rows << r
    end
  end
end

# Trim to exactly 300 products
final_300 = selected_rows.first(300)
puts "Final curated dataset size: #{final_300.size} products with images."

# Save to curated_major_300.csv
curated_file = 'curated_major_300.csv'
CSV.open(curated_file, 'w', headers: final_300.first.headers, write_headers: true) do |csv|
  final_300.each { |r| csv << r }
end
puts "Saved #{curated_file}."

# 3. Wipe database completely
puts "\n=== Step 2: Wiping ALL old products, taxons, variants, images and cache ==="
ActiveRecord::Base.transaction do
  Spree::Classification.unscoped.delete_all rescue nil
  Spree::ProductOptionType.unscoped.delete_all rescue nil
  Spree::ProductPublication.unscoped.delete_all rescue nil if defined?(Spree::ProductPublication)
  Spree::ProductProperty.unscoped.delete_all rescue nil
  Spree::Price.unscoped.delete_all rescue nil
  Spree::StockItem.unscoped.delete_all rescue nil

  ActiveStorage::Attachment.where(record_type: ['Spree::Image', 'Spree::Asset', 'Spree::Variant', 'Spree::Product']).delete_all rescue nil

  Spree::Image.unscoped.delete_all rescue nil
  Spree::Variant.unscoped.delete_all rescue nil
  Spree::Product.unscoped.delete_all rescue nil

  Spree::Taxon.unscoped.delete_all rescue nil
  Spree::Taxonomy.unscoped.delete_all rescue nil
  Spree::OptionValue.unscoped.delete_all rescue nil
  Spree::OptionType.unscoped.delete_all rescue nil
end

Rails.cache.clear rescue nil
puts "Database clean. Product count: #{Spree::Product.count}"

# 4. Import curated_major_300.csv
puts "\n=== Step 3: Importing #{curated_file} ==="
result = CSVImporters::AutoImporter.import(curated_file, :catalogue)

puts "\n=== Import Summary ==="
puts "Products Created: #{result[:stats][:products_created]}"
puts "Variants Created: #{result[:stats][:variants_created]}"
puts "Errors: #{result[:stats][:errors_count]}"

if result[:errors].any?
  puts "\nSample Errors:"
  result[:errors].take(5).each { |err| puts " - #{err}" }
end

puts "\n=== Final Database Summary ==="
puts "Total Products: #{Spree::Product.count}"
puts "Total Variants: #{Spree::Variant.count}"
puts "Total Images: #{Spree::Image.count}"
puts "Products with Images: #{Spree::Product.joins(master: :images).distinct.count}"
puts "Total Brands: #{Spree::Taxonomy.find_by(name: 'Brands')&.taxons&.count || 0}"
puts "Total Categories: #{Spree::Taxonomy.find_by(name: 'Categories')&.taxons&.count || 0}"
