class CreateSpreeLiveVisitorPresences < ActiveRecord::Migration[8.1]
  def change
    create_table :spree_live_visitor_presences do |t|
      t.string :session_digest, null: false
      t.string :country_code, limit: 2
      t.string :city
      t.decimal :latitude, precision: 9, scale: 6
      t.decimal :longitude, precision: 9, scale: 6
      t.string :current_path, limit: 512
      t.string :device_type, limit: 24
      t.string :locale, limit: 12
      t.datetime :last_seen_at, null: false
      t.timestamps
    end

    add_index :spree_live_visitor_presences, :session_digest, unique: true
    add_index :spree_live_visitor_presences, :last_seen_at
    add_index :spree_live_visitor_presences, %i[country_code last_seen_at]
  end
end
