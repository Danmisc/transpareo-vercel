"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Send, Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { soundEffects } from "@/components/ui/sound-effects";

interface VoiceRecorderProps {
    onSend?: (blob: Blob) => void;
    onCancel?: () => void;
    isSending?: boolean;
    initialAudioUrl?: string; // For playback only mode
    readOnly?: boolean;
}

export function VoiceRecorder({
    onSend,
    onCancel,
    isSending = false,
    initialAudioUrl,
    readOnly = false
}: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(30).fill(4));
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Audio for playback
    useEffect(() => {
        if (initialAudioUrl) {
            audioRef.current = new Audio(initialAudioUrl);
            audioRef.current.onended = () => setIsPlaying(false);
        }
    }, [initialAudioUrl]);

    const startRecording = async () => {
        if (readOnly || initialAudioUrl) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            // Visualizer Setup
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 64; // Increased resolution
            analyserRef.current = analyser;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVisualizer = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                // Map to 30 bars
                const bars = Array.from(dataArray).slice(0, 30).map(val => Math.max(4, val / 255 * 24));
                setVisualizerData(bars);
                animationFrameRef.current = requestAnimationFrame(updateVisualizer);
            };
            updateVisualizer();

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.start();
            setIsRecording(true);
            soundEffects.playStartRecord();

            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Microphone access denied:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                if (audioRef.current) URL.revokeObjectURL(audioRef.current.src);
                audioRef.current = new Audio(URL.createObjectURL(blob));
                audioRef.current.onended = () => setIsPlayingPreview(false);
            };

            cleanupAudioContext();
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRecording(false);
            soundEffects.playStopRecord();
        }
    };

    const cleanupAudioContext = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
    };

    const handleSend = () => {
        if (onSend && audioBlob) {
            onSend(audioBlob);
            soundEffects.playSend();
        }
    };

    const handleCancel = () => {
        cleanupAudioContext();
        if (audioRef.current && !initialAudioUrl) {
            URL.revokeObjectURL(audioRef.current.src);
            audioRef.current = null;
        }
        if (onCancel) {
            onCancel();
            soundEffects.playDelete();
        }
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (readOnly) {
                if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                } else {
                    audioRef.current.play();
                    setIsPlaying(true);
                }
            } else {
                if (isPlayingPreview) {
                    audioRef.current.pause();
                    setIsPlayingPreview(false);
                } else {
                    audioRef.current.play();
                    setIsPlayingPreview(true);
                }
            }
        }
    };

    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Auto-start
    useEffect(() => {
        if (!readOnly && !initialAudioUrl && !isRecording && !audioBlob) {
            startRecording();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 2 }}
            className={cn(
                "flex items-center gap-3 p-2 rounded-[26px] transition-all duration-300",
                // Mimic the ChatInput styles EXACTLY when active
                !readOnly
                    ? "bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
                    : "bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 w-full"
            )}
        >
            {!readOnly && (
                <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <Trash2 size={16} />
                </Button>
            )}

            {readOnly || audioBlob ? (
                <Button
                    onClick={togglePlayback}
                    size="icon"
                    className={cn(
                        "h-8 w-8 rounded-full shadow-sm transition-transform hover:scale-105",
                        readOnly ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white" : "bg-zinc-900 text-white"
                    )}
                >
                    {(readOnly ? isPlaying : isPlayingPreview) ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                </Button>
            ) : (
                <div className="relative flex items-center justify-center w-8 h-8">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20 animate-ping" />
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                </div>
            )}

            <div className="flex-1 flex items-center justify-center min-w-[120px] gap-3">
                <span className={cn(
                    "text-xs font-mono font-medium tabular-nums min-w-[40px] text-right",
                    isRecording ? "text-red-500" : "text-zinc-500"
                )}>
                    {formatDuration(duration)}
                </span>

                {/* Visualizer - Elegant Bars */}
                <div className="flex items-center gap-[2px] h-8 mx-2 overflow-hidden items-end pb-1.5">
                    {visualizerData.map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 4 }}
                            animate={{ height: readOnly ? 12 : Math.max(4, h) }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={cn(
                                "w-[3px] rounded-full",
                                readOnly ? "bg-zinc-300 dark:bg-zinc-600" : "bg-gradient-to-t from-red-500 to-orange-500"
                            )}
                        />
                    ))}
                </div>
            </div>

            {!readOnly && (
                isRecording ? (
                    <Button
                        onClick={stopRecording}
                        size="icon"
                        className="h-10 w-10 rounded-full bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                    >
                        <Square size={14} fill="currentColor" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSend}
                        size="icon"
                        disabled={isSending}
                        className={cn(
                            "h-10 w-10 rounded-full bg-zinc-900 hover:bg-black text-white shadow-lg transition-all hover:scale-105 active:scale-95",
                            isSending && "opacity-70 cursor-wait"
                        )}
                    >
                        <Send size={16} className={cn("ml-0.5", isSending && "animate-pulse")} />
                    </Button>
                )
            )}
        </motion.div>
    );
}
