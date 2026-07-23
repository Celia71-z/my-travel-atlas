import { useState, useEffect } from "react";
import { Feature, FeatureCollection, Point } from "geojson";

export interface GeocodingFeature extends Feature {
  geometry: Point;
  properties: {
    full_address: string;
    name: string;
    place_formatted: string;
    context: {
      country: {
        country_code: string;
        name: string;
      } | null;
      locality: {
        name: string;
      } | null;
      place: {
        name: string;
      } | null;
      region: {
        name: string;
      } | null;
    };
  };
}

export interface ReverseGeocodingResponse extends FeatureCollection {
  features: GeocodingFeature[];
  query: [number, number];
}

export type AddressData = ReverseGeocodingResponse | null;

type LocationState = {
  data: ReverseGeocodingResponse | null;
  isLoading: boolean;
  error: string | null;
};

interface UseGetLocationProps {
  lat: number;
  lng: number;
}

type NominatimReverseResponse = {
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
  address?: {
    country?: string;
    country_code?: string;
    state?: string;
    province?: string;
    region?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    borough?: string;
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    district?: string;
  };
};

const toNamedContext = (name?: string | null) => (name ? { name } : null);

const toAddressData = (
  data: NominatimReverseResponse,
  lng: number,
  lat: number
): ReverseGeocodingResponse => {
  const address = data.address ?? {};
  const countryCode = address.country_code?.toUpperCase() ?? "";
  const place =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    null;
  const locality =
    address.suburb ??
    address.neighbourhood ??
    address.city_district ??
    address.district ??
    address.borough ??
    null;
  const region =
    address.state ?? address.province ?? address.region ?? address.county ?? null;
  const fullAddress = data.display_name ?? "";

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        properties: {
          full_address: fullAddress,
          name: data.name ?? place ?? fullAddress,
          place_formatted: fullAddress,
          context: {
            country:
              address.country || countryCode
                ? {
                    country_code: countryCode,
                    name: address.country ?? countryCode,
                  }
                : null,
            locality: toNamedContext(locality),
            place: toNamedContext(place),
            region: toNamedContext(region),
          },
        },
      },
    ],
    query: [lng, lat],
  };
};

export const useGetAddress = ({ lat, lng }: UseGetLocationProps) => {
  const [state, setState] = useState<LocationState>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setState({ data: null, isLoading: false, error: null });
        return;
      }

      if (lat === 0 && lng === 0) {
        setState({ data: null, isLoading: false, error: null });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const url = new URL("https://nominatim.openstreetmap.org/reverse");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("lat", String(lat));
        url.searchParams.set("lon", String(lng));
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("accept-language", "en");

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NominatimReverseResponse = await response.json();
        setState({ data: toAddressData(data, lng, lat), isLoading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch location",
        });
      }
    };

    fetchLocation();
  }, [lat, lng]);

  return state;
};
