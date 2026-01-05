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
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { auth } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <PresenceProvider>
            {/* Global Ambient Background */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-zinc-50/50">
              <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-orange-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob" />
              <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-1/3 w-[40rem] h-[40rem] bg-pink-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />
            </div>

            {children}

            {/* Global Mobile Nav */}
            <div className="md:hidden">
              <MobileBottomNav userId={userId} />
            </div>
            <Toaster position="top-center" richColors />
          </PresenceProvider>
        </Providers>
      </body>
    </html>
  );
}
