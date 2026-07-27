module Spree
  module Admin
    class LiveVisitorsController < BaseController
      def index
        authorize! :admin, Spree::Order
        visitors = Spree::LiveVisitorPresence.active.recent_first.limit(250)
        render json: {
          active_count: visitors.size,
          visitors: visitors.map(&:dashboard_payload),
          generated_at: Time.current.iso8601
        }
      end
    end
  end
end
