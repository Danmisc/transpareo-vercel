"use client";

import { useCall } from "./CallProvider";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Minimize2, Maximize2 } from "lucide-react";
import Draggable from "react-draggable";
import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function CallOverlay() {
    const {
        localStream, remoteStream, endCall, callState,
        toggleVideo, toggleAudio, isVideoEnabled, isAudioEnabled, activeCallUser
    } = useCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const nodeRef = useRef(null);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream, isMinimized]);

    if (callState === "IDLE") return null;

    if (isMinimized) {
        return (
            <Draggable defaultPosition={{ x: 20, y: 20 }} nodeRef={nodeRef}>
                <div ref={nodeRef} className="fixed z-50 w-64 bg-black rounded-xl shadow-2xl overflow-hidden cursor-move border border-zinc-800">
                    <div className="relative aspect-video bg-zinc-900 group">
                        {remoteStream ? (
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/50 text-xs">
                                En attente...
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 text-white opacity-0 group-hover:opacity-100 hover:bg-black/50"
                            onClick={() => setIsMinimized(false)}
                        >
                            <Maximize2 size={14} />
                        </Button>
                    </div>
                </div>
            </Draggable>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-zinc-900/95 backdrop-blur-md flex flex-col items-center justify-center">

            {/* Main Content */}
            <div className="relative w-full h-full max-w-5xl mx-auto flex flex-col">
                {/* Header Actions */}
                <div className="absolute top-4 left-4 z-10">
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setIsMinimized(true)}>
                        <Minimize2 className="mr-2 h-4 w-4" /> Réduire
                    </Button>
                </div>

                {/* Video Area */}
                <div className="flex-1 relative overflow-hidden rounded-none md:rounded-2xl bg-black md:my-4 md:mx-4 shadow-2xl">
                    {remoteStream ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                        // Calling / Ringing State UI
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-white/10 shadow-xl">
                                    <AvatarImage src={activeCallUser?.avatar} />
                                    <AvatarFallback className="text-4xl bg-orange-500 text-white">{activeCallUser?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 animate-ping" />
                            </div>
                            <h2 className="mt-8 text-2xl font-bold text-white">{activeCallUser?.name}</h2>
                            <p className="text-white/60 animate-pulse mt-2">
                                {callState === "CALLING" ? "Appel en cours..." : "Connexion..."}
                            </p>
                        </div>
                    )}

                    {/* Local Video (PIP in Fullscreen) */}
                    {localStream && (
                        <div className="absolute bottom-24 right-4 w-32 md:w-48 aspect-video bg-zinc-800 rounded-lg overflow-hidden shadow-lg border border-white/10">
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Controls Bar */}
                <div className="h-24 flex items-center justify-center gap-6 pb-4">
                    <Button
                        variant={isAudioEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg"
                        onClick={toggleAudio}
                    >
                        {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-16 w-16 rounded-full shadow-lg bg-red-600 hover:bg-red-700"
                        onClick={endCall}
                    >
                        <PhoneOff size={32} />
                    </Button>

                    <Button
                        variant={isVideoEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg"
                        onClick={toggleVideo}
                    >
                        {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function IncomingCallDialog({ callerName, callerAvatar, onAccept, onDecline, isVideo }: any) {
    return (
        <div className="fixed bottom-4 right-4 z-[60] w-80 bg-card p-4 rounded-xl shadow-2xl border border-border animate-in slide-in-from-bottom-10">
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={callerAvatar} />
                    <AvatarFallback>{callerName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-lg">{callerName}</h3>
                    <p className="text-muted-foreground text-sm">Appel {isVideo ? "vidéo" : "audio"} en cours...</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onDecline}>Refuser</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={onAccept}>Accepter</Button>
            </div>
        </div>
    );
}
