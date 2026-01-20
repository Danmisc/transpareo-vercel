"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ListingMapClient = dynamic(
    () => import("./ListingMapClient"),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[300px] w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
    }
);

interface ListingMapProps {
    lat: number;
    lng: number;
    address?: string;
}

export default function ListingMap(props: ListingMapProps) {
    return <ListingMapClient {...props} />;
}

