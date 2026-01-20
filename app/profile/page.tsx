
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
    const session = await auth();

    if (session?.user?.id) {
        redirect(`/profile/${session.user.id}`);
    }

    // If not logged in, redirect to login
    redirect("/login");
}
