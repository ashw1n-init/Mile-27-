module Spree
  module Admin
    class RiderVoicesController < Spree::Admin::BaseController
      include Pagy::Method

      before_action :load_contribution, only: %i[show moderate]

      def index
        scope = Spree::RiderContribution.includes(:product, :user, :media, :reports)
        scope = scope.where(status: params[:status]) if params[:status].present?
        scope = scope.where(contribution_type: params[:type]) if params[:type].present?
        if params[:q].present?
          query = "%#{ActiveRecord::Base.sanitize_sql_like(params[:q])}%"
          scope = scope.where("spree_rider_contributions.body ILIKE :query OR spree_rider_contributions.title ILIKE :query", query:)
        end
        @pagy, @rider_voices = pagy(scope.order(created_at: :desc), limit: 30)
      end

      def show; end

      def moderate
        moderation_action = params.require(:moderation_action)
        previous_status = @rider_voice.status
        new_status = status_for(moderation_action) || previous_status

        Spree::RiderContribution.transaction do
          @rider_voice.update!(
            status: new_status,
            featured: params[:featured] == "1",
            highlighted_quote: params[:highlighted_quote],
            locked: lock_value(moderation_action, @rider_voice.locked)
          )
          moderate_media!(moderation_action)
          @rider_voice.moderation_actions.create!(
            admin_user: try_spree_current_user,
            action: moderation_action,
            previous_status:,
            new_status: @rider_voice.status,
            note: params[:note]
          )
        end

        flash[:success] = "Rider contribution updated"
        redirect_to main_app.admin_rider_voice_path(@rider_voice)
      rescue ActiveRecord::RecordInvalid => e
        flash.now[:error] = e.record.errors.full_messages.to_sentence
        render :show, status: :unprocessable_content
      end

      private

      def load_contribution
        @rider_voice = Spree::RiderContribution.includes(
          :product, :variant, :user, :reports, :moderation_actions,
          media: { file_attachment: :blob }
        ).find(params[:id])
      end

      def status_for(action)
        {
          "approve" => "published",
          "reject" => "rejected",
          "hide" => "hidden",
          "restore" => "published",
          "flag" => "flagged",
          "archive" => "archived",
          "mark_spam" => "rejected"
        }[action]
      end

      def lock_value(action, current)
        return true if action == "lock"
        return false if action == "unlock"

        current
      end

      def moderate_media!(action)
        return @rider_voice.media.update_all(status: "published", updated_at: Time.current) if action == "approve"
        return @rider_voice.media.update_all(status: "rejected", updated_at: Time.current) if %w[reject mark_spam].include?(action)

        nil
      end
    end
  end
end
