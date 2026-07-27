module Spree
  class LiveVisitorPresence < Spree.base_class
    ACTIVE_WINDOW = 2.minutes
    RETENTION_WINDOW = 24.hours

    validates :session_digest, :last_seen_at, presence: true
    validates :session_digest, uniqueness: true
    validates :current_path, length: { maximum: 512 }, allow_blank: true
    validates :device_type, inclusion: { in: %w[desktop tablet mobile unknown] }

    scope :active, -> { where(last_seen_at: ACTIVE_WINDOW.ago..) }
    scope :recent_first, -> { order(last_seen_at: :desc) }

    def self.prune!
      where(last_seen_at: ...RETENTION_WINDOW.ago).delete_all
    end

    def dashboard_payload
      {
        id: session_digest.first(10),
        country: country_code.presence || "UN",
        city: city.presence || "Unknown",
        latitude: latitude&.to_f,
        longitude: longitude&.to_f,
        path: current_path,
        device: device_type,
        locale: locale,
        last_seen_at: last_seen_at.iso8601
      }
    end
  end
end
