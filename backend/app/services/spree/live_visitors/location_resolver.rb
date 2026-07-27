module Spree
  module LiveVisitors
    class LocationResolver
      COUNTRY_CENTROIDS = {
        "IN" => [20.5937, 78.9629], "AE" => [23.4241, 53.8478], "US" => [37.0902, -95.7129],
        "GB" => [55.3781, -3.4360], "CA" => [56.1304, -106.3468], "AU" => [-25.2744, 133.7751],
        "DE" => [51.1657, 10.4515], "FR" => [46.2276, 2.2137], "IT" => [41.8719, 12.5674],
        "SG" => [1.3521, 103.8198], "MY" => [4.2105, 101.9758], "JP" => [36.2048, 138.2529],
        "SA" => [23.8859, 45.0792], "QA" => [25.3548, 51.1839], "KW" => [29.3117, 47.4818]
      }.freeze

      def initialize(headers:, fallback_country: nil)
        @headers = headers
        @fallback_country = fallback_country
      end

      def call
        country = header("HTTP_X_VERCEL_IP_COUNTRY", "HTTP_CF_IPCOUNTRY") || @fallback_country
        latitude = decimal_header("HTTP_X_VERCEL_IP_LATITUDE", -90, 90)
        longitude = decimal_header("HTTP_X_VERCEL_IP_LONGITUDE", -180, 180)
        latitude, longitude = COUNTRY_CENTROIDS[country]&.then { |pair| pair } if latitude.nil? || longitude.nil?

        {
          country_code: normalize_country(country),
          city: decode_city(header("HTTP_X_VERCEL_IP_CITY", "HTTP_CF_IPCITY")),
          latitude:,
          longitude:
        }
      end

      private

      def header(*keys)
        keys.filter_map { |key| @headers[key].presence }.first
      end

      def decimal_header(key, minimum, maximum)
        value = @headers[key].presence
        return if value.blank?

        Float(value).clamp(minimum, maximum)
      rescue ArgumentError, TypeError
        nil
      end

      def normalize_country(value)
        code = value.to_s.upcase
        code.match?(/\A[A-Z]{2}\z/) ? code : nil
      end

      def decode_city(value)
        return if value.blank?

        CGI.unescape(value.to_s).truncate(80)
      rescue ArgumentError
        nil
      end
    end
  end
end
