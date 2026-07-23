"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import CityCard from "../components/city-card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import VectorTopLeftAnimation from "../components/vector-top-left-animation";

export const CitiesView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.home.getCitySets.queryOptions({ limit: 12 })
  );

  return (
    <section className="w-full space-y-3">
      <div className="p-4 lg:p-5 bg-muted rounded-xl flex flex-col gap-1">
        <p className="text-sm font-light">Travel Destinations</p>
        <p className="text-xs text-text-muted font-light">
          Cities and places visited across the atlas, organized as personal travel memories.
        </p>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
        {data.map((item) => (
          <CityCard
            key={item.id}
            title={item.city}
            coverPhoto={item.coverPhoto}
          />
        ))}
      </div>
    </section>
  );
};

export const CitiesViewLoadingStatus = () => {
  return (
    <section className="mt-3 w-full space-y-3">
      <div className="p-4 lg:p-5 bg-muted rounded-xl flex flex-col gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-full relative group cursor-pointer">
            <AspectRatio
              ratio={0.75 / 1}
              className="overflow-hidden rounded-lg relative"
            >
              <Skeleton className="w-full h-full" />
            </AspectRatio>

            <div className="absolute top-0 left-0 z-20">
              <VectorTopLeftAnimation title="Loading..." />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
