# frozen_string_literal: true

RSpec.describe "Store rider voices API", type: :request do
  let(:product) { create(:product, store: @default_store) }
  let(:user) { create(:user) }

  def authorization_header(for_user)
    secret = Spree::Api::Config[:jwt_secret_key].presence ||
      Rails.application.credentials.jwt_secret_key ||
      ENV["JWT_SECRET_KEY"] ||
      Rails.application.secret_key_base
    token = JWT.encode(
      {
        user_id: for_user.id,
        user_type: "customer",
        iss: "spree",
        aud: "store_api",
        exp: 1.hour.from_now.to_i
      },
      secret,
      "HS256"
    )
    { "Authorization" => "Bearer #{token}" }
  end

  it "returns genuine zero aggregates when no reviews are published" do
    get "/api/v3/store/products/#{product.id}/rider_voices"

    expect(response).to have_http_status(:ok)
    payload = response.parsed_body
    expect(payload["data"]).to eq([])
    expect(payload.dig("meta", "summary", "review_count")).to eq(0)
    expect(payload.dig("meta", "summary", "average_rating")).to be_nil
  end

  it "exposes published reviews and excludes pending content" do
    published = Spree::RiderContribution.create!(
      product:,
      contribution_type: :review,
      status: :published,
      display_name: "Published Rider",
      title: "Clear at speed",
      body: "The visor stayed clear during a wet highway ride and the seal felt secure.",
      rating: 5
    )
    Spree::RiderContribution.create!(
      product:,
      contribution_type: :review,
      status: :pending,
      display_name: "Pending Rider",
      body: "This contribution is still waiting for a moderation decision.",
      rating: 3
    )

    get "/api/v3/store/products/#{product.id}/rider_voices"

    payload = response.parsed_body
    expect(payload["data"].pluck("id")).to eq([published.id.to_s])
    expect(payload.dig("meta", "summary", "review_count")).to eq(1)
    expect(payload.dig("meta", "summary", "average_rating")).to eq(5.0)
  end

  it "accepts authenticated submissions as pending without trusting verified status" do
    post(
      "/api/v3/store/products/#{product.id}/rider_voices",
      params: {
        contribution_type: "review",
        title: "Track day notes",
        body: "The helmet stayed planted through fast corners and the ventilation remained effective.",
        rating: 4,
        display_name: "Circuit Rider",
        verified_purchase: true
      },
      headers: authorization_header(user)
    )

    expect(response).to have_http_status(:created)
    contribution = Spree::RiderContribution.order(:created_at).last
    expect(contribution).to be_pending
    expect(contribution).not_to be_verified_purchase
    expect(contribution.user).to eq(user)
  end
end
