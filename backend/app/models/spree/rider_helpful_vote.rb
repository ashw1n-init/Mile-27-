module Spree
  class RiderHelpfulVote < Spree::Base
    belongs_to :contribution, class_name: "Spree::RiderContribution",
                              counter_cache: :helpful_count,
                              inverse_of: :helpful_votes
    belongs_to :user

    validates :user_id, uniqueness: { scope: :contribution_id }
  end
end
