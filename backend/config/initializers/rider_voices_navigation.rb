Rails.application.config.after_initialize do
  Spree.admin.navigation.sidebar.add :rider_voices,
                                     label: "Rider voices",
                                     url: -> { main_app.admin_rider_voices_path },
                                     icon: "message-quote",
                                     position: 45,
                                     active: -> { controller_name == "rider_voices" },
                                     if: -> { can?(:admin, :rider_voices) }
end
