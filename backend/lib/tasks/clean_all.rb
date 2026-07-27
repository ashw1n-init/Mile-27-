# frozen_string_literal: true

puts "=== Wiping ALL products (including soft-deleted), variants, images, taxons and cache ==="

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

puts "Unscoped Product count: #{Spree::Product.unscoped.count}"
puts "Unscoped Variant count: #{Spree::Variant.unscoped.count}"
puts "Unscoped Image count: #{Spree::Image.unscoped.count}"
puts "Unscoped Taxon count: #{Spree::Taxon.unscoped.count}"
