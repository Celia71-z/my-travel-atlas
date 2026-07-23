import "server-only";

import type {
  GeocodingResult,
  GeocodingSearchInput,
  NominatimSearchResult,
} from "@/modules/geocoding/types";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_APP_URL = "https://github.com/Celia71-z/my-travel-atlas";

const getAppUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || DEFAULT_APP_URL;

const getPlaceName = (
  address: NominatimSearchResult["address"],
  fallback?: string
) =>
  address?.attraction ||
  address?.tourism ||
  address?.amenity ||
  address?.road ||
  address?.suburb ||
  address?.neighbourhood ||
  address?.city_district ||
  address?.district ||
  fallback;

const getCityName = (
  address: NominatimSearchResult["address"],
  fallback: string
) =>
  address?.city ||
  address?.town ||
  address?.village ||
  address?.municipality ||
  address?.county ||
  fallback;

const toNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildSearchUrl = (input: GeocodingSearchInput) => {
  const url = new URL(NOMINATIM_SEARCH_URL);
  const place = input.place?.trim();

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(input.limit));
  url.searchParams.set("dedupe", "1");
  url.searchParams.set("accept-language", "zh-CN,en");

  if (place) {
    url.searchParams.set("q", `${place}, ${input.city}, ${input.country}`);
  } else {
    url.searchParams.set("city", input.city);
    url.searchParams.set("country", input.country);
  }

  return url;
};

const toGeocodingResult = (
  item: NominatimSearchResult,
  input: GeocodingSearchInput
): GeocodingResult | null => {
  const latitude = toNumber(item.lat);
  const longitude = toNumber(item.lon);

  if (latitude === null || longitude === null) {
    return null;
  }

  const address = item.address ?? {};
  const city = getCityName(address, input.city);
  const place = input.place?.trim() || getPlaceName(address, item.name);
  const country = address.country || input.country;
  const countryCode = address.country_code?.toUpperCase();
  const fullAddress = item.display_name || [place, city, country].filter(Boolean).join(", ");
  const idParts = [item.osm_type, item.osm_id, item.place_id].filter(Boolean);

  return {
    id: idParts.length ? idParts.join(":") : `${latitude},${longitude}`,
    latitude,
    longitude,
    fullAddress,
    country,
    city,
    ...(place ? { place } : {}),
    ...(countryCode ? { countryCode } : {}),
    source: "nominatim",
  };
};

export async function searchNominatimLocation(
  input: GeocodingSearchInput
): Promise<GeocodingResult[]> {
  const url = buildSearchUrl(input);
  const appUrl = getAppUrl();

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Referer: appUrl,
      "User-Agent": `MyTravelAtlas/1.0 (${appUrl})`,
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed with status ${response.status}`);
  }

  const data = (await response.json()) as NominatimSearchResult[];

  return data
    .map((item) => toGeocodingResult(item, input))
    .filter((item): item is GeocodingResult => item !== null);
}
