"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Video, RefreshCcw, Loader2, ChevronRight, AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface PitchRecorderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (file: File | Blob) => Promise<void>;
}

type Step = "intro" | "setup" | "recording" | "review" | "upload";

export function PitchRecorder({ isOpen, onClose, onSave }: PitchRecorderProps) {
    const [step, setStep] = useState<Step>("intro");
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [debugInfo, setDebugInfo] = useState<string>("");

    // Media Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Cleanup/Setup & LocalStorage Check
    useEffect(() => {
        if (isOpen) {
            const hasSeenIntro = localStorage.getItem("hasSeenPitchIntro");
            if (hasSeenIntro === "true") {
                setStep("setup");
                startCamera();
            } else {
                setStep("intro");
            }
        } else {
            // Cleanup on close
            stopCamera();
            setStep("intro");
            setRecordedBlob(null);
            setPreviewUrl(null);
            setCameraError(null);
        }
    }, [isOpen]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    const startCamera = async () => {
        try {
            setCameraError(null);
            setDebugInfo("");

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("API_NOT_SUPPORTED");
            }

            // Diagnostics
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter(d => d.kind === 'videoinput');

                if (videoInputs.length === 0) throw new Error("NO_WEBCAM_FOUND");
            } catch (e) {
                console.warn("Enumeration failed:", e);
            }

            // Try Standard Audio/Video
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (avErr) {
                console.warn("AV failed, trying Video only", avErr);
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setDebugInfo(prev => prev + " (Audio désactivé suite erreur)");
            }

            streamRef.current = stream;

            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
            }

            // Audio Visualization
            if (stream.getAudioTracks().length > 0) {
                try {
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const analyser = audioContext.createAnalyser();
                    const source = audioContext.createMediaStreamSource(stream);
                    source.connect(analyser);
                    analyser.fftSize = 256;
                    audioContextRef.current = audioContext;
                    analyserRef.current = analyser;
                    visualizeAudio();
                } catch (audioErr) {
                    console.warn("Audio Context init failed", audioErr);
                }
            }

        } catch (err: any) {
            console.error("Camera Error:", err);
            let msg = "Erreur inconnue";
            if (err.name === 'NotFoundError' || err.message === "NO_WEBCAM_FOUND") {
                msg = "Aucune webcam trouvée.";
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = "Accès refusé par le navigateur.";
            } else if (err.name === 'NotReadableError') {
                msg = "Caméra déjà utilisée par une autre app ?";
            } else {
                msg = err.message || err.name;
            }
            setCameraError(msg);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };

    const visualizeAudio = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const tick = () => {
            analyserRef.current!.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((subject, value) => subject + value, 0) / dataArray.length;
            setAudioLevel(average);
            animationFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
    };

    const startRecording = () => {
        if (!streamRef.current) return;
        setStep("recording");
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    beginCapture();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const beginCapture = () => {
        if (!streamRef.current) return;
        try {
            const mediaRecorder = new MediaRecorder(streamRef.current);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                setRecordedBlob(blob);
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                setStep("review");
                stopCamera();
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Recording start error", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSave = async () => {
        if (!recordedBlob) return;
        setIsSaving(true);
        try {
            await onSave(recordedBlob);
            onClose();
        } catch (error: any) {
            console.error("Save failed", error);
            alert("Erreur lors de la sauvegarde: " + (error.message || "Inconnue"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setRecordedBlob(file);
            setPreviewUrl(url);
            setStep("review");
        }
    };

    const handleUploadSelect = () => {
        setStep("upload");
        stopCamera();
    };

    const goToSetup = () => {
        // Mark intro as seen
        localStorage.setItem("hasSeenPitchIntro", "true");
        setStep("setup");
        startCamera();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && !isRecording && !isSaving) onClose();
        }}>
            <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none overflow-hidden focus:outline-none [&>button]:hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-card dark:bg-zinc-950/95 border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row h-[600px] w-full"
                >
                    {/* LEFT SIDEBAR: Process & Info */}
                    <div className="w-full md:w-[320px] bg-muted/30 dark:bg-zinc-900/50 p-6 md:p-8 flex flex-col justify-between border-r border-border relative">
                        {/* Subtle Background Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Video className="w-4 h-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                                    Mon Pitch
                                </h2>
                            </div>
                            <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
                                Donnez vie à votre profil. Une courte vidéo de 30 secondes vaut mieux qu'un long discours.
                            </p>

                            <div className="space-y-4">
                                <StepItem active={step === "intro"} completed={step !== "intro"} label="Introduction" index={1} />
                                <StepItem active={step === "setup"} completed={["recording", "review"].includes(step)} label="Vérification" index={2} />
                                <StepItem active={step === "recording"} completed={step === "review"} label="Enregistrement" index={3} />
                                <StepItem active={step === "review"} completed={false} label="Validation" index={4} />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50">
                            {step !== "review" && step !== "recording" ? (
                                <Button variant="outline" className="w-full text-muted-foreground hover:text-foreground border-border/50" onClick={onClose}>
                                    Annuler
                                </Button>
                            ) : (
                                <p className="text-[10px] text-muted-foreground text-center animate-pulse">
                                    {step === "recording" ? "Enregistrement en cours..." : "Relisez avant de valider"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 relative bg-background/50 backdrop-blur-sm flex flex-col">

                        {/* Header Actions */}
                        {!isRecording && (
                            <div className="absolute top-4 right-4 z-50">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full opacity-50 hover:opacity-100 hover:bg-muted"
                                    onClick={onClose}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center h-full">
                            <AnimatePresence mode="wait">

                                {/* INTRO STEP */}
                                {step === "intro" && (
                                    <motion.div
                                        key="intro"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center text-center max-w-md w-full"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-tr from-primary/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                                            <Video className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground mb-3">Prêt à pitcher ?</h3>
                                        <p className="text-muted-foreground mb-8 leading-relaxed">
                                            Présentez-vous simplement. Soyez authentique, souriant et concis. Vous pourrez revoir la vidéo avant de la publier.
                                        </p>

                                        <div className="flex flex-col gap-3 w-full sm:max-w-xs">
                                            <Button size="lg" className="w-full rounded-full font-medium shadow-lg shadow-primary/20" onClick={goToSetup}>
                                                Démarrer la webcam <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm" onClick={() => {
                                                localStorage.setItem("hasSeenPitchIntro", "true");
                                                handleUploadSelect();
                                            }}>
                                                Importer une vidéo existante
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* SETUP STEP */}
                                {step === "setup" && (
                                    <motion.div
                                        key="setup"
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                        className="w-full h-full flex flex-col"
                                    >
                                        <div className="flex-1 relative rounded-2xl overflow-hidden bg-black shadow-inner border border-zinc-800 mb-6 group">
                                            {cameraError ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-muted/10 backdrop-blur-md z-30">
                                                    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                                                    <h3 className="text-lg font-bold text-foreground">Accès caméra refusé</h3>
                                                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">{cameraError}</p>

                                                    {debugInfo && (
                                                        <div className="bg-muted p-2 rounded text-[10px] font-mono mb-4 opacity-50 max-w-[200px] break-all">
                                                            {debugInfo}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3">
                                                        <Button onClick={startCamera} variant="outline" size="sm">
                                                            <RefreshCcw className="w-3 h-3 mr-2" /> Réessayer
                                                        </Button>
                                                        <Button onClick={handleUploadSelect} variant="secondary" size="sm">
                                                            <Upload className="w-3 h-3 mr-2" /> Importer
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <video
                                                        ref={videoPreviewRef}
                                                        autoPlay
                                                        muted
                                                        playsInline
                                                        className="w-full h-full object-cover transform scale-x-[-1]"
                                                    />
                                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
                                                        <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-3">
                                                            <div className="flex gap-1 items-end h-3">
                                                                {[1, 2, 3].map(i => (
                                                                    <div
                                                                        key={i}
                                                                        className={cn(
                                                                            "w-1 rounded-full transition-all duration-100 bg-white",
                                                                            audioLevel > i * 5 ? "h-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "h-1 bg-white/30"
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] font-medium text-white/90 uppercase tracking-wide">Micro actif</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex justify-center">
                                            <Button
                                                size="lg"
                                                className="h-14 px-8 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 transition-all hover:scale-105"
                                                onClick={startRecording}
                                                disabled={!!cameraError}
                                            >
                                                <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse" />
                                                Lancer l'enregistrement
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* RECORDING STEP */}
                                {step === "recording" && (
                                    <motion.div
                                        key="recording"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="w-full h-full flex flex-col relative"
                                    >
                                        <div className="flex-1 relative rounded-2xl overflow-hidden bg-black shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)] border border-destructive/20">
                                            <video
                                                ref={videoPreviewRef}
                                                autoPlay
                                                muted
                                                playsInline
                                                className="w-full h-full object-cover transform scale-x-[-1]"
                                            />

                                            {/* Countdown */}
                                            {countdown > 0 ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                                                    <motion.span
                                                        key={countdown}
                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                        animate={{ scale: 1.5, opacity: 1 }}
                                                        exit={{ scale: 2, opacity: 0 }}
                                                        className="text-9xl font-black text-white"
                                                    >
                                                        {countdown}
                                                    </motion.span>
                                                </div>
                                            ) : (
                                                <div className="absolute top-6 right-6">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive text-white rounded-full text-xs font-bold animate-pulse shadow-md">
                                                        <div className="w-2 h-2 bg-white rounded-full" /> REC
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 flex justify-center">
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="h-16 w-16 rounded-full border-4 border-muted hover:border-destructive hover:bg-destructive/10 transition-all group"
                                                onClick={stopRecording}
                                            >
                                                <div className="w-5 h-5 bg-destructive rounded-sm group-hover:scale-110 transition-transform" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* REVIEW STEP */}
                                {step === "review" && previewUrl && (
                                    <motion.div
                                        key="review"
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        className="w-full h-full flex flex-col"
                                    >
                                        <div className="flex-1 relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-border">
                                            <video
                                                src={previewUrl}
                                                controls
                                                className="w-full h-full object-contain bg-zinc-950"
                                                autoPlay
                                                loop
                                            />
                                        </div>

                                        <div className="mt-6 flex items-center justify-between gap-4">
                                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={goToSetup} disabled={isSaving}>
                                                <RefreshCcw className="w-4 h-4 mr-2" /> Recommencer
                                            </Button>
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 shadow-lg shadow-green-600/20"
                                                size="lg"
                                                onClick={handleSave}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                {isSaving ? "Sauvegarde..." : "Valider et Publier"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* UPLOAD STEP */}
                                {step === "upload" && (
                                    <motion.div
                                        key="upload"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="w-full h-full flex flex-col items-center justify-center"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="video/mp4,video/webm,video/mov,video/quicktime"
                                            onChange={handleFileSelect}
                                        />
                                        <div
                                            className="w-full max-w-md h-64 border-2 border-dashed border-border bg-muted/20 rounded-2xl flex flex-col items-center justify-center hover:bg-muted/40 hover:border-primary/50 transition-all cursor-pointer group p-6 text-center"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-foreground mb-1">Cliquer pour importer</h4>
                                            <p className="text-sm text-muted-foreground">MP4 ou MOV (Max 50 Mo)</p>
                                        </div>

                                        <Button variant="ghost" className="mt-8 text-muted-foreground" onClick={() => setStep("intro")}>
                                            Retour à l'accueil
                                        </Button>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

// --- MICRO COMPONENTS --- //

function StepItem({ active, completed, label, index }: { active: boolean, completed: boolean, label: string, index: number }) {
    return (
        <div className={cn("flex items-center gap-3 group", active ? "opacity-100" : "opacity-60")}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border",
                completed ? "bg-primary text-primary-foreground border-primary" :
                    active ? "bg-background text-foreground border-primary ring-2 ring-primary/20" :
                        "bg-muted/50 text-muted-foreground border-transparent"
            )}>
                {completed ? <CheckCircle2 className="w-4 h-4" /> : index}
            </div>
            <span className={cn(
                "font-medium text-sm transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
            )}>
                {label}
            </span>
        </div>
    );
}
