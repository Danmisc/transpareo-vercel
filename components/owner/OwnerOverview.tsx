"use client";

import { useState } from "react";
import {
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Zap,
    MessageSquare,
    Wallet,
    FileText,
    Plus,
    ArrowRight,
    Sparkles,
    Activity,
    Users,
    Bell,
    Calendar as CalendarIcon,
    Clock,
    Check,
    ArrowRightCircle,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OwnerOverviewProps {
    properties?: any[]; // Replace 'any' with your Property type if imported
    user?: any;
}

export function OwnerOverview({ properties = [], user }: OwnerOverviewProps) {
    // SIMULATION STATE
    const [isSimOpen, setIsSimOpen] = useState(false);
    const [simStep, setSimStep] = useState(1); // 1: Intro, 2: Result

    // AGENDA STATE
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Dynamic Data Helpers
    const userName = user?.name?.split(' ')[0] || "Propriétaire";
    const featuredProperty = properties.length > 0 ? properties[0] : { name: "Studio Lyon", type: "Appartement" };
    const propertyCount = properties.length;

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in duration-500 overflow-y-auto pb-10">

            {/* TOP ROW: AI STRATEGIST & KEY METRICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* AI STRATEGIST CARD */}
                <Card className="lg:col-span-2 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Sparkles size={120} />
                    </div>
                    <CardHeader className="relative z-10 pb-2">
                        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold tracking-wider uppercase">
                            <BotIcon /> AI Strategist • Insight du Jour
                        </div>
                        <CardTitle className="text-2xl font-bold mt-1">
                            Bonjour {userName}, Optimisation Détectée
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p className="text-indigo-100 max-w-lg text-sm leading-relaxed mb-4">
                            D'après l'analyse de vos <span className="font-semibold text-white">{propertyCount || 3} biens</span>, passer au régime LMNP Réel pour le
                            <span className="font-semibold text-white"> {featuredProperty.name}</span> pourrait réduire votre imposition.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                size="sm"
                                className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold border-none"
                                onClick={() => {
                                    setIsSimOpen(true);
                                    setSimStep(1);
                                }}
                            >
                                Simuler l'impact
                            </Button>
                            <Button size="sm" variant="outline" className="text-indigo-100 border-indigo-400/30 hover:bg-indigo-800 hover:text-white">
                                Plus tard
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* KEY METRICS */}
                <Card className="flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 uppercase tracking-wide flex items-center justify-between">
                            Performance Globale
                            <Activity size={16} />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-zinc-700">Taux d'Occupation</span>
                                    <span className="font-bold text-emerald-600">92%</span>
                                </div>
                                <Progress value={92} className="h-2 bg-zinc-100" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-zinc-700">Rendement Net</span>
                                    <span className="font-bold text-indigo-600">5.8%</span>
                                </div>
                                <Progress value={58} className="h-2 bg-zinc-100" />
                            </div>
                            <div className="pt-2 flex justify-between items-center bg-zinc-50 p-2 rounded-lg">
                                <span className="text-xs text-zinc-500">Cashflow ce mois</span>
                                <span className="font-bold text-lg text-zinc-900">+3,450€</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MIDDLE ROW: FEED & ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                {/* UNIFIED FEED */}
                <Card className="lg:col-span-2 flex flex-col h-full min-h-[400px]">
                    <CardHeader className="pb-3 border-b border-zinc-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Activity size={20} className="text-indigo-600" />
                                Flux d'Activité
                            </CardTitle>
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600">
                                3 Nouveaux
                            </Badge>
                        </div>
                        <CardDescription>
                            Alertes, paiements et messages priorisés par l'IA.
                        </CardDescription>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-0">
                        <div className="divide-y divide-zinc-100">
                            {/* Alert Item */}
                            <div className="p-4 hover:bg-red-50/30 transition-colors flex gap-4 group cursor-pointer border-l-4 border-l-red-500 bg-red-50/10">
                                <div className="bg-red-100 p-2 rounded-full h-10 w-10 flex items-center justify-center text-red-600 shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-zinc-900 text-sm">DPE Manquant - Urgent</h4>
                                        <span className="text-[10px] text-zinc-400 font-medium">Il y a 2h</span>
                                    </div>
                                    <p className="text-zinc-600 text-sm mt-0.5 mb-2">
                                        L'appartement "Victor Hugo" nécessite une mise à jour DPE avant relocation.
                                    </p>
                                    <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800">
                                        Régulariser avec l'IA
                                    </Button>
                                </div>
                            </div>

                            {/* Payment Item */}
                            <div className="p-4 hover:bg-zinc-50 transition-colors flex gap-4 group cursor-pointer border-l-4 border-l-emerald-500">
                                <div className="bg-emerald-100 p-2 rounded-full h-10 w-10 flex items-center justify-center text-emerald-600 shrink-0">
                                    <Wallet size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-zinc-900 text-sm">Loyer Reçu</h4>
                                        <span className="text-[10px] text-zinc-400 font-medium">Aujourd'hui, 09:30</span>
                                    </div>
                                    <p className="text-zinc-600 text-sm mt-0.5">
                                        Alice M. a réglé son loyer pour <span className="font-medium">Appartement Haussmannien</span>.
                                    </p>
                                </div>
                                <span className="font-bold text-emerald-600 self-center">+1,250€</span>
                            </div>

                            {/* Message Item */}
                            <div className="p-4 hover:bg-zinc-50 transition-colors flex gap-4 group cursor-pointer border-l-4 border-l-blue-500">
                                <Avatar className="h-10 w-10 border border-zinc-200">
                                    <AvatarImage src="https://i.pravatar.cc/150?u=tenant2" />
                                    <AvatarFallback>TB</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-zinc-900 text-sm">Thomas B. (Candidat)</h4>
                                        <span className="text-[10px] text-zinc-400 font-medium">Il y a 5h</span>
                                    </div>
                                    <p className="text-zinc-600 text-sm mt-0.5 line-clamp-1">
                                        "Bonjour, est-il possible de visiter le T2 ce samedi matin ?"
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" variant="outline" className="h-7 text-xs">Répondre</Button>
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs bg-indigo-600 text-white hover:bg-indigo-700"
                                            onClick={() => setIsAgendaOpen(true)}
                                        >
                                            Accepter via Agenda
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </Card>

                {/* QUICK ACTIONS GRID */}
                <div className="flex flex-col gap-6">
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Zap size={18} className="text-amber-500" /> Actions Rapides
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <QuickActionButton icon={FileText} label="Scanner Document" color="indigo" />
                            <QuickActionButton icon={Plus} label="Ajouter Dépense" color="rose" />
                            <QuickActionButton icon={MessageSquare} label="Message Groupé" color="blue" />
                            <QuickActionButton icon={Users} label="Nouveau Locataire" color="emerald" />
                        </CardContent>
                    </Card>

                    {/* MINI CHART / STAT */}
                    <Card className="bg-zinc-900 text-white border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs text-zinc-400 font-medium uppercase">Trésorerie Prévisionnelle</span>
                                <Badge variant="outline" className="text-emerald-400 border-emerald-900 bg-emerald-950">Stable</Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">12,450€</span>
                                <span className="text-xs text-zinc-500">fin du mois</span>
                            </div>
                            <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[60%]" />
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-2 text-right">Basé sur les loyers à venir</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- SIMULATION DIALOG --- */}
            <Dialog open={isSimOpen} onOpenChange={setIsSimOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="text-indigo-600" size={20} />
                            Simulateur d'Optimisation Fiscale - Studio Lyon
                        </DialogTitle>
                        <DialogDescription>
                            Comparatif direct entre votre régime actuel (Foncier) et le régime préconisé (LMNP).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        {simStep === 1 ? (
                            <div className="grid grid-cols-2 gap-8 relative">
                                {/* Current */}
                                <div className="space-y-4 opacity-70 grayscale-[0.5]">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-zinc-900">Actuel : Foncier (Micro)</h4>
                                        <Badge variant="outline">Simple</Badge>
                                    </div>
                                    <div className="p-4 bg-zinc-50 rounded-xl space-y-3 border">
                                        <div className="flex justify-between text-sm">
                                            <span>Abattement</span>
                                            <span className="font-mono">30%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Base Imposable</span>
                                            <span className="font-mono font-bold">8,400€</span>
                                        </div>
                                        <div className="h-px bg-zinc-200 my-2" />
                                        <div className="flex justify-between text-base font-bold text-red-600">
                                            <span>Impôt Estimé</span>
                                            <span>- 2,520€</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CENTER ARROW */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 border shadow-sm z-10">
                                    <ArrowRightCircle size={24} className="text-zinc-300" />
                                </div>

                                {/* Proposed */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-indigo-700">Préconisé : LMNP Réel</h4>
                                        <Badge className="bg-indigo-600">Optimum</Badge>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-xl space-y-3 border border-indigo-200 relative overflow-hidden">

                                        <div className="flex justify-between text-sm">
                                            <span>Amortissement</span>
                                            <span className="font-mono text-emerald-600">- 6,500€</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Charges Réelles</span>
                                            <span className="font-mono text-emerald-600">- 4,200€</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Base Imposable</span>
                                            <span className="font-mono font-bold">0€</span>
                                        </div>
                                        <div className="h-px bg-indigo-200 my-2" />
                                        <div className="flex justify-between text-base font-bold text-emerald-600">
                                            <span>Impôt Estimé</span>
                                            <span>0€</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 animate-in zoom-in-95 duration-500">
                                <div className="mx-auto h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Optimisation Validée !</h3>
                                <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                                    Nous avons préparé le dossier de changement de régime pour le "Studio Lyon".
                                    Il sera envoyé à votre comptable pour validation.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Card className="w-40 p-4 bg-zinc-50">
                                        <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Gain Annuel</p>
                                        <p className="text-2xl font-bold text-emerald-600">+1,240€</p>
                                    </Card>
                                    <Card className="w-40 p-4 bg-zinc-50">
                                        <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Coût Service</p>
                                        <p className="text-2xl font-bold text-zinc-900">Inclus</p>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {simStep === 1 ? (
                            <>
                                <Button variant="ghost" onClick={() => setIsSimOpen(false)}>Annuler</Button>
                                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto" onClick={() => setSimStep(2)}>
                                    Valider le changement de régime
                                </Button>
                            </>
                        ) : (
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsSimOpen(false)}>
                                Terminer
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- AGENDA DIALOG --- */}
            <Dialog open={isAgendaOpen} onOpenChange={setIsAgendaOpen}>
                <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden gap-0">
                    <div className="grid grid-cols-1 md:grid-cols-7 h-[500px]">
                        {/* CALENDAR SIDE */}
                        <div className="md:col-span-4 p-6 border-r border-zinc-100 flex flex-col">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="flex items-center gap-2">
                                    <CalendarIcon size={20} className="text-indigo-600" />
                                    Choisir une date
                                </DialogTitle>
                                <DialogDescription>
                                    Disponibilités pour la visite du <strong>T2 Bordeaux</strong>.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border shadow-sm"
                                />
                            </div>
                        </div>

                        {/* SLOTS SIDE */}
                        <div className="md:col-span-3 bg-zinc-50/50 p-6 flex flex-col">
                            <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Clock size={16} /> Créneaux le {date?.toLocaleDateString()}
                            </h4>

                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-2">
                                    {["09:00", "09:30", "11:00", "14:30", "16:00", "17:30"].map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedSlot(time)}
                                            className={`w-full p-3 rounded-lg text-sm font-medium border transition-all flex justify-between items-center ${selectedSlot === time
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200"
                                                : "bg-white border-zinc-200 text-zinc-700 hover:border-indigo-300 hover:text-indigo-600"
                                                }`}
                                        >
                                            {time}
                                            {selectedSlot === time && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="mt-6 pt-4 border-t border-zinc-200">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    disabled={!selectedSlot || !date}
                                    onClick={() => {
                                        setIsAgendaOpen(false);
                                        toast.success(`Rendez-vous confirmé avec Thomas B. le ${date?.toLocaleDateString()} à ${selectedSlot}`);
                                        setSelectedSlot(null);
                                    }}
                                >
                                    Confirmer le RDV
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

function QuickActionButton({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    };

    return (
        <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all group bg-white">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors ${colorClasses[color]}`}>
                <Icon size={20} />
            </div>
            <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-900 text-center leading-tight">
                {label}
            </span>
        </button>
    );
}

function BotIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    )
}

