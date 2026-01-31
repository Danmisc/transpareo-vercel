import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";

export default async function CommunityDetailLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-20 md:pb-0 md:pt-24">
            {/* Desktop Header matching Home */}
            <div className="hidden md:block">
                <Header user={session?.user} />
            </div>

            {/* Mobile Header handling can be in the page itself or here. 
                The previous layout had a specific mobile header. 
                For detail view, maybe we rely on the component's back button or sticky header?
                Let's keep it clean.
            */}

            <main className="min-w-0 w-full">
                {children}
            </main>
        </div>
    );
}
