"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import SimplePeer, { Instance as PeerInstance } from "simple-peer";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";
import { CallOverlay, IncomingCallDialog } from "./CallOverlay";

interface CallContextType {
    callUser: (user: { id: string, name: string, avatar?: string }, isVideo?: boolean) => void;
    endCall: () => void;
    answerCall: () => void;
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

    useEffect(() => {
        if (!session?.user?.id) return;

        const channel = pusherClient.subscribe(`user-${session.user.id}`);

        channel.bind("incoming-call", (data: any) => {
            console.log("Incoming call from", data.callerId);
            if (callState !== "IDLE") return;
            setIncomingCall(data);
            setCallState("RINGING");
        });

        channel.bind("accepted-call", (data: any) => {
            console.log("Call accepted, signal received");
            if (connectionRef.current) {
                connectionRef.current.signal(data.signal);
            }
        });

        return () => {
            channel.unbind("incoming-call");
            channel.unbind("accepted-call");
            pusherClient.unsubscribe(`user-${session.user.id}`);
        };
    }, [session, callState]);

    const callUser = async (user: { id: string, name: string, avatar?: string }, isVideo: boolean = true) => {
        setIsVideoEnabled(isVideo);
        setCallState("CALLING");
        setActiveCallUser(user);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
            setLocalStream(stream);

            const peer = new SimplePeer({
                initiator: true,
                trickle: false,
                stream: stream
            });

            peer.on("signal", (data) => {
                triggerSignal(user.id, "incoming-call", {
                    callerId: session?.user?.id,
                    callerName: session?.user?.name,
                    callerAvatar: session?.user?.image,
                    signal: data,
                    isVideo
                });
            });

            peer.on("stream", (currentRemoteStream) => {
                setRemoteStream(currentRemoteStream);
                setCallState("CONNECTED");
            });

            connectionRef.current = peer;

        } catch (err) {
            console.error("Failed to get local stream", err);
            setCallState("IDLE");
            toast.error("Impossible d'accéder à la caméra/micro");
        }
    };

    const answerCall = async () => {
        if (!incomingCall) return;
        setCallState("CONNECTED");
        setActiveCallUser({ name: incomingCall.callerName || "Appelant", avatar: incomingCall.callerAvatar });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.isVideo, audio: true });
            setLocalStream(stream);

            const peer = new SimplePeer({
                initiator: false,
                trickle: false,
                stream: stream
            });

            peer.on("signal", (data) => {
                triggerSignal(incomingCall.callerId, "accepted-call", { signal: data });
            });

            peer.on("stream", (currentRemoteStream) => {
                setRemoteStream(currentRemoteStream);
            });

            peer.signal(incomingCall.signal);
            connectionRef.current = peer;

        } catch (err) {
            console.error("Failed to answer call", err);
            endCall();
        }
    };

    const endCall = () => {
        setCallState("IDLE");
        setIncomingCall(null);
        setActiveCallUser(null);

        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
    };

    // ... toggle functions same as before ... 

    // Explicitly repeat toggle functions to ensure valid replacement
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
        await fetch("/api/pusher/trigger", {
            method: "POST",
            body: JSON.stringify({ channel: `user-${targetId}`, event, data })
        });
    };

    return (
        <CallContext.Provider value={{
            callUser, endCall, answerCall, callState,
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
                    onDecline={endCall}
                    isVideo={incomingCall.isVideo}
                />
            )}
        </CallContext.Provider>
    );
}

