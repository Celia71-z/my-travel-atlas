import { z } from "zod";

export const geocodingSearchInputSchema = z.object({
  country: z.string().trim().min(1, "Country is required").max(100),
  city: z.string().trim().min(1, "City is required").max(100),
  place: z.string().trim().max(180).optional(),
  limit: z.number().int().min(1).max(10).default(5),
});

export type GeocodingSearchInput = z.infer<
  typeof geocodingSearchInputSchema
>;

export type GeocodingResult = {
  id: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
  country: string;
  city: string;
  place?: string;
  countryCode?: string;
  source: "nominatim";
};

export type GeocodingSearchResponse = {
  query: {
    country: string;
    city: string;
    place?: string;
  };
  result: GeocodingResult;
  results: GeocodingResult[];
};

export type NominatimSearchResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  display_name?: string;
  name?: string;
  type?: string;
  class?: string;
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
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    district?: string;
    attraction?: string;
    tourism?: string;
    amenity?: string;
    road?: string;
  };
};
