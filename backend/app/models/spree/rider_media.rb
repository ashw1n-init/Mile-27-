module Spree
  class RiderMedia < Spree::Base
    TYPES = %w[image video audio].freeze
    STATUSES = %w[pending processing published rejected].freeze
    MAX_BYTES = {
      "image" => 12.megabytes,
      "video" => 150.megabytes,
      "audio" => 30.megabytes
    }.freeze
    CONTENT_TYPES = {
      "image" => %w[image/jpeg image/png image/webp],
      "video" => %w[video/mp4 video/webm],
      "audio" => %w[audio/mpeg audio/mp4 audio/wav audio/webm]
    }.freeze

    belongs_to :contribution, class_name: "Spree::RiderContribution",
                              inverse_of: :media
    has_one_attached :file

    enum :media_type, TYPES.index_by(&:itself), validate: true
    enum :status, STATUSES.index_by(&:itself), validate: true

    validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
    validate :acceptable_file

    private

    def acceptable_file
      return unless file.attached? && media_type.present?

      blob = file.blob
      allowed_types = CONTENT_TYPES.fetch(media_type, [])
      errors.add(:file, "type is not supported") unless allowed_types.include?(blob.content_type)
      detected_type = blob.open { |uploaded_file| Marcel::MimeType.for(uploaded_file, name: blob.filename.to_s) }
      errors.add(:file, "signature does not match its declared type") unless allowed_types.include?(detected_type)
      errors.add(:file, "is too large") if blob.byte_size > MAX_BYTES.fetch(media_type)
      errors.add(:file, "has an unsafe filename") if blob.filename.to_s.match?(/[<>:"|?*\x00-\x1f]/)
    end
  end
end
