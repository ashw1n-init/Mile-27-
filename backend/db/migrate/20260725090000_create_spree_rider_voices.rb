class CreateSpreeRiderVoices < ActiveRecord::Migration[8.1]
  def change
    create_table :spree_rider_contributions do |t|
      t.references :product, null: false, foreign_key: { to_table: :spree_products }
      t.references :user, foreign_key: { to_table: :spree_users }
      t.references :variant, foreign_key: { to_table: :spree_variants }
      t.references :line_item, foreign_key: { to_table: :spree_line_items }
      t.references :parent, foreign_key: { to_table: :spree_rider_contributions }
      t.string :contribution_type, null: false
      t.string :status, null: false, default: "pending"
      t.string :title
      t.text :body, null: false
      t.text :highlighted_quote
      t.integer :rating
      t.boolean :verified_purchase, null: false, default: false
      t.boolean :featured, null: false, default: false
      t.boolean :locked, null: false, default: false
      t.string :display_name, null: false
      t.string :rider_type
      t.string :usage_type
      t.string :ownership_duration
      t.string :fit_feedback
      t.string :head_shape
      t.string :comfort
      t.string :noise
      t.string :ventilation
      t.string :locale, null: false, default: "en"
      t.integer :helpful_count, null: false, default: 0
      t.integer :replies_count, null: false, default: 0
      t.datetime :published_at
      t.datetime :edited_at
      t.datetime :deleted_at
      t.timestamps
    end

    add_index :spree_rider_contributions, [:product_id, :status, :published_at],
              name: :index_rider_voices_public_stream
    add_index :spree_rider_contributions, [:product_id, :contribution_type, :status],
              name: :index_rider_voices_product_kind
    add_index :spree_rider_contributions, [:user_id, :product_id, :contribution_type],
              name: :index_rider_voices_author_product
    add_index :spree_rider_contributions, [:user_id, :product_id],
              unique: true,
              where: "user_id IS NOT NULL AND contribution_type IN ('review', 'rider_story') AND deleted_at IS NULL",
              name: :index_one_rider_review_per_product

    create_table :spree_rider_media do |t|
      t.references :contribution, null: false,
                                  foreign_key: { to_table: :spree_rider_contributions }
      t.string :media_type, null: false
      t.string :status, null: false, default: "pending"
      t.string :caption
      t.string :alt_text
      t.text :transcript
      t.integer :position, null: false, default: 0
      t.integer :width
      t.integer :height
      t.integer :duration_seconds
      t.timestamps
    end

    create_table :spree_rider_helpful_votes do |t|
      t.references :contribution, null: false,
                                  foreign_key: { to_table: :spree_rider_contributions }
      t.references :user, null: false, foreign_key: { to_table: :spree_users }
      t.timestamps
    end
    add_index :spree_rider_helpful_votes, [:contribution_id, :user_id],
              unique: true, name: :index_rider_votes_uniqueness

    create_table :spree_rider_reports do |t|
      t.references :contribution, null: false,
                                  foreign_key: { to_table: :spree_rider_contributions }
      t.references :user, null: false, foreign_key: { to_table: :spree_users }
      t.string :reason, null: false
      t.text :details
      t.string :status, null: false, default: "open"
      t.timestamps
    end
    add_index :spree_rider_reports, [:contribution_id, :user_id],
              unique: true, name: :index_rider_reports_uniqueness

    create_table :spree_rider_moderation_actions do |t|
      t.references :contribution, null: false,
                                  foreign_key: { to_table: :spree_rider_contributions }
      t.references :admin_user, null: false, foreign_key: { to_table: :spree_admin_users }
      t.string :action, null: false
      t.string :previous_status
      t.string :new_status
      t.text :note
      t.timestamps
    end
  end
end
