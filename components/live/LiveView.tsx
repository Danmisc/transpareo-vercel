"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User as UserIcon, Heart, X, StopCircle, Share2, MoreHorizontal, VideoOff } from "lucide-react";
import { addComment, stopLiveStream, toggleReaction } from "@/lib/actions"; // Assuming these exist
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LiveViewProps {
    post: any;
    liveStream: any;
    currentUser: any;
}

export function LiveView({ post, liveStream, currentUser }: LiveViewProps) {
    const isBroadcaster = currentUser?.id === post.authorId;
    const videoRef = useRef<HTMLVideoElement>(null);
    const [comments, setComments] = useState(post.comments || []);
    const [viewerCount, setViewerCount] = useState(liveStream.peakViewers || 1);
    const [input, setInput] = useState("");
    const [isLive, setIsLive] = useState(liveStream.status === "LIVE");
    const router = useRouter();
    const [hearts, setHearts] = useState<{ id: number, style: React.CSSProperties }[]>([]);

    const [cameraError, setCameraError] = useState<string | null>(null);
    const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);

    const requestCamera = async () => {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError("L'API MediaDevices n'est pas supportée par votre navigateur.");
            return;
        }

        try {
            // Simplify constraints to just video: true for maximum compatibility
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err: any) {
            console.error("Camera access error:", err);

            // On error, let's list what we can see to help debug
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                setDeviceList(devices);
            } catch (e) {
                console.error("Failed to enumerate devices", e);
            }

            // Friendly error messages
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setCameraError("Accès refusé. Veuillez autoriser la caméra dans la barre d'adresse.");
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setCameraError("Aucune caméra détectée. Vérifiez qu'elle est bien branchée.");
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setCameraError("La caméra est peut-être déjà utilisée par une autre application (Zoom, Teams, etc.).");
            } else {
                setCameraError(`Erreur: ${err.message || err.name}`);
            }
        }
    };

    // Broadcaster: Access Webcam
    useEffect(() => {
        if (isBroadcaster && isLive) {
            requestCamera();
        }

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isBroadcaster, isLive]);

    // Viewer Count Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setViewerCount((prev: number) => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleStop = async () => {
        if (confirm("Arrêter le live ?")) {
            await stopLiveStream(liveStream.id);
            setIsLive(false);
            router.push("/");
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !currentUser) return;

        const newComment = {
            id: Date.now().toString(),
            content: input,
            user: { name: currentUser.name, avatar: currentUser.image },
            createdAt: new Date().toISOString()
        };
        setComments([newComment, ...comments]);
        setInput("");

        await addComment(post.id, currentUser.id, input);
    };

    const handleReaction = async () => {
        const id = Date.now();
        const style = {
            left: `${50 + (Math.random() * 40 - 20)}%`,
            animationDuration: `${1 + Math.random()}s`
        };
        setHearts(prev => [...prev, { id, style }]);
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== id));
        }, 2000);

        if (currentUser) {
            // Debounce or fire and forget
            await toggleReaction(post.id, currentUser.id, "POST", "REACTION", "❤️");
        }
    };

    return (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden flex flex-col md:flex-row">

            {/* CLOSE BUTTON */}
            <div className="absolute top-4 right-4 z-50">
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40 text-white" onClick={() => router.push("/")}>
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* VIDEO BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-900">
                {isLive ? (
                    isBroadcaster ? (
                        cameraError ? (
                            <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-800 text-center p-6">
                                <div className="bg-red-500/20 p-6 rounded-full mb-4">
                                    <VideoOff className="h-12 w-12 text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Problème de caméra</h2>
                                <p className="text-red-400 mb-4 max-w-sm font-medium">
                                    {cameraError}
                                </p>

                                {deviceList.length > 0 && (
                                    <div className="text-xs text-left bg-black/40 p-2 rounded mb-4 max-w-xs max-h-32 overflow-y-auto">
                                        <p className="font-bold text-gray-400 mb-1">Périphériques détectés :</p>
                                        {deviceList.map((d, i) => (
                                            <div key={i} className="truncate">
                                                {d.kind === 'videoinput' ? '📷' : d.kind === 'audioinput' ? '🎤' : '🔊'} {d.label || `Périphérique Inconnu (${d.kind})`}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button onClick={requestCamera} variant="secondary">
                                    Réessayer
                                </Button>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="h-full w-full object-cover md:object-contain transform scale-x-[-1]"
                                />
                                {/* Optional: Debug Info */}
                                {/* <div className="absolute top-2 left-2 text-[10px] text-green-500 bg-black/50 px-1">Camera OK</div> */}
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-900 text-gray-500">
                            {/* Placeholder for Viewers */}
                            <div className="bg-white/10 p-8 rounded-full mb-4 animate-pulse">
                                <UserIcon className="h-16 w-16 text-white/50" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">En attente de connexion...</h2>
                            <p className="max-w-md text-center px-4">
                                Le flux vidéo n'est pas disponible (Simulation: Le WebRTC requerrait un serveur de signalisation).
                            </p>
                        </div>
                    )
                ) : (
                    <div className="text-center z-10">
                        <h1 className="text-4xl font-bold mb-4">Live Terminé</h1>
                        <p className="text-muted-foreground mb-6">Merci d'avoir regardé !</p>
                        <Button onClick={() => router.push("/")} className="bg-white text-black hover:bg-white/90">Retour à l'accueil</Button>
                    </div>
                )}
            </div>

            {/* FLOATING HEARTS ANIMATION CONTAINER */}
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                {hearts.map(heart => (
                    <div
                        key={heart.id}
                        className="absolute bottom-20 text-4xl animate-float-up opacity-0"
                        style={heart.style}
                    >
                        ❤️
                    </div>
                ))}
            </div>

            {/* INTERFACE LAYER */}
            {isLive && (
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 pointer-events-none">

                    {/* TOP BAR */}
                    <div className="flex items-start justify-between pointer-events-auto">
                        {/* Broadcaster Info */}
                        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10">
                            <Avatar className="h-8 w-8 ring-2 ring-primary">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>HO</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col pr-2">
                                <span className="text-xs font-bold leading-none">{post.author.name}</span>
                                <span className="text-[10px] text-white/70">En direct</span>
                            </div>
                            <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 rounded-full px-3">Suivre</Button>
                        </div>

                        {/* Live Status & Viewers */}
                        <div className="flex items-center gap-2">
                            <div className="bg-red-600 px-3 py-1 rounded-md text-xs font-bold shadow-lg shadow-red-600/20">
                                LIVE
                            </div>
                            <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border border-white/10">
                                <UserIcon className="h-3 w-3" />
                                {viewerCount}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM AREA */}
                    <div className="flex flex-col gap-4 mt-auto w-full max-w-lg mx-auto md:mx-0 pointer-events-auto">

                        {/* Comments Overlay */}
                        <div className="h-[200px] overflow-y-auto mask-image-gradient flex flex-col-reverse gap-2 px-2 scrollbar-none">
                            {comments.map((c: any) => (
                                <div key={c.id} className="flex gap-2 items-start bg-black/20 backdrop-blur-sm self-start rounded-xl px-3 py-2 max-w-[85%] border border-white/5 animate-in slide-in-from-left-4 fade-in duration-300">
                                    <Avatar className="h-6 w-6 mt-0.5">
                                        <AvatarImage src={c.user?.avatar || c.user?.image} />
                                        <AvatarFallback className="text-[10px] bg-primary/20">{c.user?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white/90 mb-0.5">{c.user?.name}</span>
                                        <span className="text-sm text-white leading-snug shadow-sm">{c.content}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center gap-2 pb-2">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Ajouter un commentaire..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    className="bg-black/40 border-white/20 text-white placeholder:text-white/50 rounded-full pl-4 pr-10 focus-visible:ring-primary h-11 backdrop-blur-md"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-1 top-1 h-9 w-9 text-white hover:bg-white/20 rounded-full"
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md h-11 w-11 border border-white/10">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md h-11 w-11 border border-white/10">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 hover:text-red-400 backdrop-blur-md h-11 w-11 border border-red-500/20"
                                    onClick={handleReaction}
                                >
                                    <Heart className="h-5 w-5 fill-current" />
                                </Button>
                            </div>
                        </div>

                        {/* Broadcaster Controls */}
                        {isBroadcaster && (
                            <div className="flex justify-center pb-4">
                                <Button variant="destructive" onClick={handleStop} className="rounded-full px-8 shadow-xl border border-red-400/30">
                                    <StopCircle className="mr-2 h-5 w-5" />
                                    Terminer le Live
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) scale(0.5); opacity: 1; }
                    100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
                }
                .animate-float-up {
                    animation-name: float-up;
                    animation-timing-function: ease-out;
                    animation-fill-mode: forwards;
                }
                .mask-image-gradient {
                    mask-image: linear-gradient(to bottom, transparent, black 20%);
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%);
                }
            `}</style>
        </div>
    );
}
