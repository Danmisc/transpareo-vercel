"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
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
        <>
            <div className="glass mb-6 rounded-xl py-4">
                <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x items-center">

                    {/* Create Story Button */}
                    <div className="flex flex-col items-center gap-1 cursor-pointer snap-start min-w-[70px]" onClick={handleCreateClick}>
                        <div className="relative group">
                            <div className={cn("rounded-full p-[2px] transition-all", isUploading ? "bg-amber-400 animate-pulse" : "bg-transparent border-2 border-zinc-300 border-dashed")}>
                                <Avatar className="h-16 w-16 p-0.5">
                                    <AvatarImage src={session?.user?.image || "/avatars/default.png"} className="rounded-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <AvatarFallback>Moi</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1 border-2 border-white dark:border-zinc-900 shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="h-3 w-3 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate w-16 text-center">
                            {isUploading ? "Envoi..." : "Ma Visite"}
                        </span>
                    </div>

                    {/* Stories Groups */}
                    {initialStories.map((group, index) => (
                        <motion.div
                            key={group.user.id}
                            className="flex flex-col items-center gap-1 cursor-pointer snap-start min-w-[70px]"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openViewer(index)}
                        >
                            <div className={cn(
                                "rounded-full p-[3px] transition-all",
                                group.hasUnseen
                                    ? "bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600"
                                    : "bg-zinc-200 dark:bg-zinc-800"
                            )}>
                                <div className="bg-white dark:bg-zinc-900 rounded-full p-0.5">
                                    <Avatar className="h-[3.6rem] w-[3.6rem]">
                                        <AvatarImage src={group.user.image || "/avatars/default.png"} className="object-cover" />
                                        <AvatarFallback>{group.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate w-16 text-center">
                                {group.user.id === session?.user?.id ? "Moi" : group.user.name?.split(' ')[0]}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Full Screen Viewer */}
            <AnimatePresence>
                {viewingGroupIndex !== null && currentStory && currentGroup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={currentGroup.user.image || "/avatars/default.png"} />
                                    <AvatarFallback>{currentGroup.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-white text-sm font-semibold">
                                    {currentGroup.user.name}
                                    <span className="text-white/60 font-normal ml-2 text-xs">
                                        {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            <button onClick={closeViewer} className="text-white/80 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Progress Bar (Mock for now, static for current story) */}
                        <div className="absolute top-1 left-2 right-2 flex gap-1 z-20">
                            {currentGroup.items.map((item, idx) => (
                                <div key={item.id} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className={cn("h-full bg-white", idx < currentStoryIndex ? "w-full" : idx === currentStoryIndex ? "w-full animate-progress" : "w-0")} />
                                </div>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="relative w-full h-full md:max-w-md bg-black flex items-center justify-center">
                            {currentStory.mediaType === 'VIDEO' ? (
                                <video
                                    src={currentStory.mediaUrl}
                                    className="max-h-full max-w-full object-contain"
                                    autoPlay
                                    loop // For now, loop, or onEnded={nextStory}
                                    playsInline // Important for mobile
                                    controls={false}
                                />
                            ) : (
                                <img
                                    src={currentStory.mediaUrl}
                                    alt="Story"
                                    className="max-h-full max-w-full object-contain"
                                />
                            )}
                        </div>

                        {/* Navigation Areas */}
                        <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={prevStory} />
                        <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={nextStory} />

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
