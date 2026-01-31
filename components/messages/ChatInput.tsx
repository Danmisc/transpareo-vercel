"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, ImageIcon, Smile, Send, Mic, X, File as FileIcon, Trash2, Plus, MapPin, Loader2, Sticker } from "lucide-react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { GifPicker } from "./GifPicker";
import { ImageEditor } from "./ImageEditor";
import { Pencil } from "lucide-react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { soundEffects } from "@/components/ui/sound-effects"; // Import sound effects
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface ChatInputProps {
    conversationId: string;
    onSendMessage: (content: string, type: string, files?: File[], metadata?: any) => Promise<void>;
    triggerTyping: () => void;
    replyingTo: any;
    setReplyingTo: (msg: any) => void;
    typingUsers?: { id: string, name: string, avatar?: string }[];
}

export function ChatInput({ conversationId, onSendMessage, triggerTyping, replyingTo, setReplyingTo, typingUsers = [] }: ChatInputProps) {
    const [newMessage, setNewMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);
    const { resolvedTheme } = useTheme();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const processedFiles: File[] = [];
        for (const file of acceptedFiles) {
            if (file.type.startsWith("image/")) {
                try {
                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    };
                    const compressedFile = await imageCompression(file, options);
                    processedFiles.push(compressedFile);
                } catch (error) {
                    console.error("Image compression failed", error);
                    processedFiles.push(file);
                }
            } else {
                processedFiles.push(file);
            }
        }
        setAttachments(prev => [...prev, ...processedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        accept: {
            'image/*': [],
            'text/plain': [],
            'application/pdf': [],
            'application/msword': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
        }
    });

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
        triggerTyping();
    };

    // Load draft on mount or conversation change
    useEffect(() => {
        const draft = localStorage.getItem(`draft_${conversationId}`);
        if (draft) {
            setNewMessage(draft);
        } else {
            setNewMessage("");
        }
    }, [conversationId]);

    // Save draft on change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (newMessage.trim()) {
                localStorage.setItem(`draft_${conversationId}`, newMessage);
            } else {
                localStorage.removeItem(`draft_${conversationId}`);
            }
        }, 500); // Debounce save
        return () => clearTimeout(timeoutId);
    }, [newMessage, conversationId]);

    const handleSendVoice = async (blob: Blob) => {
        try {
            const audioFile = new File([blob], "voice_message.webm", { type: 'audio/webm' });
            // Send directly with type AUDIO
            await onSendMessage("", "AUDIO", [audioFile]);
            setIsRecording(false);
        } catch (error) {
            console.error("Failed to send voice message", error);
        }
    };

    const handleGifSelect = async (url: string) => {
        try {
            setIsUploading(true);
            const res = await fetch(url);
            const blob = await res.blob();
            const file = new File([blob], "animation.gif", { type: "image/gif" });
            await onSendMessage("", "IMAGE", [file]);
        } catch (error) {
            console.error("Failed to send GIF", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleLocationShare = () => {
        if (!navigator.geolocation) {
            toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        setIsLocationLoading(true);
        const toastId = toast.loading("Localisation en cours...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Add a small artificial delay for better UX if it's too fast
                await new Promise(r => setTimeout(r, 500));

                await onSendMessage("📍 Position partagée", "TEXT", undefined, {
                    lat: latitude,
                    lng: longitude,
                    type: "location"
                });

                setIsLocationLoading(false);
                toast.success("Position partagée !", { id: toastId });
                soundEffects.playSend();
            },
            (error) => {
                console.error("Location error", error);
                setIsLocationLoading(false);

                let errorMessage = "Impossible de récupérer votre position.";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = "Vous avez refusé l'accès à la localisation.";
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = "Délai d'attente dépassé.";
                }

                toast.error(errorMessage, { id: toastId });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!newMessage.trim() && attachments.length === 0) || isUploading) return;

        try {
            setIsUploading(true);
            soundEffects.playSend(); // Play send sound immediately for feedback

            const type = attachments.length > 0
                ? (attachments.every(f => f.type.startsWith("image/")) ? "IMAGE" : "FILE")
                : "TEXT";

            await onSendMessage(newMessage, type, attachments.length > 0 ? attachments : undefined);

            // Reset
            setNewMessage("");
            localStorage.removeItem(`draft_${conversationId}`);
            setAttachments([]);
            setReplyingTo(null);
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative z-40 transition-colors duration-300",
                isDragActive && "bg-transparent"
            )}
        >
            <input {...getInputProps()} />

            {/* Main Center Container aka "The Pill" */}
            <div className="max-w-4xl mx-auto flex flex-col gap-2 relative">

                {/* Drag Overlay */}
                <AnimatePresence>
                    {isDragActive && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-orange-100/95 backdrop-blur-md rounded-[26px] border-2 border-dashed border-orange-400 shadow-xl"
                        >
                            <p className="text-orange-600 font-bold text-lg">Déposez vos fichiers !</p>
                        </motion.div>
                    )}

                    {/* Floating Typing Indicator */}
                    {typingUsers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 mb-2 flex items-center gap-2 z-10 pointer-events-none"
                        >
                            <div className="flex -space-x-2">
                                {typingUsers.slice(0, 3).map((u, i) => (
                                    <Avatar key={u.id || i} className="w-5 h-5 border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-100 dark:ring-zinc-800">
                                        <AvatarImage src={u.avatar} />
                                        <AvatarFallback className="text-[8px] bg-zinc-200 dark:bg-zinc-700">{u.name[0]}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-white/20">
                                <div className="flex gap-0.5">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-1 h-1 bg-zinc-500 dark:text-zinc-400 rounded-full"
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                                    {typingUsers.length === 1
                                        ? `${typingUsers[0].name} écrit...`
                                        : "Plusieurs personnes..."}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Previews (Attachments) - Floating above the bar */}
                <AnimatePresence>
                    {attachments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-2 flex gap-2 overflow-x-auto p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/50 shadow-sm custom-scrollbar"
                            style={{ maxWidth: '100%' }}
                        >
                            {attachments.map((file, i) => (
                                <div key={i} className="relative flex-shrink-0 group">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center relative group-hover:brightness-95 transition-all">
                                        {file.type.startsWith("image/") ? (
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                alt="preview"
                                                fill
                                                className="object-cover"
                                                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <div className="bg-white p-1 rounded-full shadow-sm">
                                                    <FileIcon className="text-blue-500 fill-blue-50" size={20} />
                                                </div>
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase max-w-[50px] truncate">{file.name.split('.').pop() || 'FILE'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(i)}
                                        className="absolute -top-1.5 -right-1.5 bg-zinc-900 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* The Input Bar - Floating Pill */}
                {isRecording ? (
                    <VoiceRecorder
                        onSend={handleSendVoice}
                        onCancel={() => setIsRecording(false)}
                        isSending={isUploading}
                    />
                ) : (
                    <div
                        className={cn(
                            "relative flex items-center gap-2 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[26px] pl-2 pr-2 py-2 transition-all duration-300 ease-out",
                            "dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
                            "hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]"
                        )}
                    >
                        {/* Left: Plus Menu */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full h-8 w-8 mb-0.5 flex-shrink-0 transition-colors"
                                >
                                    <Plus size={20} className="stroke-[2.5]" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="start" className="w-48 p-1 rounded-xl shadow-xl border-zinc-100 mb-2">
                                <div className="grid gap-0.5">
                                    <Button variant="ghost" className="justify-start text-xs font-medium h-8 rounded-lg" onClick={openFilePicker}>
                                        <ImageIcon className="w-3.5 h-3.5 mr-2 text-purple-500" />
                                        Médias
                                    </Button>
                                    <Button variant="ghost" className="justify-start text-xs font-medium h-8 rounded-lg" onClick={openFilePicker}>
                                        <FileIcon className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                        Fichiers
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="justify-start text-xs font-medium h-8 rounded-lg disabled:opacity-50"
                                        onClick={handleLocationShare}
                                        disabled={isLocationLoading}
                                    >
                                        {isLocationLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 mr-2 text-green-500 animate-spin" />
                                        ) : (
                                            <MapPin className="w-3.5 h-3.5 mr-2 text-green-500" />
                                        )}
                                        {isLocationLoading ? "En cours..." : "Position"}
                                    </Button>
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-0.5" />
                                    <GifPicker onGifSelect={handleGifSelect}>
                                        <Button variant="ghost" className="w-full justify-start text-xs font-medium h-8 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <span className="w-3.5 h-3.5 mr-2 flex items-center justify-center font-bold text-[7px] border border-pink-500 text-pink-500 rounded-[3px]">GIF</span>
                                            GIF
                                        </Button>
                                    </GifPicker>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Middle: Textarea */}
                        <div className="flex-1 min-w-0 bg-transparent flex items-center relative">
                            <ReactTextareaAutosize
                                minRows={1}
                                maxRows={6}
                                placeholder="Écrivez un message..."
                                className={cn(
                                    "flex-1 bg-transparent border-none resize-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 px-3 py-3 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-white leading-relaxed",
                                    "scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                                )}
                                value={newMessage}
                                onChange={handleMessageChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (newMessage.trim() || attachments.length > 0) {
                                            void handleSend();
                                        }
                                    }
                                }}
                                disabled={isRecording || isUploading}
                            />
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 mb-0.5">
                            {/* Emoji Picker */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-zinc-400 hover:text-amber-500 hover:bg-amber-50 rounded-full h-8 w-8 transition-colors"
                                    >
                                        <Smile size={18} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="top" align="end" className="w-full p-0 border-none shadow-none bg-transparent">
                                    <EmojiPicker
                                        theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                                        emojiStyle={EmojiStyle.APPLE}
                                        onEmojiClick={(data) => {
                                            setNewMessage(prev => prev + data.emoji);
                                        }}
                                        lazyLoadEmojis={true}
                                    />
                                </PopoverContent>
                            </Popover>

                            {newMessage.trim() || attachments.length > 0 ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <Button
                                        onClick={() => handleSend()}
                                        disabled={isUploading}
                                        size="icon"
                                        className={cn(
                                            "rounded-full h-8 w-8 bg-zinc-900 hover:bg-black text-white shadow-lg transition-all hover:scale-105 active:scale-95 ml-1",
                                            isUploading && "opacity-70 cursor-wait"
                                        )}
                                    >
                                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setIsRecording(true);
                                            soundEffects.playSlideUp();
                                        }}
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-105 ml-1"
                                    >
                                        <Mic size={18} />
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {editingFileIndex !== null && attachments[editingFileIndex] && (
                <ImageEditor
                    open={editorOpen}
                    onOpenChange={(open) => {
                        setEditorOpen(open);
                        if (!open) setEditingFileIndex(null);
                    }}
                    imageSrc={URL.createObjectURL(attachments[editingFileIndex])}
                    onSave={(newFile) => {
                        setAttachments(prev => {
                            const clone = [...prev];
                            clone[editingFileIndex as number] = newFile;
                            return clone;
                        });
                    }}
                />
            )}
        </div>
    );
}
