module Spree
  module Api
    module V3
      module Store
        class LivePresencesController < Spree::Api::V3::Store::BaseController
          skip_before_action :authenticate_user, raise: false

          def create
            session_key = params[:session_id].to_s
            return head :unprocessable_entity unless session_key.match?(/\A[a-zA-Z0-9_-]{20,80}\z/)

            digest = OpenSSL::Digest::SHA256.hexdigest(session_key)
            return head :accepted unless Rails.cache.write("live-presence/#{digest}", true, expires_in: 8.seconds, unless_exist: true)

            location = Spree::LiveVisitors::LocationResolver.new(
              headers: request.headers,
              fallback_country: params[:country]
            ).call

            presence = Spree::LiveVisitorPresence.find_or_initialize_by(session_digest: digest)
            presence.assign_attributes(
              **location,
              current_path: params[:path].to_s.first(512),
              device_type: normalized_device,
              locale: params[:locale].to_s.first(12),
              last_seen_at: Time.current
            )
            presence.save!

            ActionCable.server.broadcast("spree:admin:live_visitors", {
              type: "presence",
              visitor: presence.dashboard_payload,
              active_count: Spree::LiveVisitorPresence.active.count
            })

            Spree::LiveVisitorPresence.prune! if rand(100).zero?
            head :accepted
          end

          private

          def normalized_device
            value = params[:device].to_s
            %w[desktop tablet mobile].include?(value) ? value : "unknown"
          end
        end
      end
    end
  end
end
