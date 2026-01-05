import { auth } from "@/lib/auth";
import { getUserCollections, getGeneralSavedPosts } from "@/lib/bookmark-actions";
import { redirect } from "next/navigation";
import { BookmarksView } from "@/components/bookmarks/BookmarksView";

export default async function BookmarksPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const collectionsRes = await getUserCollections(session.user.id);
    const savedRes = await getGeneralSavedPosts(session.user.id);

    // Ensure we have arrays
    const collections = collectionsRes.success ? collectionsRes.data : [];
    const savedPosts = savedRes.success ? savedRes.data : [];

    return (
        <BookmarksView
            collections={collections}
            savedPosts={savedPosts}
            currentUser={session.user}
        />
    );
}
