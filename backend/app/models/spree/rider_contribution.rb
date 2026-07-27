module Spree
  class RiderContribution < Spree::Base
    TYPES = %w[review rider_story question answer reply].freeze
    STATUSES = %w[draft pending published rejected flagged hidden archived].freeze
    STRUCTURED_FEEDBACK = {
      fit_feedback: %w[runs_small true_to_size runs_large],
      head_shape: %w[round intermediate_oval long_oval],
      comfort: %w[poor average good excellent],
      noise: %w[quiet moderate loud],
      ventilation: %w[poor average good excellent]
    }.freeze

    belongs_to :product
    belongs_to :user, optional: true
    belongs_to :variant, optional: true
    belongs_to :line_item, optional: true
    belongs_to :parent, class_name: "Spree::RiderContribution",
                        optional: true, counter_cache: :replies_count
    has_many :replies, class_name: "Spree::RiderContribution",
                       foreign_key: :parent_id, dependent: :restrict_with_error,
                       inverse_of: :parent
    has_many :media, -> { order(:position, :created_at) },
             class_name: "Spree::RiderMedia", dependent: :destroy,
             inverse_of: :contribution
    has_many :helpful_votes, class_name: "Spree::RiderHelpfulVote",
                             dependent: :destroy, inverse_of: :contribution
    has_many :reports, class_name: "Spree::RiderReport",
                       dependent: :destroy, inverse_of: :contribution
    has_many :moderation_actions, class_name: "Spree::RiderModerationAction",
                                  dependent: :destroy, inverse_of: :contribution

    enum :contribution_type, TYPES.index_by(&:itself), validate: true
    enum :status, STATUSES.index_by(&:itself), validate: true

    validates :body, :display_name, :locale, presence: true
    validates :body, length: { minimum: 12, maximum: 10_000 }
    validates :title, length: { maximum: 180 }, allow_blank: true
    validates :highlighted_quote, length: { maximum: 320 }, allow_blank: true
    validates :rating, inclusion: { in: 1..5 }, if: :review_content?
    validates :rating, absence: true, unless: :review_content?
    validates :user_id, uniqueness: {
      scope: :product_id,
      conditions: -> { where(contribution_type: %w[review rider_story], deleted_at: nil) },
      message: "already has a review for this product"
    }, if: -> { user_id.present? && review_content? }
    validate :structured_feedback_values
    validate :parent_matches_product
    validate :valid_parent_type
    validate :thread_depth_is_bounded

    scope :published, -> { where(status: :published).where.not(published_at: nil).where(deleted_at: nil) }
    scope :root, -> { where(parent_id: nil) }
    scope :reviews, -> { where(contribution_type: %w[review rider_story]) }
    scope :questions, -> { where(contribution_type: :question) }
    scope :with_public_associations, lambda {
      includes(:variant, media: { file_attachment: :blob }, replies: [:user])
    }

    before_validation :normalize_public_identity
    before_validation :inherit_product_from_parent
    before_save :set_publication_time

    def review_content?
      review? || rider_story?
    end

    def public_quote
      highlighted_quote.presence || body.truncate(220, separator: " ")
    end

    def publish!
      update!(status: :published, published_at: published_at || Time.current)
    end

    private

    def normalize_public_identity
      self.display_name = display_name.to_s.strip.presence ||
        user&.first_name.to_s.strip.presence ||
        "Rider"
    end

    def inherit_product_from_parent
      self.product = parent.product if parent
    end

    def set_publication_time
      self.published_at ||= Time.current if published?
      self.published_at = nil unless published?
    end

    def structured_feedback_values
      STRUCTURED_FEEDBACK.each do |attribute, allowed|
        value = public_send(attribute)
        errors.add(attribute, "is not supported") if value.present? && !allowed.include?(value)
      end
    end

    def parent_matches_product
      return unless parent && product && parent.product_id != product_id

      errors.add(:parent, "must belong to the same product")
    end

    def valid_parent_type
      return unless parent

      valid = case contribution_type
              when "answer" then parent.question?
              when "reply" then !parent.answer? || parent.parent&.question?
              else false
              end
      errors.add(:parent, "cannot contain this contribution type") unless valid
    end

    def thread_depth_is_bounded
      errors.add(:parent, "thread depth cannot exceed two levels") if parent&.parent&.parent
    end
  end
end
