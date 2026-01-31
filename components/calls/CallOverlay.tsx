"use client";

import { useCall } from "./CallProvider";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Minimize2, Maximize2, Phone, X } from "lucide-react";
import Draggable from "react-draggable";
import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export function CallOverlay() {
    const { data: session } = useSession();
    const {
        localStream, remoteStream, endCall, callState,
        toggleVideo, toggleAudio, isVideoEnabled, isAudioEnabled, activeCallUser,
        callStartTime
    } = useCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const nodeRef = useRef(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [duration, setDuration] = useState("00:00");

    useEffect(() => {
        if (callState === "CONNECTED" && callStartTime) {
            const interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.floor((now - callStartTime) / 1000);
                const minutes = Math.floor(diff / 60);
                const seconds = diff % 60;
                setDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setDuration("00:00");
        }
    }, [callState, callStartTime]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream, isMinimized]);

    if (callState === "IDLE") return null;

    return (
        <AnimatePresence mode="wait">
            {isMinimized ? (
                <Draggable defaultPosition={{ x: 20, y: 20 }} nodeRef={nodeRef}>
                    <div ref={nodeRef} className="fixed z-50 w-48 md:w-64 aspect-[9/16] md:aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden cursor-move border border-zinc-800 ring-1 ring-white/10">
                        <div className="relative w-full h-full bg-zinc-900 group">
                            {remoteStream && activeCallUser?.name ? (
                                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                                    <Avatar className="w-12 h-12 border-2 border-white/20">
                                        <AvatarImage src={activeCallUser?.avatar} />
                                        <AvatarFallback>{activeCallUser?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-white/70 font-medium truncate max-w-full">
                                        {callState === "CONNECTED" ? activeCallUser?.name : "Connexion..."}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setIsMinimized(false)}
                                >
                                    <Maximize2 size={16} />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={endCall}
                                >
                                    <PhoneOff size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Draggable>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
                >
                    <div className="relative w-full h-full max-w-6xl bg-zinc-900 overflow-hidden rounded-3xl border border-white/10 shadow-2xl flex flex-col">

                        {/* Header Controls */}
                        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMinimized(true)}
                                className="text-white hover:bg-white/10 rounded-full backdrop-blur-md"
                            >
                                <Minimize2 className="mr-2 h-4 w-4" /> Réduire
                            </Button>

                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <div className={cn("w-2 h-2 rounded-full", callState === "CONNECTED" ? "bg-green-500 animate-pulse" : "bg-yellow-500")} />
                                    <span className="text-xs font-medium text-white/90">
                                        {callState === "CONNECTED" ? "En appel" : callState === "CALLING" ? "Appel en cours..." : "Connexion"}
                                    </span>
                                </div>
                                {callState === "CONNECTED" && (
                                    <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                                        <span className="text-sm font-mono font-medium text-white/80 tabular-nums">
                                            {duration}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Video Area */}
                        <div className="flex-1 relative bg-black flex items-center justify-center">
                            {remoteStream ? (
                                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            ) : (
                                /* Calling UI */
                                <div className="flex flex-col items-center gap-8 relative z-10">
                                    <div className="relative flex items-center justify-center">
                                        {/* Cinematic Ripple Animation */}
                                        <div className="absolute w-[300px] h-[300px] border border-orange-500/30 rounded-full animate-[ping_3s_ease-out_infinite] opacity-50" />
                                        <div className="absolute w-[250px] h-[250px] border border-orange-500/20 rounded-full animate-[ping_3s_ease-out_infinite_500ms]" />
                                        <div className="absolute w-[200px] h-[200px] bg-orange-500/10 rounded-full animate-pulse blur-2xl" />

                                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white/10 shadow-2xl ring-4 ring-black/50 z-10 relative">
                                            <AvatarImage src={activeCallUser?.avatar} />
                                            <AvatarFallback className="text-4xl bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                                                {activeCallUser?.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="text-center space-y-2 relative z-20">
                                        <h2 className="text-3xl font-bold text-white tracking-tight">{activeCallUser?.name}</h2>
                                        <p className="text-white/50 text-lg animate-pulse">Sonnerie en cours...</p>
                                    </div>
                                </div>
                            )}

                            {/* Self View (PIP) */}
                            {localStream && (
                                <motion.div
                                    drag
                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    className="absolute bottom-24 right-4 md:bottom-8 md:right-8 w-32 md:w-56 aspect-[3/4] md:aspect-video bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-white/20 z-30 cursor-grab active:cursor-grabbing"
                                >
                                    <video ref={localVideoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", !isVideoEnabled && "hidden")} />
                                    {!isVideoEnabled && (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={session?.user?.image || undefined} />
                                                <AvatarFallback className="bg-zinc-700"><VideoOff className="text-zinc-500" /></AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Controls Bar */}
                        <div className="h-24 md:h-28 flex items-center justify-center gap-6 bg-black/80 backdrop-blur-xl border-t border-white/5 relative z-20">
                            <Button
                                variant={isAudioEnabled ? "secondary" : "destructive"}
                                size="icon"
                                className={cn("h-14 w-14 rounded-full transition-all duration-300", isAudioEnabled ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50")}
                                onClick={toggleAudio}
                            >
                                {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                            </Button>

                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-16 w-16 rounded-full shadow-lg bg-red-600 hover:bg-red-700 hover:scale-105 transition-all duration-300 ring-4 ring-red-900/20"
                                onClick={endCall}
                            >
                                <PhoneOff size={32} />
                            </Button>

                            <Button
                                variant={isVideoEnabled ? "secondary" : "destructive"}
                                size="icon"
                                className={cn("h-14 w-14 rounded-full transition-all duration-300", isVideoEnabled ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50")}
                                onClick={toggleVideo}
                            >
                                {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function IncomingCallDialog({ callerName, callerAvatar, onAccept, onDecline, isVideo }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-4 right-4 md:bottom-6 md:right-6 md:top-auto z-[60] w-full max-w-sm"
        >
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-700/50 ring-1 ring-black/5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-white dark:border-zinc-800 shadow-md">
                            <AvatarImage src={callerAvatar} />
                            <AvatarFallback className="text-lg bg-orange-100 text-orange-700">{callerName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
                            {isVideo ? <Video size={12} className="text-white" /> : <Phone size={12} className="text-white" />}
                        </span>
                        {/* Pulse Ring */}
                        <span className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-20" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">{callerName}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium animate-pulse">
                            Appel {isVideo ? "vidéo" : "audio"} entrant...
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onDecline}
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 h-12"
                    >
                        <X size={18} className="mr-2" />
                        Refuser
                    </Button>
                    <Button
                        size="lg"
                        onClick={onAccept}
                        className="rounded-xl bg-green-600 hover:bg-green-700 text-white h-12 shadow-lg shadow-green-600/20"
                    >
                        <Phone size={18} className="mr-2" />
                        Accepter
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
