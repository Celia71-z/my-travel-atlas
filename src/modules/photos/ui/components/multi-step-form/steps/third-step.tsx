import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, LocateFixed, MapPin } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { thirdStepSchema, StepProps, ThirdStepData } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatGPSCoordinates } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import type { GeocodingResult } from "@/modules/geocoding/types";

const MapComponent = dynamic(() => import("@/modules/mapbox/ui/components/map"), {
  ssr: false,
  loading: () => (
    <div className="size-full flex items-center justify-center bg-muted">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

interface ThirdStepProps extends StepProps {
  onAddressUpdate?: (addressData: unknown | null) => void;
}

const hasCoordinates = (value: Partial<ThirdStepData>) =>
  typeof value.latitude === "number" && typeof value.longitude === "number";

export function ThirdStep({
  onNext,
  onBack,
  initialData,
  isSubmitting,
}: ThirdStepProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [generatedLocation, setGeneratedLocation] =
    useState<GeocodingResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ThirdStepData>({
    resolver: zodResolver(thirdStepSchema),
    defaultValues: {
      country: initialData?.country ?? "",
      city: initialData?.city ?? "",
      place: initialData?.place ?? "",
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
      fullAddress: initialData?.fullAddress ?? "",
      countryCode: initialData?.countryCode ?? "",
    },
    mode: "onChange",
  });

  const { handleSubmit, formState } = form;
  const { isValid } = formState;
  const watchedValues = form.watch();

  const clearGeneratedLocation = () => {
    setGeneratedLocation(null);
    form.setValue("latitude", undefined, { shouldDirty: true });
    form.setValue("longitude", undefined, { shouldDirty: true });
    form.setValue("fullAddress", "", { shouldDirty: true });
    form.setValue("countryCode", "", { shouldDirty: true });
  };

  const handleGenerateCoordinates = async () => {
    const isLocationInputValid = await form.trigger(["country", "city", "place"]);

    if (!isLocationInputValid) {
      return;
    }

    const values = form.getValues();
    setIsGenerating(true);

    try {
      const response = await queryClient.fetchQuery(
        trpc.geocoding.search.queryOptions({
          country: values.country,
          city: values.city,
          place: values.place?.trim() || undefined,
          limit: 5,
        })
      );

      const location = response.result;
      const selectedPlace = values.place?.trim() ? location.place : undefined;

      setGeneratedLocation(location);
      form.setValue("country", location.country, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("city", location.city, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("place", selectedPlace ?? "", { shouldDirty: true });
      form.setValue("latitude", location.latitude, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("longitude", location.longitude, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("fullAddress", location.fullAddress, {
        shouldDirty: true,
      });
      form.setValue("countryCode", location.countryCode ?? "", {
        shouldDirty: true,
      });

      toast.success("Coordinates generated");
    } catch (error) {
      console.error("Generate coordinates error:", error);
      setGeneratedLocation(null);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate coordinates"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const previewLocation = useMemo(() => {
    if (generatedLocation) {
      return generatedLocation;
    }

    if (hasCoordinates(initialData ?? {})) {
      return {
        id: "initial-location",
        latitude: initialData!.latitude!,
        longitude: initialData!.longitude!,
        fullAddress: initialData?.fullAddress || "Existing photo GPS location",
        country: initialData?.country || "",
        city: initialData?.city || "",
        source: "nominatim" as const,
      };
    }

    return null;
  }, [generatedLocation, initialData]);

  const mapValues = useMemo(() => {
    return {
      markers: previewLocation
        ? [
            {
              id: "location",
              longitude: previewLocation.longitude,
              latitude: previewLocation.latitude,
            },
          ]
        : [],
      viewState: {
        longitude: previewLocation?.longitude ?? 104.1954,
        latitude: previewLocation?.latitude ?? 35.8617,
        zoom: previewLocation ? 10 : 2,
      },
    };
  }, [previewLocation]);

  const onSubmit = (data: ThirdStepData) => {
    if (!generatedLocation) {
      toast.error("Generate coordinates before continuing");
      return;
    }

    onNext({
      ...data,
      country: data.country,
      city: data.city,
      place: data.place?.trim() || undefined,
      latitude: generatedLocation.latitude,
      longitude: generatedLocation.longitude,
      fullAddress: generatedLocation.fullAddress,
      countryCode: generatedLocation.countryCode,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="China"
                    onChange={(event) => {
                      field.onChange(event);
                      clearGeneratedLocation();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Xiamen"
                    onChange={(event) => {
                      field.onChange(event);
                      clearGeneratedLocation();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specific place</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Optional, e.g. Gulangyu"
                  onChange={(event) => {
                    field.onChange(event);
                    clearGeneratedLocation();
                  }}
                />
              </FormControl>
              <FormDescription>
                Leave this blank if you only want to mark the city footprint.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateCoordinates}
          disabled={
            isGenerating ||
            !watchedValues.country?.trim() ||
            !watchedValues.city?.trim()
          }
          className="w-full"
        >
          <LocateFixed className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating coordinates..." : "Generate coordinates"}
        </Button>

        {generatedLocation && (
          <Card className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium">Matched address</p>
                <p className="text-xs text-muted-foreground">
                  {generatedLocation.fullAddress}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatGPSCoordinates(
                    generatedLocation.latitude,
                    generatedLocation.longitude
                  )}
                </p>
              </div>
            </div>
          </Card>
        )}

        <FormItem>
          <FormLabel>Map preview</FormLabel>
          <FormControl>
            <div className="h-[400px] w-full rounded-md border overflow-hidden">
              <MapComponent
                key={`${mapValues.viewState.longitude}-${mapValues.viewState.latitude}`}
                markers={mapValues.markers}
                initialViewState={mapValues.viewState}
              />
            </div>
          </FormControl>
          <FormDescription>
            The marker appears after coordinates are generated.
          </FormDescription>
        </FormItem>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid || !generatedLocation}
          >
            Confirm Location <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
