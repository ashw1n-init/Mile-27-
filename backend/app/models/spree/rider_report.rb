module Spree
  class RiderReport < Spree::Base
    REASONS = %w[spam abuse privacy misinformation unsafe_content other].freeze

    belongs_to :contribution, class_name: "Spree::RiderContribution",
                              inverse_of: :reports
    belongs_to :user

    enum :status, { open: "open", resolved: "resolved", dismissed: "dismissed" },
         validate: true
    validates :reason, inclusion: { in: REASONS }
    validates :user_id, uniqueness: { scope: :contribution_id }
  end
end
