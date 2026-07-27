# frozen_string_literal: true

RSpec.describe Spree::RiderContribution, type: :model do
  let(:product) { create(:product, store: @default_store) }
  let(:user) { create(:user) }

  def build_review(attributes = {})
    described_class.new(
      {
        product:,
        user:,
        contribution_type: :review,
        status: :pending,
        display_name: "Track Rider",
        title: "Stable at speed",
        body: "The helmet stayed stable and comfortable throughout a long highway ride.",
        rating: 4
      }.merge(attributes)
    )
  end

  it "requires ratings for reviews" do
    review = build_review(rating: nil)

    expect(review).not_to be_valid
    expect(review.errors[:rating]).to be_present
  end

  it "does not permit ratings on questions" do
    question = build_review(
      contribution_type: :question,
      rating: 5,
      title: "Intercom fit",
      body: "Is there enough space behind the liner for intercom speakers?"
    )

    expect(question).not_to be_valid
    expect(question.errors[:rating]).to be_present
  end

  it "publishes with a timestamp" do
    review = build_review
    review.save!

    review.publish!

    expect(review).to be_published
    expect(review.published_at).to be_present
    expect(described_class.published).to include(review)
  end

  it "prevents duplicate reviews for the same customer and product" do
    build_review.save!
    duplicate = build_review(title: "A second review")

    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:user_id]).to be_present
  end

  it "keeps replies attached to the same product" do
    review = build_review
    review.save!
    reply = described_class.new(
      parent: review,
      contribution_type: :reply,
      display_name: "Another Rider",
      body: "Did the cheek pads loosen after the first few rides?"
    )

    expect(reply).to be_valid
    expect(reply.product).to eq(product)
  end
end
