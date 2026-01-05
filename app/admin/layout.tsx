import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // 1. Authentication Check
    if (!session?.user) {
        redirect("/login?callbackUrl=/admin");
    }

    // 2. Role Check (The "Gatekeeper")
    if (session.user.role !== "ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
                <Card className="max-w-md w-full border-red-900 bg-zinc-900 text-red-500 shadow-2xl shadow-red-900/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-950/50 p-3 rounded-full mb-4 w-fit">
                            <ShieldAlert size={48} />
                        </div>
                        <CardTitle className="text-2xl font-black uppercase tracking-widest text-white">Access Denied</CardTitle>
                        <CardDescription className="text-red-400">
                            Security Level: <strong>Classified</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-zinc-400 text-sm">
                            You do not have the required <strong>ADMIN</strong> clearance to access the Command Center.
                            This incident has been logged.
                        </p>
                        <div className="bg-zinc-950 p-3 rounded border border-red-900/30 font-mono text-xs text-red-300">
                            User: {session.user.email}<br />
                            Role: {session.user.role || "USER"}<br />
                            IP: ::1 (Masked)
                        </div>
                        <div className="flex gap-2 justify-center pt-4">
                            <Link href="/">
                                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                                    Return Home
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 3. Authorized Render
    return (
        <div className="min-h-screen bg-zinc-950 text-foreground flex">

            {/* ADMIN SIDEBAR (Simplified for now) */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800 bg-zinc-900 sticky top-0 h-screen">
                <div className="p-6 border-b border-zinc-800 flex items-center gap-2 text-white">
                    <ShieldCheck className="text-emerald-500" />
                    <span className="font-bold tracking-tight">Admin Hub</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800">
                            Overview
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800">
                            Users
                        </Button>
                    </Link>
                    <Link href="/admin/moderation">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800">
                            Moderation
                        </Button>
                    </Link>
                    <Link href="/admin/system">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800">
                            System
                        </Button>
                    </Link>
                </nav>
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">
                            A
                        </div>
                        <div className="text-xs">
                            <p className="text-white font-medium">Administrator</p>
                            <p className="text-zinc-500">Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
