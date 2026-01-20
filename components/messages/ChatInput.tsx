
"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, ImageIcon, Smile, Send, Mic, X, File as FileIcon, Trash2, StopCircle, Film, MapPin } from "lucide-react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { uploadFiles } from "@/lib/upload";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { GifPicker } from "./GifPicker";
import { ImageEditor } from "./ImageEditor";
import { Pencil } from "lucide-react";

interface ChatInputProps {
    onSendMessage: (content: string, type: string, files?: File[], metadata?: any) => Promise<void>;
    triggerTyping: () => void;
    replyingTo: any;
    setReplyingTo: (msg: any) => void;
}

export function ChatInput({ onSendMessage, triggerTyping, replyingTo, setReplyingTo }: ChatInputProps) {
    const [newMessage, setNewMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(4));
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Image Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);

    // File Drop Handling
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setAttachments((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        maxSize: 100 * 1024 * 1024, // 100MB
    });

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            // Setup Visualizer
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 64; // Small size for fewer bars
            analyserRef.current = analyser;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVisualizer = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                // Extract a subset of data for bars (e.g., first 20 bins)
                const bars = Array.from(dataArray).slice(0, 20).map(val => Math.max(4, val / 255 * 24)); // Scale height
                setVisualizerData(bars);
                animationFrameRef.current = requestAnimationFrame(updateVisualizer);
            };
            updateVisualizer();

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            clearInterval(timerRef.current as NodeJS.Timeout);

            // Cleanup Visualizer
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            audioContextRef.current = null;
            analyserRef.current = null;

            setIsRecording(false);
        }
    };

    const sendRecording = () => {
        if (!mediaRecorderRef.current) return;

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });

            await onSendMessage("", "AUDIO", [audioFile]);

            setRecordingDuration(0);
            setIsRecording(false);
        };
        stopRecording();
    };

    const cancelRecording = () => {
        stopRecording();
        setRecordingDuration(0);
        audioChunksRef.current = [];
    };

    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
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
            alert("Géolocalisation non supportée par votre navigateur.");
            return;
        }

        setIsUploading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Reverse Geocoding optional (ignoring for now to save delay)

                await onSendMessage("📍 Position partagée", "TEXT", undefined, {
                    lat: latitude,
                    lng: longitude,
                    type: "location"
                });
                setIsUploading(false);
            },
            (error) => {
                console.error("Location error", error);
                alert("Impossible de récupérer votre position.");
                setIsUploading(false);
            }
        );
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!newMessage.trim() && attachments.length === 0) || isUploading) return;

        try {
            setIsUploading(true);

            // Pass attachments directly (ChatWindow handles compression/upload)
            const type = attachments.length > 0
                ? (attachments.every(f => f.type.startsWith("image/")) ? "IMAGE" : "FILE")
                : "TEXT";

            await onSendMessage(newMessage, type, attachments.length > 0 ? attachments : undefined);

            // Reset
            setNewMessage("");
            setAttachments([]);
            setReplyingTo(null);
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div {...getRootProps()} className={cn("p-4 bg-white/90 backdrop-blur-xl border-t border-zinc-100 relative z-40", isDragActive && "bg-orange-50/90")}>
            <input {...getInputProps()} />

            {/* Drag Overlay */}
            {isDragActive && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-orange-100/50 backdrop-blur-sm rounded-t-xl border-2 border-dashed border-orange-400">
                    <p className="text-orange-600 font-medium">Déposez vos fichiers ici</p>
                </div>
            )}

            {/* Typing Indicator & Reply UI would be outside of this component or passed as slots, 
                but for now we are replacing the bottom block of ChatWindow. 
                Wait, Typign Indicator is rendered in ChatWindow. 
                Reply UI is separate in ChatWindow.
            */}

            {/* Custom File Previews */}
            {attachments.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-zinc-200">
                    {attachments.map((file, i) => (
                        <div key={i} className="relative flex-shrink-0 group">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
                                {file.type.startsWith("image/") ? (
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        width={64}
                                        height={64}
                                        className="object-cover w-full h-full"
                                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                    />
                                ) : (
                                    <FileIcon className="text-zinc-400" size={24} />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeAttachment(i)}
                                className="absolute -top-1.5 -right-1.5 bg-zinc-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                            {file.type.startsWith("image/") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingFileIndex(i);
                                        setEditorOpen(true);
                                    }}
                                    className="absolute -bottom-1.5 -right-1.5 bg-orange-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <Pencil size={10} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                {/* Attachments Trigger */}
                <div className="flex items-center gap-1 pb-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={openFilePicker}
                        className="text-zinc-400 hover:text-orange-500 hover:bg-orange-50 rounded-full h-9 w-9 transition-colors"
                    >
                        <Paperclip size={20} />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={openFilePicker} // Image Icon also opens generic picker for now, or assume image only
                        className="text-zinc-400 hover:text-orange-500 hover:bg-orange-50 rounded-full h-9 w-9 hidden md:flex transition-colors"
                    >
                        <ImageIcon size={20} />
                    </Button>
                    <GifPicker onGifSelect={handleGifSelect}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-pink-500 hover:bg-pink-50 rounded-full h-9 w-9 hidden md:flex transition-colors"
                        >
                            <span className="font-bold text-[10px] border border-current rounded px-0.5">GIF</span>
                        </Button>
                    </GifPicker>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleLocationShare}
                        className="text-zinc-400 hover:text-green-500 hover:bg-green-50 rounded-full h-9 w-9 hidden md:flex transition-colors"
                    >
                        <MapPin size={20} />
                    </Button>
                </div>

                {/* Send / Mic */}
                {isRecording ? (
                    <div className="flex-1 flex items-center justify-between bg-red-50 px-4 rounded-2xl border border-red-100 animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-600 font-mono font-medium">{formatDuration(recordingDuration)}</span>
                            {/* Real-time Visualizer */}
                            <div className="flex items-center gap-0.5 h-8">
                                {visualizerData.map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-red-400 rounded-full transition-all duration-75 ease-linear"
                                        style={{ height: `${h}px` }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500 hover:bg-red-100 rounded-full h-9 w-9" onClick={cancelRecording}>
                                <Trash2 size={20} />
                            </Button>
                            <Button type="button" size="icon" className="rounded-full h-10 w-10 bg-red-500 hover:bg-red-600 text-white" onClick={sendRecording}>
                                <Send size={18} className="ml-0.5" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Text Input Block */}
                        <div className="flex-1 bg-zinc-100 border border-transparent focus-within:border-orange-200 rounded-2xl flex items-center p-1 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all shadow-inner">
                            <Input
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    triggerTyping();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={attachments.length > 0 ? "Ajouter une légende..." : "Écrivez un message..."}
                                className="bg-transparent border-none text-zinc-900 focus-visible:ring-0 min-h-[44px] placeholder:text-zinc-400"
                                disabled={isUploading}
                            />
                            <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-orange-500 hover:bg-transparent rounded-full h-8 w-8 mr-1 transition-colors">
                                <Smile size={20} />
                            </Button>
                        </div>

                        {/* Send / Mic Button */}
                        {newMessage.trim() || attachments.length > 0 ? (
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isUploading}
                                className={cn(
                                    "rounded-full h-10 w-10 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 mb-0.5",
                                    isUploading && "opacity-70 cursor-wait"
                                )}
                            >
                                <Send size={18} className={cn("ml-0.5", isUploading && "animate-pulse")} />
                            </Button>
                        ) : (
                            <Button type="button" size="icon" onClick={startRecording} className="rounded-full h-10 w-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-all hover:scale-105 mb-0.5">
                                <Mic size={20} />
                            </Button>
                        )}
                    </>
                )}
            </form>

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

