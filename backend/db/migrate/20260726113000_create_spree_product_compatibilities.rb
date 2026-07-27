# frozen_string_literal: true

class CreateSpreeProductCompatibilities < ActiveRecord::Migration[7.2]
  def change
    create_table :spree_product_compatibilities do |t|
      t.references :source_product, null: false, foreign_key: { to_table: :spree_products }
      t.references :compatible_product, null: false, foreign_key: { to_table: :spree_products }
      t.string :role, null: false, default: "completes_kit"
      t.string :rationale, null: false
      t.integer :position, null: false, default: 0
      t.boolean :active, null: false, default: true
      t.timestamps
    end

    add_index :spree_product_compatibilities,
              %i[source_product_id compatible_product_id role],
              unique: true,
              name: "idx_spree_product_compatibilities_unique"
  end
end
