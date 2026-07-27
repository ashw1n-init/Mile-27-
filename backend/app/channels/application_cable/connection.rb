module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_admin_user

    def connect
      self.current_admin_user = env["warden"]&.user(:spree_admin_user) || reject_unauthorized_connection
    end
  end
end
