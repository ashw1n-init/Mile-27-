module Spree
  class RiderModerationAction < Spree::Base
    ACTIONS = %w[approve reject hide restore flag archive lock unlock mark_spam].freeze

    belongs_to :contribution, class_name: "Spree::RiderContribution",
                              inverse_of: :moderation_actions
    belongs_to :admin_user, class_name: Spree.admin_user_class.to_s

    validates :action, inclusion: { in: ACTIONS }
  end
end
