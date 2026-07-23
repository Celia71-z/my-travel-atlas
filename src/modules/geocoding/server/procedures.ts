import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { searchNominatimLocation } from "@/modules/geocoding/lib/nominatim";
import { geocodingSearchInputSchema } from "@/modules/geocoding/types";

export const geocodingRouter = createTRPCRouter({
  search: protectedProcedure
    .input(geocodingSearchInputSchema)
    .query(async ({ input }) => {
      try {
        const results = await searchNominatimLocation(input);
        const result = results[0];

        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No location found for the provided country and city",
          });
        }

        return {
          query: {
            country: input.country,
            city: input.city,
            ...(input.place?.trim() ? { place: input.place.trim() } : {}),
          },
          result,
          results,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Geocoding search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search location",
        });
      }
    }),
});
