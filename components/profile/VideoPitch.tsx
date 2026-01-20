"use client";

import { useState } from "react";
import { Play, Plus, Video, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PitchPlayerDialog } from "./PitchPlayerDialog";
import { PitchRecorder } from "./PitchRecorder";
import { cn } from "@/lib/utils";
import { updateUserPitch, deleteUserPitch } from "@/lib/actions-profile";

interface VideoPitchProps {
    userId: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    avatarUrl?: string;
    isCurrentUser?: boolean;
}

export function VideoPitch({ userId, videoUrl, thumbnailUrl, avatarUrl, isCurrentUser }: VideoPitchProps) {
    const [showPlayer, setShowPlayer] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    // If no video and not owner, show nothing
    if (!videoUrl && !isCurrentUser) return null;

    const handleClick = () => {
        if (videoUrl) {
            setShowPlayer(true);
        } else if (isCurrentUser) {
            setIsRecording(true);
        }
    };

    const handleEdit = () => {
        setShowPlayer(false);
        setIsRecording(true);
    };

    const handleDelete = async () => {
        try {
            await deleteUserPitch(userId);
            window.location.reload();
        } catch (error) {
            console.error("Failed to delete pitch", error);
        }
    };

    const handleSavePitch = async (fileOrBlob: File | Blob) => {
        // ... (keep existing implementation)
        try {
            // 1. Create FormData
            const formData = new FormData();
            if (fileOrBlob instanceof Blob && !(fileOrBlob instanceof File)) {
                formData.append('file', fileOrBlob, 'pitch-recording.webm');
            } else {
                formData.append('file', fileOrBlob as File);
            }

            // 2. Upload
            const { uploadVideoFile } = await import('@/lib/actions-upload');
            const result = await uploadVideoFile(formData);

            if ('error' in result) {
                console.error("Upload failed:", result.error);
                throw new Error(result.error);
            }

            // 3. Update DB
            await updateUserPitch(userId, {
                videoUrl: result.url,
                thumbnailUrl: undefined,
                duration: result.duration || 0
            });

            // 4. Close and Refresh
            setIsRecording(false);
            window.location.reload();

        } catch (error) {
            console.error("Failed to save pitch", error);
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClick}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm",
                    "h-9", // Standard button height
                    videoUrl
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border border-transparent"
                        : "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                )}
            >
                {videoUrl ? (
                    <Play className="w-3.5 h-3.5 fill-current" />
                ) : (
                    <Plus className="w-4 h-4" />
                )}
                {videoUrl ? "Voir le Pitch" : "Ajouter un Pitch"}
            </motion.button>

            {videoUrl && (
                <PitchPlayerDialog
                    isOpen={showPlayer}
                    onClose={() => setShowPlayer(false)}
                    videoUrl={videoUrl}
                    onEdit={isCurrentUser ? handleEdit : undefined}
                    onDelete={isCurrentUser ? handleDelete : undefined}
                />
            )}

            {isCurrentUser && (
                <PitchRecorder
                    isOpen={isRecording}
                    onClose={() => setIsRecording(false)}
                    onSave={handleSavePitch}
                />
            )}
        </>
    );
}
