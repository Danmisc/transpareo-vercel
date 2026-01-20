import { Header } from "@/components/layout/Header";
import { SearchClient } from "@/components/search/SearchClient";
import { SearchLayout } from "@/components/search/SearchLayout";
import { ModernFilterSidebar } from "@/components/search/ModernFilterSidebar";

import { VideoFeedProvider } from "@/components/feed/VideoFeedProvider";

export default function SearchPage() {
    return (
        <VideoFeedProvider>
            <div className="min-h-screen bg-background">
                <Header />
                <SearchLayout sidebar={<ModernFilterSidebar />}>
                    <SearchClient />
                </SearchLayout>
            </div>
        </VideoFeedProvider>
    );
}

