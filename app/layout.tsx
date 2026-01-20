import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for now, can swap to Outfit
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Transpareo",
    default: "Transpareo Social"
  },
  description: "La plateforme communautaire de l'immobilier citoyen. Rejoignez vos voisins et les pros de confiance.",
  icons: {
    icon: "/favicon.ico",
  }
};

import { Providers } from "@/components/providers";
import { PresenceProvider } from "@/components/providers/PresenceProvider";
import { Toaster } from "sonner";
import { MobileNav } from "@/components/layout/MobileNav";
import { auth } from "@/lib/auth";
import { FloatingChatProvider } from "@/components/messages/FloatingChatProvider";
import { FloatingChatContainer } from "@/components/messages/FloatingChatContainer";
import { MessagesTray } from "@/components/messages/MessagesTray";

export default async function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          <PresenceProvider>
            <FloatingChatProvider userId={userId} enabled={!!userId}>

              {/* Global Ambient Background */}
              <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob" />
                <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-1/3 w-[40rem] h-[40rem] bg-pink-200/20 dark:bg-pink-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob animation-delay-4000" />
              </div>

              {children}
              {modal}

              {/* Global Mobile Nav */}
              <div className="md:hidden">
                <MobileNav />
              </div>

              {/* LinkedIn-style Floating Chat Windows & Messages Tray */}
              <div className="hidden md:block">
                <MessagesTray />
                <FloatingChatContainer />
              </div>

              <Toaster position="top-center" richColors />
            </FloatingChatProvider>
          </PresenceProvider>
        </Providers>
      </body>
    </html>
  );
}


