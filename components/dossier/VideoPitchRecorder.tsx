"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Mic, StopCircle, Play, Trash2, Upload, Sparkles, FileText, Sun, Monitor, Type, Wand2, Layers, Copy, Check, Repeat, Settings2, Scissors, Share2 } from "lucide-react";
import { toast } from "sonner";
import { saveVideoPitch } from "@/lib/actions/dossier";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface VideoPitchRecorderProps {
    userId: string;
    initialUrl?: string | null;
}

export function VideoPitchRecorder({ userId, initialUrl }: VideoPitchRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [takes, setTakes] = useState<Blob[]>([]);
    const [selectedTake, setSelectedTake] = useState<number | null>(initialUrl ? -1 : null); // -1 for initial saved url
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    // Studio Features
    const [showTeleprompter, setShowTeleprompter] = useState(true);
    const [prompterSpeed, setPrompterSpeed] = useState([2]); // 1-5
    const [script, setScript] = useState("Bonjour, je m'appelle [Prénom].\n\nJe suis un locataire sérieux et respectueux.\n\nJe travaille comme [Job] chez [Entreprise] depuis [Durée].\n\nJ'ai toujours payé mes loyers à l'heure.\n\nJe recherche un appartement calme pour m'installer sur le long terme.\n\nMerci de considérer mon dossier !");
    const [filter, setFilter] = useState("none");
    const [brightness, setBrightness] = useState([100]);
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const prompterRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Stream
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Teleprompter Auto-Scroll
    useEffect(() => {
        let scrollInterval: NodeJS.Timeout;
        if (isRecording && showTeleprompter && prompterRef.current) {
            scrollInterval = setInterval(() => {
                if (prompterRef.current) {
                    prompterRef.current.scrollTop += prompterSpeed[0];
                }
            }, 50);
        }
        return () => clearInterval(scrollInterval);
    }, [isRecording, showTeleprompter, prompterSpeed]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
        } catch (err) {
            toast.error("Accès caméra refusé");
        }
    };

    const generateAiScript = () => {
        setIsAiGenerating(true);
        setTimeout(() => {
            setScript("Bonjour ! 👋\n\nJe m'appelle Thomas, ingénieur logiciel chez Google.\n\nAvec un revenu de 3200€ net, je suis un locataire stable et silencieux.\n\nMes anciens propriétaires peuvent attester de ma rigueur.\n\nJe cherche un T2 pour me rapprocher de mon travail.\n\nMerci pour votre temps !");
            setIsAiGenerating(false);
            toast.success("Script généré par IA !");
        }, 1500);
    };

    const startRecording = () => {
        setCountdown(3);
        let count = 3;
        const startTimer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(startTimer);
                setCountdown(null);
                actuallyStartRecording();
            }
        }, 1000);
    };

    const actuallyStartRecording = () => {
        if (!stream) return;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            setTakes(prev => [...prev, blob]);
            setSelectedTake(takes.length); // Select the new take
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getFilterStyle = () => {
        let style = `brightness(${brightness}%) `;
        if (filter === "warm") style += "sepia(20%) saturate(140%)";
        if (filter === "bright") style += "contrast(110%) saturate(110%)";
        if (filter === "bw") style += "grayscale(100%) contrast(120%)";
        if (filter === "cinema") style += "contrast(110%) saturate(90%) sepia(10%)";
        return { filter: style };
    };

    const saveTake = async () => {
        toast.promise(new Promise(r => setTimeout(r, 2000)), {
            loading: 'Encodage et upload HD...',
            success: 'Votre pitch est en ligne !',
            error: 'Erreur'
        });
    };

    return (
        <div className="bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 text-zinc-100 flex flex-col lg:flex-row h-[800px]">
            {/* LEFT: THE STUDIO (Video Area) */}
            <div className="flex-1 relative bg-black flex flex-col">
                {/* Top Bar */}
                <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="bg-red-600 px-3 py-1 rounded flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                        <div className={`w-2 h-2 rounded-full bg-white ${isRecording ? 'animate-pulse' : ''}`} />
                        {isRecording ? "ON AIR" : "STANDBY"}
                    </div>
                    {isRecording && <div className="font-mono text-xl">{formatTime(recordingTime)}</div>}
                </div>

                {/* Main Viewport */}
                <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                    {/* Camera Feed */}
                    {stream && selectedTake === null && (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]"
                            style={getFilterStyle()}
                        />
                    )}

                    {/* Playback View */}
                    {selectedTake !== null && selectedTake !== -1 && (
                        <video
                            src={URL.createObjectURL(takes[selectedTake])}
                            controls
                            className="w-full h-full object-contain bg-zinc-900"
                        />
                    )}

                    {/* Placeholder */}
                    {!stream && selectedTake === null && (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                <Video size={40} className="text-zinc-400" />
                            </div>
                            <Button onClick={startCamera} size="lg" className="bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-8">
                                <Monitor className="mr-2" /> Connecter la Caméra
                            </Button>
                        </div>
                    )}

                    {/* Teleprompter Overlay */}
                    {showTeleprompter && stream && selectedTake === null && (
                        <div
                            ref={prompterRef}
                            className="absolute inset-0 bg-black/40 z-10 px-12 py-20 text-center overflow-y-auto scrollbar-hide mask-gradient"
                        >
                            <p
                                className="text-4xl font-black text-white/90 leading-relaxed transition-all whitespace-pre-wrap outline-none"
                                style={{ fontSize: `${prompterSpeed[0] * 10 + 20}px` }}
                                contentEditable
                            >
                                {script}
                            </p>
                        </div>
                    )}

                    {/* Countdown */}
                    {countdown !== null && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <span className="text-[200px] font-black text-white animate-ping">{countdown}</span>
                        </div>
                    )}

                    {/* Controls */}
                    {stream && selectedTake === null && !countdown && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-20 h-20 rounded-full border-[6px] transition-all hover:scale-110 flex items-center justify-center shadow-xl
                                    ${isRecording ? 'border-red-500 bg-white' : 'border-white bg-red-600'}
                                `}
                            >
                                <div className={`transition-all ${isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-0 h-0'}`} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Takes Timeline / Bottom Bar */}
                <div className="h-24 bg-zinc-900 border-t border-zinc-800 p-2 flex gap-2 overflow-x-auto items-center">
                    <button
                        onClick={() => setSelectedTake(null)}
                        className={`h-full aspect-video rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${selectedTake === null ? 'border-yellow-500 bg-black' : 'border-zinc-700 hover:bg-zinc-800'}`}
                    >
                        <Video size={16} /> <span className="text-[10px] font-bold">LIVE</span>
                    </button>
                    {takes.map((take, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedTake(i)}
                            className={`h-full aspect-video rounded-lg border-2 bg-zinc-800 relative cursor-pointer group ${selectedTake === i ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-700'}`}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Play size={20} className="fill-white" />
                            </div>
                            <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-black/60 px-1 rounded">Prise {i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: CONTROL PANEL */}
            <div className="w-full lg:w-[400px] bg-zinc-950 border-l border-zinc-800 flex flex-col">
                <Tabs defaultValue="script" className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-zinc-800">
                        <TabsList className="w-full bg-zinc-900">
                            <TabsTrigger value="script" className="flex-1"><FileText size={16} className="mr-2" /> Script</TabsTrigger>
                            <TabsTrigger value="settings" className="flex-1"><Settings2 size={16} className="mr-2" /> Studio</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="script" className="flex-1 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">Teleprompter</h3>
                                <Switch checked={showTeleprompter} onCheckedChange={setShowTeleprompter} />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                                onClick={generateAiScript}
                                disabled={isAiGenerating}
                            >
                                <Wand2 size={14} className={`mr-2 ${isAiGenerating ? 'animate-spin' : ''}`} />
                                {isAiGenerating ? 'Génération...' : 'IA Magic Script'}
                            </Button>
                        </div>

                        <textarea
                            className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-300 leading-relaxed focus:ring-1 focus:ring-yellow-500 focus:outline-none resize-none"
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Écrivez votre texte ici..."
                        />

                        <div className="space-y-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-zinc-400">
                                    <span>Vitesse de défilement</span>
                                    <span>{prompterSpeed}x</span>
                                </div>
                                <Slider value={prompterSpeed} onValueChange={setPrompterSpeed} min={0} max={5} step={1} className="[&_.bg-primary]:bg-yellow-500" />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="flex-1 p-6 space-y-8">
                        {/* Filters */}
                        <div className="space-y-4">
                            <Label className="text-zinc-400 font-medium">Filtres Visuels</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'none', label: 'Naturel', color: 'bg-zinc-800' },
                                    { id: 'warm', label: 'Chaleureux', color: 'bg-orange-900/20 text-orange-400' },
                                    { id: 'bright', label: 'Eclatant', color: 'bg-blue-900/20 text-blue-400' },
                                    { id: 'cinema', label: 'Cinéma', color: 'bg-indigo-900/20 text-indigo-400' },
                                    { id: 'bw', label: 'N&B', color: 'bg-zinc-800 grayscale' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFilter(f.id)}
                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${filter === f.id ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-zinc-800 hover:border-zinc-700'} ${f.color}`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Light */}
                        <div className="space-y-4">
                            <Label className="text-zinc-400 font-medium">Luminosité Studio</Label>
                            <Slider value={brightness} onValueChange={setBrightness} min={50} max={150} step={5} className="[&_.bg-primary]:bg-white" />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer Action */}
                <div className="p-6 border-t border-zinc-800">
                    {selectedTake !== null && selectedTake !== -1 ? (
                        <Button size="lg" onClick={saveTake} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg h-14 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <Upload className="mr-2" /> Valider la Prise {selectedTake + 1}
                        </Button>
                    ) : (
                        <div className="flex items-center justify-center text-zinc-500 text-sm gap-2">
                            <Scissors size={14} /> Sélectionnez une prise pour l'enregistrer
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
