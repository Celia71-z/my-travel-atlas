import Link from "next/link";
import { MapPinned } from "lucide-react";
import { PiArrowDown } from "react-icons/pi";

const LatestTravelCard = () => {
  return (
    <div className="p-4 lg:p-5 bg-muted rounded-xl w-full flex flex-col md:flex-row justify-between gap-4 md:items-center">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-light">Travel Footprints</p>
          <PiArrowDown size={14} />
        </div>
        <p className="text-xs text-text-muted font-light">
          Browse the places collected in this atlas, from city memories to map pins.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/travel" className="relative text-sm font-light group">
          View Destinations
          <span className="absolute -bottom-[2px] left-0 w-full h-px bg-black dark:bg-white transition-all duration-300 transform ease-in-out group-hover:w-1/3" />
        </Link>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-light text-white transition-colors hover:bg-primary/90 dark:text-black"
        >
          <MapPinned size={16} />
          进入旅行地图
        </Link>
      </div>
    </div>
  );
};

export default LatestTravelCard;
