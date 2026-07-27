module Spree
  module ProductRiderVoicesDecorator
    def self.prepended(base)
      base.has_many :rider_contributions,
                    class_name: "Spree::RiderContribution",
                    dependent: :restrict_with_error,
                    inverse_of: :product
    end
  end
end
