# frozen_string_literal: true

class CreateProductStories < ActiveRecord::Migration[8.1]
  def change
    create_table :spree_product_stories do |t|
      t.references :product, null: false, foreign_key: { to_table: :spree_products }, index: false
      t.string :title, null: false
      t.string :eyebrow
      t.text :introduction
      t.string :theme, null: false, default: "whiteout"
      t.string :status, null: false, default: "draft"
      t.string :locale, null: false, default: "en"
      t.string :reviewed_by
      t.datetime :reviewed_at
      t.datetime :published_at
      t.timestamps
    end
    add_index :spree_product_stories, %i[product_id locale], unique: true
    add_index :spree_product_stories, %i[status published_at]

    create_table :spree_product_story_modules do |t|
      t.references :product_story, null: false, foreign_key: { to_table: :spree_product_stories }
      t.string :module_type, null: false
      t.integer :position, null: false, default: 0
      t.string :heading
      t.string :subheading
      t.text :body
      t.string :layout
      t.string :background_style, null: false, default: "surface"
      t.string :visibility, null: false, default: "visible"
      t.jsonb :media, null: false, default: []
      t.jsonb :callouts, null: false, default: []
      t.jsonb :product_relations, null: false, default: []
      t.jsonb :source_references, null: false, default: []
      t.jsonb :mobile_configuration, null: false, default: {}
      t.jsonb :configuration, null: false, default: {}
      t.timestamps
    end
    add_index :spree_product_story_modules, %i[product_story_id position], name: "idx_story_modules_order"
  end
end
