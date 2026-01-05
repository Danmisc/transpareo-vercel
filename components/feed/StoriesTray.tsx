import { auth } from "@/lib/auth";
import { getStories } from "@/lib/actions-stories";
import { StoriesList } from "./StoriesList";

export async function StoriesTray() {
    const session = await auth();
    // Fetch stories for current user (following) or public trending if guest (handled by action)
    const stories = await getStories(session?.user?.id);

    return (
        <StoriesList initialStories={stories} />
    );
}
