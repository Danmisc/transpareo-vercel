import { ListingDetails } from "@/components/marketplace/ListingDetails";
import { Header } from "@/components/layout/Header";
import { getListingById, getSimilarListings } from "@/lib/actions/marketplace";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await (params as any); // Type assertion for compatibility if strict types complain content of Promise
    const result = await getListingById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const listing = result.data;
    const similarListings = await getSimilarListings(id);

    // Enhance listing data with stats if missing
    // In a real app, these would come from a comprehensive market data service
    const enhancedListing = {
        ...listing,
        stats: {
            pricePerSqm: Math.round(listing.price / listing.surface),
            avgNeighborhood: Math.round(listing.price / listing.surface * 1.05) // Fake market comparison
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="w-full">
                <Header />
            </div>
            <ListingDetails listing={enhancedListing} similarListings={similarListings} />
            <Footer />
        </div>
    );
}
