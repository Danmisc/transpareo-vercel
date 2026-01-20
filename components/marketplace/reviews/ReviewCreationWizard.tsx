"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Star, Thermometer, Volume2, Shield, Wifi, UserCheck, Droplets, Bus, Lock, CheckCircle, Home, Building2, Armchair } from "lucide-react";
import { toast } from "sonner";
import { createPropertyReview } from "@/lib/actions/reviews";

const STEPS = [
    { id: "intro", label: "Identification" },
    { id: "global", label: "Avis Global" },
    { id: "comfort", label: "Confort" },
    { id: "building", label: "Immeuble" },
    { id: "owner", label: "Propriétaire" },
    { id: "rent", label: "Loyer" },
];

export function ReviewCreationWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    const initialAddress = searchParams.get("address") || "";
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        address: initialAddress,
        moveInDate: "",
        moveOutDate: "",

        rating: 3,
        comment: "",
        pros: "",
        cons: "",

        // Comfort
        thermalScore: 3,
        acousticScore: 3,
        humidityScore: 5, // Default good?
        luminosityScore: 3,

        // Building
        commonAreasScore: 3,
        safetyScore: 3,
        transportScore: 3,

        // Connectivity
        networkScore: 4,

        // Landlord
        responsivenessScore: 3,
        depositReturnScore: 3,

        // Rent Context
        rentPaid: "",
        surface: "",
        isFurnished: false,
    });

    const progress = (step / STEPS.length) * 100;

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step === 1 && !formData.address) {
            toast.error("Veuillez entrer une adresse.");
            return;
        }
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
        else router.back();
    };

    const handleSubmit = async () => {
        if (status !== "authenticated" || !session?.user?.id) {
            toast.error("Connexion requise");
            return;
        }

        setLoading(true);
        try {
            const res = await createPropertyReview({
                ...formData,
                isVerifiedTenant: true,
                latitude: 48.8566,
                longitude: 2.3522,
                rentPaid: formData.rentPaid ? parseInt(formData.rentPaid) : undefined,
                surface: formData.surface ? parseFloat(formData.surface) : undefined,
                rentYear: new Date().getFullYear(),
            }, session.user.id);

            if (res.success) {
                toast.success("Avis publié !");
                router.push("/marketplace");
            } else {
                toast.error("Erreur: " + res.error);
            }
        } catch (e) {
            console.error(e);
            toast.error("Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    // Helper for visual sliders
    const renderSlider = (field: string, label: string, icon: any, desc: string, minLabel = "Mauvais", maxLabel = "Excellent") => {
        const val = (formData as any)[field];
        let color = "bg-zinc-200";
        let emoji = "😐";
        if (val >= 4) { color = "bg-emerald-500"; emoji = "😍"; }
        else if (val <= 2) { color = "bg-red-500"; emoji = "😡"; }

        return (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{label}</h3>
                            <p className="text-xs text-zinc-500">{desc}</p>
                        </div>
                    </div>
                    <div className={`text-2xl transition-transform hover:scale-125 cursor-default`}>
                        {emoji}
                    </div>
                </div>

                <Slider
                    value={[val]}
                    min={1} max={5} step={1}
                    onValueChange={(v) => updateField(field, v[0])}
                    className="mb-2"
                />
                <div className="flex justify-between text-xs font-medium text-zinc-400 px-1">
                    <span>{minLabel}</span>
                    <span className={val >= 4 ? "text-emerald-600" : val <= 2 ? "text-red-500" : "text-amber-500"}>{val}/5</span>
                    <span>{maxLabel}</span>
                </div>
            </div>
        );
    };

    if (status === "loading") return <div className="h-screen flex items-center justify-center">Chargement...</div>;

    if (status === "unauthenticated") return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <Lock size={48} className="text-zinc-300" />
            <p>Connectez-vous pour continuer.</p>
            <Button onClick={() => router.push("/login")}>Connexion</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-32">
            {/* Header */}
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="text-zinc-500 hover:text-zinc-900">
                        <ArrowLeft size={18} className="mr-2" /> Retour
                    </Button>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Étape {step}/{STEPS.length}</span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{STEPS[step - 1].label}</span>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* STEP 1: IDENTIFICATION */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Où avez-vous habité ?</h1>
                            <p className="text-zinc-500 text-lg">Votre expérience permettra d'aider des milliers de locataires.</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
                            <div className="space-y-2">
                                <Label>Adresse complète</Label>
                                <Input
                                    placeholder="Rechercher une adresse..."
                                    value={formData.address}
                                    onChange={(e) => updateField("address", e.target.value)}
                                    className="h-12 text-lg"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date d'entrée</Label>
                                    <Input type="date" value={formData.moveInDate} onChange={(e) => updateField("moveInDate", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date de sortie</Label>
                                    <Input type="date" value={formData.moveOutDate} onChange={(e) => updateField("moveOutDate", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: GLOBAL */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold">Note Globale</h1>
                            <p className="text-zinc-500">Quel sentiment gardez-vous de ce logement ?</p>
                        </div>

                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => updateField("rating", s)}
                                    className={`p-2 transition-all hover:scale-110 focus:outline-none`}
                                >
                                    <Star
                                        size={48}
                                        className={`${s <= formData.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"} drop-shadow-sm`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Textarea
                                    className="min-h-[150px] p-4 text-lg resize-none shadow-sm"
                                    placeholder="Racontez votre expérience... (Ce que vous auriez aimé savoir avant de signer)"
                                    value={formData.comment}
                                    onChange={(e) => updateField("comment", e.target.value)}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    placeholder="Ce que j'ai aimé (+)"
                                    className="border-emerald-200 bg-emerald-50/50 focus:ring-emerald-500"
                                    value={formData.pros}
                                    onChange={(e) => updateField("pros", e.target.value)}
                                />
                                <Input
                                    placeholder="Ce que je n'ai pas aimé (-)"
                                    className="border-red-200 bg-red-50/50 focus:ring-red-500"
                                    value={formData.cons}
                                    onChange={(e) => updateField("cons", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: COMFORT */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">Confort de Vie 🛋️</h1>
                            <p className="text-zinc-500">Est-ce qu'on s'y sent bien toute l'année ?</p>
                        </div>
                        <div className="grid gap-4">
                            {renderSlider("thermalScore", "Isolation Thermique", <Thermometer size={20} />, "Chaud l'hiver, Frais l'été ?")}
                            {renderSlider("acousticScore", "Isolation Phonique", <Volume2 size={20} />, "Bruit des voisins / Rue ?")}
                            {renderSlider("humidityScore", "Qualité de l'air", <Droplets size={20} />, "Humidité, Moisissures ?")}
                        </div>
                    </div>
                )}

                {/* STEP 4: BUILDING */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">Immeuble & Quartier 🏢</h1>
                            <p className="text-zinc-500">L'environnement direct du logement.</p>
                        </div>
                        <div className="grid gap-4">
                            {renderSlider("commonAreasScore", "Parties Communes", <Building2 size={20} />, "Propreté, État général ?")}
                            {renderSlider("safetyScore", "Sécurité", <Shield size={20} />, "Sentiment de sécurité le soir ?")}
                            {renderSlider("transportScore", "Transports", <Bus size={20} />, "Proximité Métro/Bus ?")}
                            {renderSlider("networkScore", "Réseau / Internet", <Wifi size={20} />, "4G, Fibre optique ?")}
                        </div>
                    </div>
                )}

                {/* STEP 5: OWNER */}
                {step === 5 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">Propriétaire / Agence 🔑</h1>
                            <p className="text-zinc-500">La relation humaine.</p>
                        </div>
                        <div className="grid gap-4">
                            {renderSlider("responsivenessScore", "Réactivité", <UserCheck size={20} />, "Rapide en cas de problème ?")}
                            {renderSlider("depositReturnScore", "Retour de Caution", <CheckCircle size={20} />, "Honnête sur l'état des lieux ?")}
                        </div>
                    </div>
                )}

                {/* STEP 6: RENT & DATA */}
                {step === 6 && (
                    <div className="space-y-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold">Transparence des Prix 💶</h1>
                            <p className="text-zinc-500">Ces données permettent de calculer la vraie inflation.</p>
                        </div>

                        <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
                            <div className="flex items-center gap-4 text-emerald-400 mb-2">
                                <Lock className="h-5 w-5" />
                                <span className="text-sm font-semibold tracking-wide uppercase">100% Confidentiel & Anonyme</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Surface (m²)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 45"
                                        className="bg-zinc-800 border-zinc-700 text-white text-lg h-12 focus:ring-emerald-500"
                                        value={formData.surface}
                                        onChange={(e) => updateField("surface", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Meublé ?</Label>
                                    <div className="flex gap-2 h-12">
                                        <Button
                                            variant={formData.isFurnished ? "default" : "outline"}
                                            className={`flex-1 border-zinc-700 ${formData.isFurnished ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-transparent text-zinc-300 hover:bg-zinc-800"}`}
                                            onClick={() => updateField("isFurnished", true)}
                                        >
                                            Oui
                                        </Button>
                                        <Button
                                            variant={!formData.isFurnished ? "default" : "outline"}
                                            className={`flex-1 border-zinc-700 ${!formData.isFurnished ? "bg-zinc-700 text-white hover:bg-zinc-600" : "bg-transparent text-zinc-300 hover:bg-zinc-800"}`}
                                            onClick={() => updateField("isFurnished", false)}
                                        >
                                            Non
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label className="text-zinc-400">Loyer mensuel payé (Charges Comprises)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="Ex: 1200"
                                        className="bg-zinc-800 border-zinc-700 text-white text-3xl font-bold h-16 pl-12 focus:ring-emerald-500"
                                        value={formData.rentPaid}
                                        onChange={(e) => updateField("rentPaid", e.target.value)}
                                    />
                                    <span className="absolute left-4 top-4 text-emerald-500 text-2xl font-bold">€</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Footer Actions */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-4 z-50">
                <div className="max-w-2xl mx-auto flex gap-4">
                    {step > 1 && (
                        <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
                            Précédent
                        </Button>
                    )}
                    {step < STEPS.length ? (
                        <Button size="lg" onClick={handleNext} className="flex-[2] bg-zinc-900 text-white hover:bg-zinc-800">
                            Suivant
                        </Button>
                    ) : (
                        <Button size="lg" onClick={handleSubmit} disabled={loading} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white text-lg shadow-lg shadow-emerald-200/50">
                            {loading ? "Publication..." : "Publier mon Avis"}
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
}

