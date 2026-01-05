import { ReelsFeed } from "@/components/reels/ReelsFeed";

export const metadata = {
    title: "Reels | Transpareo",
    description: "Explorez des vidéos courtes immobilières",
};

export default function ReelsPage() {
    return (
        <main className="w-full h-full bg-black">
            <ReelsFeed />
        </main>
    );
}
