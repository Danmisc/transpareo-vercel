import { auth } from "@/lib/auth";
import { getCollectionDetails, deleteCollection } from "@/lib/bookmark-actions"; // Need logic to remove posts too?
import { redirect } from "next/navigation";
import { PostCard } from "@/components/feed/PostCard";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Client component for delete action?
// Or server action form.
import { DeleteCollectionButton } from "@/components/bookmarks/DeleteCollectionButton";
import { ReadStatusToggle } from "@/components/bookmarks/ReadStatusToggle";
import { cn } from "@/lib/utils";

export default async function CollectionPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { id } = await params;
    const res = await getCollectionDetails(id);

    if (!res.success || !res.data) {
        notFound();
    }

    const { collection, posts } = res.data;
    const isOwner = session.user.id === collection.userId;

    return (
        <div className="py-6 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/bookmarks">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
                    {collection.description && <p className="text-muted-foreground">{collection.description}</p>}
                </div>

                {isOwner && (
                    <div className="ml-auto">
                        <DeleteCollectionButton collectionId={collection.id} />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Cette collection est vide.
                    </div>
                ) : (
                    <div className="space-y-6">
                        import {ReadStatusToggle} from "@/components/bookmarks/ReadStatusToggle";

                        // ... inside logic
                        {posts.map((item: any) => (
                            <div key={item.id} className="relative group">
                                {collection.type === "READING_LIST" && (
                                    <div className="absolute top-4 right-16 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ReadStatusToggle savedId={item.id} initialIsRead={item.progress >= 1.0} />
                                    </div>
                                )}
                                <PostCard
                                    id={item.post.id}
                                    authorId={item.post.authorId}
                                    currentUser={session.user as any}
                                    author={{
                                        name: item.post.author.name || "User",
                                        avatar: item.post.author.avatar || "/avatars/default.png",
                                        role: item.post.author.role || "Membre"
                                    }}
                                    content={item.post.content}
                                    published={new Date(item.post.createdAt).toLocaleDateString()}
                                    isSaved={true}
                                    type={item.post.type}
                                    image={item.post.image}
                                    metrics={{
                                        likes: 0,
                                        comments: item.post._count?.comments || 0,
                                        shares: 0
                                    }}
                                />
                                {collection.type === "READING_LIST" && (
                                    <div className={cn("absolute inset-x-0 bottom-0 h-1 bg-gray-100 rounded-b-lg overflow-hidden", item.progress >= 1.0 && "bg-green-100")}>
                                        <div
                                            className={cn("h-full transition-all duration-500", item.progress >= 1.0 ? "bg-green-500 w-full" : "bg-transparent w-0")}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
