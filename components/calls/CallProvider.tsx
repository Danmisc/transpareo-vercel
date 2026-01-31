"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import SimplePeer, { Instance as PeerInstance } from "simple-peer";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";
import { CallOverlay, IncomingCallDialog } from "./CallOverlay";
import { soundEffects } from "@/components/ui/sound-effects";

interface CallContextType {
    callUser: (user: { id: string, name: string, avatar?: string, isGroup?: boolean, participants?: any[] }, isVideo?: boolean) => void;
    endCall: () => void;
    answerCall: () => void;
    rejectCall: () => void;
    callState: "IDLE" | "CALLING" | "RINGING" | "CONNECTED";
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    toggleVideo: () => void;
    toggleAudio: () => void;
    activeCallUser: { name: string, avatar?: string } | null;
}

const CallContext = createContext<CallContextType | null>(null);

export function useCall() {
    const context = useContext(CallContext);
    if (!context) throw new Error("useCall must be used within a CallProvider");
    return context;
}

export function CallProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [callState, setCallState] = useState<"IDLE" | "CALLING" | "RINGING" | "CONNECTED">("IDLE");
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [incomingCall, setIncomingCall] = useState<{ callerId: string, callerName?: string, callerAvatar?: string, signal: any, isVideo: boolean } | null>(null);
    const [activeCallUser, setActiveCallUser] = useState<{ name: string, avatar?: string } | null>(null);

    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    const connectionRef = useRef<PeerInstance | null>(null);
    // Ref to track current call details for event handlers
    const activeCallUserRef = useRef<{ id: string, name?: string, isGroup?: boolean, participants?: any[] } | null>(null);
    const callStateRef = useRef(callState);
    const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [callStartTime, setCallStartTime] = useState<number | null>(null);

    // Keep ref in sync
    useEffect(() => {
        callStateRef.current = callState;
    }, [callState]);

    useEffect(() => {
        if (!session?.user?.id) return;

        const channel = pusherClient.subscribe(`private-user-${session.user.id}`);

        channel.bind("incoming-call", (data: any) => {
            console.log("Incoming call from", data.callerId);

            // BUSY: Already on a call, auto-reject
            if (callStateRef.current !== "IDLE") {
                console.log("Busy - auto-rejecting call");
                triggerSignal(data.callerId, "call-busy", {});
                return;
            }

            setIncomingCall(data);
            setCallState("RINGING");
            soundEffects.playRingtone();
        });

        channel.bind("accepted-call", (data: any) => {
            console.log("Call accepted by", data.responderId);

            // Clear timeout
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
            }

            // GROUP CALL LOGIC: If this was a group call, cancel ringing for others
            const currentUser = activeCallUserRef.current;
            if (currentUser?.isGroup && currentUser.participants) {
                console.log("Group call accepted - cancelling others");
                currentUser.participants.forEach((p: any) => {
                    // Don't cancel the person who answered, and don't signal ourselves
                    if (p.userId !== session?.user?.id && p.userId !== data.responderId) {
                        triggerSignal(p.userId, "call-answered-elsewhere", {
                            groupName: currentUser.name || "Groupe"
                        });
                    }
                });
            }

            soundEffects.stopRing();
            soundEffects.playCallConnect();
            setCallStartTime(Date.now());
            setCallState("CONNECTED");

            if (connectionRef.current) {
                connectionRef.current.signal(data.signal);
            }
        });

        channel.bind("call-rejected", () => {
            console.log("Call rejected");
            toast.error("Appel refusé");
            soundEffects.playCallEnd();
            cleanupCall();
        });

        channel.bind("call-ended", () => {
            console.log("Remote ended call");
            toast.info("Appel terminé");
            soundEffects.playCallEnd();
            cleanupCall();
        });

        channel.bind("call-busy", () => {
            console.log("User is busy");
            toast.info("L'utilisateur est déjà en communication");
            soundEffects.playCallEnd();
            cleanupCall();
        });

        channel.bind("call-no-answer", () => {
            console.log("Caller stopped ringing (timeout)");
            soundEffects.stopRing();
            cleanupCall();
        });

        channel.bind("call-answered-elsewhere", (data: any) => {
            console.log("Call answered by someone else in group");
            toast.info(`Appel ${data?.groupName ? `de ${data.groupName} ` : ""}pris par quelqu'un d'autre`);
            soundEffects.stopRing();
            cleanupCall();
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`private-user-${session.user.id}`);
            soundEffects.stopRing();
        };
    }, [session?.user?.id]);

    const cleanupCall = () => {
        // Clear timeout
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
        }

        setCallState("IDLE");
        setIncomingCall(null);
        setActiveCallUser(null);
        setCallStartTime(null);
        activeCallUserRef.current = null;
        soundEffects.stopRing();

        if (connectionRef.current) {
            connectionRef.current.destroy();
            connectionRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
    };

    const callUser = async (user: { id: string, name: string, avatar?: string, isGroup?: boolean, participants?: any[] }, isVideo: boolean = true) => {
        // Clear any existing timeout
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
        }

        setIsVideoEnabled(isVideo);
        setCallState("CALLING");
        setActiveCallUser(user);
        // Store full user info in ref for the accepted-call handler
        activeCallUserRef.current = {
            id: user.id,
            name: user.name,
            isGroup: user.isGroup,
            participants: user.participants
        };

        soundEffects.playOutboundRing();

        // Set 30 second timeout for no answer
        callTimeoutRef.current = setTimeout(() => {
            if (callStateRef.current === "CALLING") {
                toast.error("Pas de réponse");
                soundEffects.playCallEnd();

                // Notify callee that we stopped ringing
                if (user.isGroup && user.participants) {
                    user.participants.forEach((p: any) => {
                        if (p.userId !== session?.user?.id) {
                            triggerSignal(p.userId, "call-no-answer", {});
                        }
                    });
                } else {
                    triggerSignal(user.id, "call-no-answer", {});
                }

                cleanupCall();
            }
        }, 30000);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
            setLocalStream(stream);

            const peer = new SimplePeer({
                initiator: true,
                trickle: false,
                stream: stream,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            peer.on("signal", (data) => {
                if (user.isGroup && user.participants) {
                    // BROADCAST to all participants (Ring Everyone)
                    user.participants.forEach((p: any) => {
                        if (p.userId !== session?.user?.id) {
                            triggerSignal(p.userId, "incoming-call", {
                                callerId: session?.user?.id,
                                callerName: session?.user?.name,
                                callerAvatar: session?.user?.image,
                                signal: data,
                                isVideo,
                                isGroupCall: true,
                                groupName: user.name
                            });
                        }
                    });
                } else {
                    // 1:1 Call
                    triggerSignal(user.id, "incoming-call", {
                        callerId: session?.user?.id,
                        callerName: session?.user?.name,
                        callerAvatar: session?.user?.image,
                        signal: data,
                        isVideo
                    });
                }
            });

            peer.on("stream", (currentRemoteStream) => {
                // Clear timeout on successful connection
                if (callTimeoutRef.current) {
                    clearTimeout(callTimeoutRef.current);
                    callTimeoutRef.current = null;
                }
                setRemoteStream(currentRemoteStream);
                setCallState("CONNECTED");
                setCallStartTime(Date.now());
                soundEffects.stopRing();
            });

            peer.on("close", cleanupCall);
            peer.on("error", (err) => {
                console.error("Peer error", err);
                toast.error("Erreur de connexion");
                cleanupCall();
            });

            connectionRef.current = peer;

        } catch (err: any) {
            console.error("Failed to get local stream", err);
            cleanupCall();
            if (err.name === "NotAllowedError") {
                toast.error("Accès à la caméra/micro refusé. Vérifiez les permissions.");
            } else if (err.name === "NotFoundError") {
                toast.error("Aucun périphérique audio/vidéo trouvé.");
            } else {
                toast.error("Impossible d'accéder à la caméra/micro");
            }
        }
    };

    const answerCall = async () => {
        if (!incomingCall) return;
        soundEffects.stopRing();
        setCallState("CONNECTED");
        setActiveCallUser({ name: incomingCall.callerName || "Appelant", avatar: incomingCall.callerAvatar });
        activeCallUserRef.current = { id: incomingCall.callerId };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.isVideo, audio: true });
            setLocalStream(stream);

            const peer = new SimplePeer({
                initiator: false,
                trickle: false,
                stream: stream
            });

            peer.on("signal", (data) => {
                triggerSignal(incomingCall.callerId, "accepted-call", {
                    signal: data,
                    responderId: session?.user?.id
                });
            });

            peer.on("stream", (currentRemoteStream) => {
                setRemoteStream(currentRemoteStream);
            });

            peer.on("close", cleanupCall);
            peer.on("error", (err) => {
                console.error("Peer error", err);
                cleanupCall();
            });

            peer.signal(incomingCall.signal);
            connectionRef.current = peer;
            soundEffects.playCallConnect();

        } catch (err) {
            console.error("Failed to answer call", err);
            cleanupCall();
        }
    };

    const rejectCall = () => {
        if (incomingCall) {
            triggerSignal(incomingCall.callerId, "call-rejected", {});
        }
        soundEffects.stopRing();
        soundEffects.playCallEnd();
        cleanupCall();
    };

    const endCall = () => {
        if (activeCallUserRef.current?.id) {
            triggerSignal(activeCallUserRef.current.id, "call-ended", {});
        }
        soundEffects.playCallEnd();
        cleanupCall();
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const triggerSignal = async (targetId: string, event: string, data: any) => {
        try {
            const res = await fetch("/api/pusher/trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channel: `private-user-${targetId}`, event, data })
            });
            if (!res.ok) {
                console.error("Failed to trigger signal:", await res.text());
            }
        } catch (err) {
            console.error("Signal error:", err);
        }
    };

    return (
        <CallContext.Provider value={{
            callUser, endCall, answerCall, rejectCall, callState,
            localStream, remoteStream,
            isVideoEnabled, isAudioEnabled, toggleVideo, toggleAudio, activeCallUser
        }}>
            {children}
            {callState !== "IDLE" && callState !== "RINGING" && <CallOverlay />}
            {callState === "RINGING" && incomingCall && (
                <IncomingCallDialog
                    callerName={incomingCall.callerName}
                    callerAvatar={incomingCall.callerAvatar}
                    onAccept={answerCall}
                    onDecline={rejectCall}
                    isVideo={incomingCall.isVideo}
                />
            )}
        </CallContext.Provider>
    );
}
