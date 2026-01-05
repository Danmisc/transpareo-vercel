"use client";


import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SearchLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export function SearchLayout({ sidebar, children }: SearchLayoutProps) {
    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 flex gap-8 items-start min-h-screen relative">

            {/* Mobile Filter Trigger (Floating FAB) */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="lg" className="rounded-full shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <SlidersHorizontal className="h-4 w-4" /> Filtres
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <div className="h-full pt-10">
                            {sidebar}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Sidebar (Command Center) - Hidden on Mobile initially, or Drawer */}
            <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block w-80 flex-shrink-0 sticky top-24 h-[calc(100vh-100px)]"
            >
                {sidebar}
            </motion.aside>

            {/* Main Content (Live Feed) */}
            <main className="flex-1 w-full min-w-0">
                {children}
            </main>
        </div>
    );
}
