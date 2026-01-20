"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { uploadFile } from "@/lib/upload";
import { createStory, markStoryAsSeen } from "@/lib/actions-stories";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface StoryItem {
    id: string;
    mediaUrl: string;
    mediaType: string;
    caption?: string;
    createdAt: Date;
    isSeen: boolean;
}

interface StoryGroup {
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    items: StoryItem[];
    hasUnseen: boolean;
}

export function StoriesList({ initialStories }: { initialStories: StoryGroup[] }) {
    const { data: session } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Viewer State
    const [viewingGroupIndex, setViewingGroupIndex] = useState<number | null>(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

    const handleCreateClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            // 1. Upload File
            const uploadRes = await uploadFile(formData);
            if (!uploadRes.success || !uploadRes.url) {
                throw new Error("Upload failed");
            }

            // 2. Create Story
            const mediaType = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
            const createRes = await createStory(uploadRes.url, mediaType);

            if (createRes.success) {
                router.refresh();
            }
        } catch (error) {
            console.error("Story creation failed", error);
            alert("Impossible de créer la story.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const openViewer = (groupIndex: number) => {
        setViewingGroupIndex(groupIndex);
        // Find first unseen story or start at 0
        const group = initialStories[groupIndex];
        const firstUnseen = group.items.findIndex(s => !s.isSeen);
        const startIndex = firstUnseen !== -1 ? firstUnseen : 0;
        setCurrentStoryIndex(startIndex);

        // Mark as seen immediately (simpler for now)
        if (!group.items[startIndex].isSeen) {
            markStoryAsSeen(group.items[startIndex].id);
        }
    };

    const closeViewer = () => {
        setViewingGroupIndex(null);
        setCurrentStoryIndex(0);
        router.refresh(); // Refresh to update seen status visuals
    };

    const nextStory = () => {
        if (viewingGroupIndex === null) return;

        const group = initialStories[viewingGroupIndex];
        if (currentStoryIndex < group.items.length - 1) {
            const nextIndex = currentStoryIndex + 1;
            setCurrentStoryIndex(nextIndex);
            if (!group.items[nextIndex].isSeen) {
                markStoryAsSeen(group.items[nextIndex].id);
            }
        } else {
            // Next User
            if (viewingGroupIndex < initialStories.length - 1) {
                openViewer(viewingGroupIndex + 1);
            } else {
                closeViewer();
            }
        }
    };

    const prevStory = () => {
        if (viewingGroupIndex === null) return;

        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        } else {
            // Prev User
            if (viewingGroupIndex > 0) {
                const prevGroupIndex = viewingGroupIndex - 1;
                setViewingGroupIndex(prevGroupIndex);
                setCurrentStoryIndex(initialStories[prevGroupIndex].items.length - 1);
            } else {
                closeViewer();
            }
        }
    };

    const currentGroup = viewingGroupIndex !== null ? initialStories[viewingGroupIndex] : null;
    const currentStory = currentGroup ? currentGroup.items[currentStoryIndex] : null;

    return (
        <div className="relative group w-full mb-6">
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">

                {/* Create Story Button */}
                <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer snap-start group/add min-w-[72px]" onClick={handleCreateClick}>
                    <div className="relative w-[72px] h-[72px]">
                        <div className={cn(
                            "absolute inset-0 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 group-hover/add:border-zinc-400 transition-colors",
                            isUploading && "animate-spin border-emerald-500 border-solid"
                        )} />
                        <div className="absolute inset-1 rounded-full overflow-hidden border-2 border-white dark:border-black bg-zinc-100 dark:bg-zinc-800">
                            <img src={session?.user?.image || "/avatars/default.svg"} className="w-full h-full object-cover opacity-50 group-hover/add:opacity-100 transition-opacity" alt="Your story" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-black shadow-sm group-hover/add:scale-110 transition-transform">
                            <Plus size={14} className="text-white" strokeWidth={3} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {isUploading ? "Envoi..." : "Créer"}
                    </span>
                </div>

                {/* Story Items */}
                {initialStories.map((group, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={group.user.id}
                        className="flex flex-col items-center gap-2 shrink-0 cursor-pointer snap-start group/story min-w-[72px]"
                        onClick={() => openViewer(i)}
                    >
                        <div className={cn(
                            "relative w-[72px] h-[72px] p-[2px] rounded-full transition-all duration-300",
                            group.hasUnseen
                                ? "bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 group-hover/story:p-[3px]"
                                : "bg-zinc-200 dark:bg-zinc-800"
                        )}>
                            <div className="w-full h-full rounded-full border-[2px] border-white dark:border-black overflow-hidden relative bg-white dark:bg-zinc-900">
                                <Avatar className="w-full h-full">
                                    <AvatarImage src={group.user.image || "/avatars/default.svg"} className="group-hover/story:scale-105 transition-transform duration-500" />
                                    <AvatarFallback>{group.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        <span className={cn(
                            "text-xs font-medium max-w-[74px] truncate text-center transition-colors",
                            group.hasUnseen ? "text-zinc-900 dark:text-zinc-100 font-semibold" : "text-zinc-500 dark:text-zinc-400"
                        )}>
                            {group.user.id === session?.user?.id ? "Moi" : group.user.name?.split(' ')[0]}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Fade Edges */}
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none md:block hidden" />

            {/* Full Screen Viewer */}
            <AnimatePresence>
                {viewingGroupIndex !== null && currentStory && currentGroup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-3xl"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 pt-8 md:pt-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                                    <AvatarImage src={currentGroup.user.image || "/avatars/default.svg"} />
                                    <AvatarFallback>{currentGroup.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-white text-sm font-bold shadow-black drop-shadow-md">
                                        {currentGroup.user.name}
                                    </div>
                                    <div className="text-white/80 text-xs font-medium">
                                        {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeViewer} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20 pt-8 md:pt-0">
                            {currentGroup.items.map((item, idx) => (
                                <div key={item.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className={cn("h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]", idx < currentStoryIndex ? "w-full" : idx === currentStoryIndex ? "w-full animate-[progress_5s_linear]" : "w-0")} />
                                </div>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="relative w-full h-[85vh] md:max-w-md bg-black rounded-xl overflow-hidden shadow-2xl">
                            {currentStory.mediaType === 'VIDEO' ? (
                                <video
                                    src={currentStory.mediaUrl}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    playsInline
                                    onEnded={nextStory}
                                />
                            ) : (
                                <img
                                    src={currentStory.mediaUrl}
                                    alt="Story"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* Navigation Areas */}
                        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-w-resize" onClick={prevStory} />
                        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-e-resize" onClick={nextStory} />

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

