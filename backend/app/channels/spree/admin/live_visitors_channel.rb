module Spree
  module Admin
    class LiveVisitorsChannel < ApplicationCable::Channel
      def subscribed
        reject unless current_admin_user&.has_spree_role?("admin")
        stream_from "spree:admin:live_visitors"
      end
    end
  end
end
