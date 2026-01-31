"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatSearchHeaderProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    onNext: () => void;
    onPrev: () => void;
    currentMatch: number;
    totalMatches: number;
}

export function ChatSearchHeader({ isOpen, onClose, onSearch, onNext, onPrev, currentMatch, totalMatches }: ChatSearchHeaderProps) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else {
            setQuery("");
            onSearch("");
        }
    }, [isOpen]);

    const handleSearch = (val: string) => {
        setQuery(val);
        onSearch(val);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-2 shadow-sm"
        >
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Rechercher dans la discussion..."
                    className="pl-9 h-9 bg-zinc-100 dark:bg-zinc-800 border-none focus-visible:ring-1 focus-visible:ring-orange-500"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (e.shiftKey) onPrev();
                            else onNext();
                        }
                        if (e.key === "Escape") onClose();
                    }}
                />
            </div>

            <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 tabular-nums min-w-[60px] justify-center">
                {totalMatches > 0 ? (
                    <>
                        <span className="text-zinc-900 dark:text-zinc-100 font-medium">{currentMatch}</span>
                        <span className="opacity-50">/</span>
                        <span>{totalMatches}</span>
                    </>
                ) : (
                    query && <span>0 res.</span>
                )}
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    onClick={onPrev}
                    disabled={totalMatches === 0}
                >
                    <ChevronUp size={18} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    onClick={onNext}
                    disabled={totalMatches === 0}
                >
                    <ChevronDown size={18} />
                </Button>
                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    onClick={onClose}
                >
                    <X size={18} />
                </Button>
            </div>
        </motion.div>
    );
}
