import { P2PLayoutClient } from "@/components/p2p/layout/P2PLayoutClient";
import { auth } from "@/lib/auth";

export default async function P2PLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <P2PLayoutClient user={session?.user}>
            {children}
        </P2PLayoutClient>
    );
}

