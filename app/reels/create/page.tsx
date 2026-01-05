"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Video, Type, Music, Settings, X, ChevronRight, Upload, Zap, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/upload";
import { createPost } from "@/lib/actions";

import { useSession } from "next-auth/react";

export default function ReelsCreatePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState<"RECORD" | "EDIT" | "PUBLISH">("RECORD");
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [hasCamera, setHasCamera] = useState(true);

    // Publish State
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("CONSEILS");
    const [visibility, setVisibility] = useState("PUBLIC");
    const [allowComments, setAllowComments] = useState(true);
    const [allowDuets, setAllowDuets] = useState(true);
    const [saveToDevice, setSaveToDevice] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Camera Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Tools State
    const [flashMode, setFlashMode] = useState<"OFF" | "ON" | "AUTO">("OFF");
    const [speed, setSpeed] = useState(1);
    const [recordingTime, setRecordingTime] = useState(0);
    const MAX_DURATION = 60; // 60 seconds

    const CATEGORIES = [
        "CONSEILS", "VISITES", "AVANT_APRES", "TEMOIGNAGES",
        "Q_A", "DIVERTISSEMENT", "ACTUS", "TUTORIELS", "CHALLENGES"
    ];

    // Editor State
    const [activeFilter, setActiveFilter] = useState("none");
    const [textOverlay, setTextOverlay] = useState<{ text: string, x: number, y: number, color: string } | null>(null);
    const [editorTab, setEditorTab] = useState<"FILTERS" | "TEXT" | "TRIM">("FILTERS");

    const FILTERS = [
        { name: "Normal", value: "none" },
        { name: "Eclat", value: "brightness(1.1) contrast(1.1) saturate(1.2)" },
        { name: "N&B", value: "grayscale(1)" },
        { name: "Vintage", value: "sepia(0.5) contrast(0.9)" },
        { name: "Cinema", value: "contrast(1.2) saturate(0.8) brightness(0.9)" },
        { name: "Soleil", value: "saturate(1.5) hue-rotate(-10deg)" }
    ];

    // Preview
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Audio State
    const [selectedSound, setSelectedSound] = useState<{ id: string, title: string, artist: string, url: string } | null>(null);
    const [showSoundLibrary, setShowSoundLibrary] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const SOUNDS = [
        { id: "1", title: "Sunny Day", artist: "Happy Vibes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        { id: "2", title: "Corporate Motivation", artist: "Business", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
        { id: "3", title: "Urban Beat", artist: "City Life", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
        { id: "4", title: "Relaxing Piano", artist: "Chillout", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    ];

    // Camera State
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [activeDeviceId, setActiveDeviceId] = useState<string>("");
    const [permissionError, setPermissionError] = useState<string | null>(null);

    // Debug State
    const [debugLog, setDebugLog] = useState<string[]>([]);
    const log = (msg: string) => setDebugLog(prev => [...prev.slice(-4), msg]);

    const activeStreamRef = useRef<MediaStream | null>(null);

    // Initialize Camera on Mount
    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            if (step !== "RECORD") return;

            log("Init Camera...");
            if (!window.isSecureContext) {
                log("⚠️ Not Secure Context");
                setPermissionError("NOT_SECURE_CONTEXT");
                setHasCamera(false);
                return;
            }

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                log("❌ MediaDevices API missing");
                setPermissionError("API_MISSING");
                setHasCamera(false);
                return;
            }

            try {
                // Stop any previous stream
                if (activeStreamRef.current) {
                    activeStreamRef.current.getTracks().forEach(t => t.stop());
                }

                log("Requesting getUserMedia...");
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                if (!isMounted) {
                    log("Aborted (Unmounted)");
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                log(`Stream Acquired: ${stream.id}`);
                activeStreamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                setHasCamera(true);
                setPermissionError(null);

                // Enumerate devices
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoInputs = devices.filter(d => d.kind === "videoinput");
                    log(`Devices found: ${videoInputs.length}`);
                    setDevices(videoInputs);
                } catch (e) {
                    log("Enumeration failed");
                }

            } catch (err: any) {
                if (!isMounted) return;
                log(`Error: ${err.name}`);
                console.error("Camera Error:", err);

                // Detailed Error Handling
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setPermissionError("PERM_DENIED");
                } else if (err.name === 'NotFoundError') {
                    setPermissionError("NO_DEVICE");
                } else {
                    setPermissionError(err.name || "UNKNOWN");
                }
                setHasCamera(false);
            }
        };

        if (step === "RECORD") {
            init();
        } else {
            stopCamera();
        }

        return () => {
            isMounted = false;
            stopCamera();
        };
    }, [step]);

    // We remove the separate 'initializeCameraSystem' function as it's now inside useEffect for safety
    // We keep startCameraStream simple but updating the ref

    const startCameraStream = async (deviceId: string) => {
        try {
            stopCamera();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
                audio: true
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Switch failed", err);
            initializeCameraSystem(); // Fallback
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };



    const switchCamera = () => {
        if (devices.length < 2) return;

        const currentIndex = devices.findIndex(d => d.deviceId === activeDeviceId);
        const nextIndex = (currentIndex + 1) % devices.length;
        const nextId = devices[nextIndex].deviceId;
        setActiveDeviceId(nextId);
        startCameraStream(nextId);
    };

    const handleStartRecording = () => {
        if (!videoRef.current?.srcObject) return;

        setRecordedChunks([]);
        const stream = videoRef.current.srcObject as MediaStream;
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setRecordedChunks((prev) => [...prev, event.data]);
            }
        };

        mediaRecorder.onstop = () => {
            // Create Blob on stop
            // We do this in effect or next render usually, but simple here:
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(100); // 100ms timeslices for smoother progress update
        setIsRecording(true);

        // Start Audio if selected
        if (selectedSound && audioRef.current) {
            audioRef.current.src = selectedSound.url;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio Play Error", e));
        }

        // Start Timer
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            setRecordingTime(elapsed);
            if (elapsed >= MAX_DURATION) {
                handleStopRecording();
            }
        }, 100);

        // Store interval ID in a ref usually, but for simple functional component scope let's attach to window or just rely on stop logic cleanup if we had a ref. 
        // Actually, better to use a ref for the timer interval to clear it.
        // Quick fix: we'll handle stops by check. 
        // A cleaner way is to use a useRef for the interval.
        (window as any).recordingInterval = interval;
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }

        // Stop Audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        clearInterval((window as any).recordingInterval);
        setIsRecording(false);
        setStep("EDIT");
    };

    // Effect to process chunks into preview URL when step changes to EDIT
    useEffect(() => {
        if (step === "EDIT" && recordedChunks.length > 0 && !previewUrl) {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        }
    }, [step, recordedChunks, previewUrl]);

    // File Upload Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For uploaded files, we can just use the file directly later
            // But for preview consistency we clear chunks and set preview
            setRecordedChunks([]); // Clear recorded chunks
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // We need to store the file for upload later. 
            // Reuse recordedChunks or a new state? Let's assume we convert File to Blob and store in chunks or add a 'selectedFile' state.
            // For MVP simplicity: wrap file in blob array
            setRecordedChunks([file]);

            setStep("EDIT");
        }
    };

    const handlePublish = async () => {
        if (recordedChunks.length === 0) return;
        setIsUploading(true);

        try {
            // 1. Create File from Blob
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const file = new File([blob], "reel-recording.webm", { type: "video/webm" });

            // 2. Upload Video
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await uploadFile(formData);

            if (!uploadRes.success || !uploadRes.url) {
                throw new Error("Upload failed");
            }

            // 3. Create Post
            const postFormData = new FormData();
            postFormData.append("videoUrl", uploadRes.url);
            postFormData.append("videoCategory", category);
            // Default Thumbnail (or generate one - using placeholder for now)
            postFormData.append("thumbnail", "/avatars/house-placeholder.jpg");
            postFormData.append("aspectRatio", "9:16");
            postFormData.append("duration", recordingTime.toString());

            // Publishing Options
            postFormData.append("visibility", visibility);
            postFormData.append("allowComments", allowComments.toString());
            postFormData.append("allowDuets", allowDuets.toString());

            // Editor Metadata (Filters, Text, etc.) - Stored in Post Metadata
            const editorMetadata = {
                filter: activeFilter,
                textOverlay: textOverlay,
                // trim: trimRange 
            };

            if (!session?.user?.id) return alert("You must be logged in");

            const createRes = await createPost(
                session.user.id,
                description || "New Reel", // Content
                "VIDEO",
                undefined, // Image
                editorMetadata, // Metadata (JSON)
                undefined, // Tags
                undefined, // Location
                postFormData // FormData
            );

            if (createRes.success) {
                router.push("/reels");
            } else {
                console.error("Create Post Error", createRes.error);
                alert("Failed to create post");
            }

        } catch (error) {
            console.error("Publish Error:", error);
            alert("Error publishing reel");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <X className="h-6 w-6" />
                </Button>

                {step === "RECORD" && (
                    <button
                        onClick={() => setShowSoundLibrary(true)}
                        className="bg-black/30 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2 transition hover:bg-black/50"
                    >
                        <Music className="h-3 w-3" />
                        <span className="text-xs font-medium max-w-[100px] truncate">
                            {selectedSound ? selectedSound.title : "Ajouter un son"}
                        </span>
                    </button>
                )}

                {step === "EDIT" && (
                    <Button variant="ghost" size="sm" onClick={() => setStep("PUBLISH")}>
                        Suivant <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                )}
            </div>

            {/* Main Workspace */}
            <div className="flex-1 relative flex items-center justify-center bg-zinc-900 overflow-hidden">
                {step === "RECORD" ? (
                    <div className="w-full h-full relative flex flex-col items-center justify-center">
                        {hasCamera ? (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">
                                <div className="bg-zinc-800 p-4 rounded-full">
                                    <Video className="w-12 h-12 text-zinc-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Caméra introuvable</h3>
                                    <p className="text-zinc-400 mt-2 max-w-xs text-xs">
                                        {permissionError ? `Erreur: ${permissionError}` : "Impossible d'accéder à la caméra."}
                                    </p>
                                    {!window.isSecureContext && (
                                        <div className="bg-yellow-900/50 p-2 rounded text-yellow-200 text-[10px] mt-2">
                                            ⚠️ Non sécurisé (HTTP). Utilisez localhost ou HTTPS.
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button onClick={() => window.location.reload()} className="gap-2" variant="default">
                                        <Zap className="w-4 h-4" />
                                        Réessayer (Recharger)
                                    </Button>
                                    <div className="relative">
                                        <Button variant="outline" className="gap-2">
                                            <Upload className="w-4 h-4" />
                                            Télécharger une vidéo
                                        </Button>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileUpload}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Right Sidebar Tools */}
                        {hasCamera && (
                            <div className="absolute right-4 top-4 flex flex-col gap-4 z-10">
                                {devices.length > 1 && (
                                    <ToolButton icon={Video} label="Flip" onClick={switchCamera} />
                                )}
                                <ToolButton
                                    icon={Settings}
                                    label={`${speed}x`}
                                    onClick={() => setSpeed(prev => prev === 1 ? 2 : prev === 2 ? 0.5 : 1)}
                                    active={speed !== 1}
                                />
                                <ToolButton
                                    icon={Zap}
                                    label="Flash"
                                    active={flashMode === "ON"}
                                    onClick={() => setFlashMode(prev => prev === "OFF" ? "ON" : "OFF")} // Logic would need 'track.applyConstraints'
                                />
                                <ToolButton icon={Timer} label="Timer" />
                                <ToolButton icon={Type} label="Texte" />
                            </div>
                        )}

                        {/* Progress Bar */}
                        {isRecording && (
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-800">
                                <div
                                    className="h-full bg-red-500 transition-all duration-100 ease-linear"
                                    style={{ width: `${(recordingTime / MAX_DURATION) * 100}%` }}
                                />
                            </div>
                        )}
                        {!hasCamera && permissionError === "PERM_DENIED" && (
                            <div className="absolute top-4 left-4 right-4 bg-red-500/80 p-3 rounded-lg text-xs text-white text-center">
                                Accès refusé. Veuillez autoriser la caméra dans les paramètres navigateur.
                            </div>
                        )}
                        {!hasCamera && permissionError === "NOT_SECURE" && (
                            <div className="absolute top-4 left-4 right-4 bg-yellow-600/90 p-3 rounded-lg text-xs text-white text-center">
                                ⚠️ Connexion non sécurisée. Utilisez HTTPS ou localhost.
                            </div>
                        )}



                        {/* Recording Controls */}
                        {hasCamera && (
                            <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-8">
                                <div className="flex flex-col items-center gap-1 cursor-pointer relative">
                                    <div className="w-10 h-10 rounded-lg border-2 border-white/30 flex items-center justify-center overflow-hidden">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-medium">Upload</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                <button
                                    className={cn(
                                        "w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all",
                                        isRecording ? "scale-110 border-red-500" : "hover:scale-105"
                                    )}
                                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                                >
                                    <div className={cn("rounded-full transition-all", isRecording ? "w-8 h-8 bg-red-500" : "w-16 h-16 bg-red-500")} />
                                </button>

                                <div className="w-10 opacity-0" /> {/* Spacer for balance */}
                            </div>
                        )}
                    </div>
                ) : step === "EDIT" ? (
                    <div className="w-full h-full flex flex-col items-center relative bg-zinc-900">
                        {/* Video Preview Canvas */}
                        <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                                <div className="relative w-full h-full max-w-[400px]">
                                    <video
                                        src={previewUrl}
                                        autoPlay
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover"
                                        style={{ filter: activeFilter }}
                                    />

                                    {/* Text Overlay Layer */}
                                    {textOverlay && (
                                        <div
                                            className="absolute cursor-move font-bold text-2xl drop-shadow-lg p-2 rounded border border-transparent hover:border-white/50 transition-all"
                                            style={{
                                                left: `${textOverlay.x}%`,
                                                top: `${textOverlay.y}%`,
                                                color: textOverlay.color,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            // Simple drag mocking by clicking center - typical web drag is complex, simplified for MVP
                                            onClick={() => setTextOverlay(null)} // Click to delete for now
                                        >
                                            {textOverlay.text}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>Processing...</p>
                            )}
                        </div>

                        {/* Editor Controls Panel */}
                        <div className="w-full bg-black/80 backdrop-blur-lg p-4 pb-8 z-20 sticky bottom-0">
                            {/* Tab Switcher */}
                            <div className="flex justify-center gap-6 mb-4 border-b border-white/10 pb-2">
                                <button onClick={() => setEditorTab("FILTERS")} className={cn("text-xs font-medium pb-1", editorTab === "FILTERS" ? "text-white border-b-2 border-white" : "text-zinc-500")}>FILTRES</button>
                                <button onClick={() => setEditorTab("TEXT")} className={cn("text-xs font-medium pb-1", editorTab === "TEXT" ? "text-white border-b-2 border-white" : "text-zinc-500")}>TEXTE</button>
                                <button onClick={() => setEditorTab("TRIM")} className={cn("text-xs font-medium pb-1", editorTab === "TRIM" ? "text-white border-b-2 border-white" : "text-zinc-500")}>COUPER</button>
                            </div>

                            {/* Tab Content */}
                            <div className="h-24 overflow-x-auto">

                                {/* FILTERS TAB */}
                                {editorTab === "FILTERS" && (
                                    <div className="flex gap-4 px-2">
                                        {FILTERS.map(f => (
                                            <button
                                                key={f.name}
                                                onClick={() => setActiveFilter(f.value)}
                                                className="flex flex-col items-center gap-2 group min-w-[60px]"
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-lg border-2 overflow-hidden transition-all",
                                                    activeFilter === f.value ? "border-primary scale-110" : "border-white/20 group-hover:border-white"
                                                )}>
                                                    <div className="w-full h-full bg-zinc-800" style={{ filter: f.value }}>
                                                        {/* Preview swatch, ideally a small thumbnail of the video */}
                                                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-orange-400 opacity-50" />
                                                    </div>
                                                </div>
                                                <span className={cn("text-[10px]", activeFilter === f.value ? "text-white" : "text-zinc-500")}>
                                                    {f.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* TEXT TAB */}
                                {editorTab === "TEXT" && (
                                    <div className="flex items-center gap-2 justify-center h-full">
                                        {!textOverlay ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => {
                                                    const text = prompt("Entrez votre texte:");
                                                    if (text) setTextOverlay({ text, x: 50, y: 50, color: "#ffffff" });
                                                }}
                                            >
                                                <Type className="w-4 h-4" /> Ajouter du texte
                                            </Button>
                                        ) : (
                                            <div className="flex gap-4">
                                                <div className="flex gap-2">
                                                    {["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00"].map(c => (
                                                        <button
                                                            key={c}
                                                            className="w-6 h-6 rounded-full border border-white"
                                                            style={{ backgroundColor: c }}
                                                            onClick={() => setTextOverlay(prev => prev ? { ...prev, color: c } : null)}
                                                        />
                                                    ))}
                                                </div>
                                                <Button size="sm" variant="destructive" onClick={() => setTextOverlay(null)}>
                                                    Supprimer
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TRIM TAB */}
                                {editorTab === "TRIM" && (
                                    <div className="flex flex-col items-center justify-center h-full text-white text-xs gap-2">
                                        <p>Définir les points de début et fin</p>
                                        <div className="flex gap-4 items-center">
                                            <div className="flex flex-col gap-1">
                                                <label>Début (s)</label>
                                                <input type="number" className="w-16 bg-zinc-800 border border-zinc-700 rounded p-1" placeholder="0" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label>Fin (s)</label>
                                                <input type="number" className="w-16 bg-zinc-800 border border-zinc-700 rounded p-1" placeholder="60" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-md p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Nouvelle Publication</h2>
                        {/* Expanded Publishing Form */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium mb-2 block text-zinc-400">Description</label>
                                <textarea
                                    className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-primary min-h-[100px]"
                                    placeholder="Décrivez votre vidéo... #immobilier"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="text-sm font-medium mb-2 block text-zinc-400">Catégorie</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                                category === cat ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "border-white/10 hover:bg-white/5 text-zinc-400"
                                            )}
                                        >
                                            {cat.replace(/_/g, " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Advanced Settings Group */}
                            <div className="space-y-4 bg-zinc-800/50 p-4 rounded-xl">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Paramètres de publication</h3>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Visibilité</span>
                                    <select
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        className="bg-zinc-900 border-none text-sm rounded px-2 py-1 outline-none"
                                    >
                                        <option value="PUBLIC">Public</option>
                                        <option value="FRIENDS">Amis uniquement</option>
                                        <option value="PRIVATE">Privé</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Autoriser les commentaires</span>
                                    <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="accent-primary" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Autoriser les duos</span>
                                    <input type="checkbox" checked={allowDuets} onChange={(e) => setAllowDuets(e.target.checked)} className="accent-primary" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Sauvegarder sur l'appareil</span>
                                    <input type="checkbox" checked={saveToDevice} onChange={(e) => setSaveToDevice(e.target.checked)} className="accent-primary" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => alert("Brouillon sauvegardé !")}>
                                    Brouillon
                                </Button>
                                <Button
                                    className="flex-[2]"
                                    onClick={handlePublish}
                                    disabled={isUploading || !category || !description.trim()}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Envoi...
                                        </>
                                    ) : "Publier maintenant"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Sound Library Modal */}
            {showSoundLibrary && (
                <div className="absolute inset-0 z-50 bg-zinc-900 flex flex-col">
                    <div className="p-4 border-b border-white/10 flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setShowSoundLibrary(false)}>
                            <X className="w-6 h-6" />
                        </Button>
                        <h3 className="font-bold text-lg">Choisir un son</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {SOUNDS.map(sound => (
                            <div
                                key={sound.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                                onClick={() => {
                                    setSelectedSound(sound);
                                    setShowSoundLibrary(false);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-600 rounded flex items-center justify-center">
                                        <Music className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{sound.title}</p>
                                        <p className="text-xs text-zinc-400">{sound.artist}</p>
                                    </div>
                                </div>
                                {selectedSound?.id === sound.id && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hidden Audio Element for Playback/Recording */}
            <audio ref={audioRef} className="hidden" title="Background Audio" />

        </div>
    );
}

function ToolButton({ icon: Icon, label, onClick, active }: any) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-1 group">
            <div className={cn("p-2 rounded-full bg-black/30 backdrop-blur-md transition group-active:scale-95", active && "bg-primary text-primary-foreground")}>
                <Icon className="h-5 w-5 shadow-sm" />
            </div>
            <span className="text-[10px] font-medium drop-shadow-md">{label}</span>
        </button>
    );
}
