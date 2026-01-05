import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { LiveView } from "@/components/live/LiveView";

export default async function LivePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            author: true,
            liveStream: true,
            comments: {
                include: { user: true },
                orderBy: { createdAt: 'desc' }, // Latest first for chat? usually chat is oldest first but scroll to bottom. 
                // Let's do latest first for simplicity in list.
                take: 50
            }
        }
    });

    if (!post || !post.liveStream) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <LiveView
                post={post}
                liveStream={post.liveStream}
                currentUser={session?.user}
            />
        </div>
    );
}
