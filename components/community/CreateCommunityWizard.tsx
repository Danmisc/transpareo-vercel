"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Users, ArrowRight, ArrowLeft, Check, Sparkles,
    Image as ImageIcon, Palette, Lock, Globe, DollarSign, UploadCloud, Loader2, Library
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createCommunity } from "@/lib/community-actions";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { BannerLibraryDialog } from "@/components/profile/BannerLibraryDialog";

// Step Types
type WizardStep = "IDENTITY" | "BRANDING" | "MEMBERSHIP" | "REVIEW" | "SUCCESS";

const STEPS: WizardStep[] = ["IDENTITY", "BRANDING", "MEMBERSHIP", "REVIEW", "SUCCESS"];

const THEME_COLORS = [
    { name: "Indigo", value: "bg-indigo-600", border: "border-indigo-600", text: "text-indigo-600", from: "from-indigo-600", to: "to-purple-600" },
    { name: "Emerald", value: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-600", from: "from-emerald-600", to: "to-teal-600" },
    { name: "Rose", value: "bg-rose-600", border: "border-rose-600", text: "text-rose-600", from: "from-rose-600", to: "to-pink-600" },
    { name: "Amber", value: "bg-amber-600", border: "border-amber-600", text: "text-amber-600", from: "from-amber-600", to: "to-orange-600" },
    { name: "Sky", value: "bg-sky-600", border: "border-sky-600", text: "text-sky-600", from: "from-sky-600", to: "to-blue-600" },
];

const CATEGORIES = [
    "Immobilier", "Investissement", "Bourse", "Crypto", "Startup", "Lifestyle", "Autre"
];

interface CreateCommunityWizardProps {
    userId: string;
    children?: React.ReactNode; // Custom trigger
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateCommunityWizard({ userId, children, open: controlledOpen, onOpenChange: setControlledOpen }: CreateCommunityWizardProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
    const [isBannerLibraryOpen, setIsBannerLibraryOpen] = useState(false);

    const router = useRouter();

    // Upload refs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "", // Auto-generated
        description: "",
        category: "",
        type: "PUBLIC" as "PUBLIC" | "PRIVATE",
        price: "0",
        coverImage: "",
        avatar: "",
        theme: THEME_COLORS[0]
    });

    const stepName = STEPS[currentStep];

    const reset = () => {
        setCurrentStep(0);
        setFormData({
            name: "",
            slug: "",
            description: "",
            category: "",
            type: "PUBLIC",
            price: "0",
            coverImage: "",
            avatar: "",
            theme: THEME_COLORS[0]
        });
        setOpen(false);
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await createCommunity(userId, {
                name: formData.name,
                description: formData.description,
                type: formData.type,
                slug: formData.slug,
                avatar: formData.avatar,
                coverImage: formData.coverImage,
                theme: formData.theme
            });

            if (res.success) {
                // Success! Move to Success step
                setCurrentStep(STEPS.indexOf("SUCCESS"));
                router.refresh();
            } else {
                toast.error("Erreur lors de la création");
            }
        } catch (e) {
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug
    const handleNameChange = (name: string) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        setFormData(prev => ({ ...prev, name, slug }));
    };

    // Upload Helper
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(type);
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await uploadFile(data);
            if (res.success && res.url) {
                setFormData(prev => ({
                    ...prev,
                    [type === "avatar" ? "avatar" : "coverImage"]: res.url
                }));
                toast.success("Image téléchargée");
            } else {
                toast.error("Erreur d'upload");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur réseau");
        } finally {
            setUploading(null);
            // Reset input
            if (e.target) e.target.value = "";
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
                        <Users size={16} /> Créer une communauté
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl h-[600px] flex flex-col">
                {/* Header / Progress */}
                {stepName !== "SUCCESS" && (
                    <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Créer votre communauté</h2>
                                <p className="text-sm text-zinc-500">Étape {currentStep + 1} sur 4</p>
                            </div>
                            <div className="flex gap-1">
                                {STEPS.slice(0, 4).map((s, i) => (
                                    <div
                                        key={s}
                                        className={cn(
                                            "h-1.5 w-8 rounded-full transition-all duration-300",
                                            i <= currentStep ? "bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-800"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto relative scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 h-full"
                        >
                            {stepName === "IDENTITY" && (
                                <div className="space-y-6 max-w-lg mx-auto py-4">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                            <Sparkles size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold">Commençons par les bases</h3>
                                        <p className="text-zinc-500">Donnez une identité unique à votre futur espace.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nom de la communauté</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleNameChange(e.target.value)}
                                                placeholder="Ex: Investisseurs Paris"
                                                className="h-12 text-lg"
                                                autoFocus
                                            />
                                            {formData.slug && (
                                                <p className="text-xs text-zinc-400 font-mono">
                                                    transpareo.com/communities/<span className="text-indigo-500">{formData.slug}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Catégorie</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setFormData({ ...formData, category: cat })}
                                                        className={cn(
                                                            "px-3 py-2 text-sm rounded-lg border transition-all",
                                                            formData.category === cat
                                                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                                                                : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                                        )}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description courte</Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="De quoi allez-vous parler ?"
                                                className="resize-none"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {stepName === "BRANDING" && (
                                <div className="space-y-8 max-w-xl mx-auto py-4">
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold">Personnalisation</h3>
                                        <p className="text-zinc-500">Donnez vie à votre communauté avec un style unique.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* THEME */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">Couleur principale</Label>
                                            <div className="flex justify-center gap-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                                {THEME_COLORS.map(theme => (
                                                    <button
                                                        key={theme.name}
                                                        onClick={() => setFormData({ ...formData, theme })}
                                                        className={cn(
                                                            "w-12 h-12 rounded-full cursor-pointer transition-all duration-300 relative group",
                                                            theme.value,
                                                            formData.theme.name === theme.name
                                                                ? "ring-4 ring-offset-4 ring-offset-white dark:ring-offset-zinc-900 ring-zinc-200 dark:ring-zinc-700 scale-100 shadow-lg"
                                                                : "opacity-60 hover:opacity-100 hover:scale-110"
                                                        )}
                                                        title={theme.name}
                                                    >
                                                        {formData.theme.name === theme.name && (
                                                            <Check className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-6 items-start">
                                            {/* AVATAR - Compact */}
                                            <div className="space-y-2 shrink-0">
                                                <Label className="text-sm font-semibold">Logo</Label>
                                                <div
                                                    onClick={() => avatarInputRef.current?.click()}
                                                    className="w-32 h-32 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group relative overflow-hidden"
                                                >
                                                    {uploading === "avatar" ? (
                                                        <Loader2 className="animate-spin text-zinc-400" />
                                                    ) : formData.avatar ? (
                                                        <>
                                                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                                                <UploadCloud size={16} className="mb-1" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-2 bg-white dark:bg-zinc-950 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                                <ImageIcon size={16} className="text-zinc-400" />
                                                            </div>
                                                            <span className="text-[10px] text-zinc-500 font-medium">Ajouter</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        ref={avatarInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleUpload(e, "avatar")}
                                                    />
                                                </div>
                                            </div>

                                            {/* COVER - Takes remaining space */}
                                            <div className="space-y-2 flex-1">
                                                <Label className="text-sm font-semibold flex justify-between items-center">
                                                    Couverture
                                                    {formData.coverImage && (
                                                        <button
                                                            onClick={() => setFormData({ ...formData, coverImage: "" })}
                                                            className="text-xs text-red-500 hover:underline"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    )}
                                                </Label>
                                                <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-32 w-full">
                                                    {uploading === "cover" ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Loader2 className="animate-spin text-zinc-400" />
                                                        </div>
                                                    ) : formData.coverImage ? (
                                                        <>
                                                            <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() => coverInputRef.current?.click()}
                                                                    className="h-8 px-3 text-xs"
                                                                >
                                                                    Change
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() => setIsBannerLibraryOpen(true)}
                                                                    className="h-8 px-3 text-xs"
                                                                >
                                                                    Lib
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center gap-4">
                                                            <button
                                                                onClick={() => coverInputRef.current?.click()}
                                                                className="flex flex-col items-center gap-1 group/btn"
                                                            >
                                                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover/btn:border-indigo-500 transition-colors">
                                                                    <UploadCloud size={16} className="text-zinc-500 group-hover/btn:text-indigo-500" />
                                                                </div>
                                                                <span className="text-[10px] font-medium text-zinc-500">Upload</span>
                                                            </button>
                                                            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800" />
                                                            <button
                                                                onClick={() => setIsBannerLibraryOpen(true)}
                                                                className="flex flex-col items-center gap-1 group/btn"
                                                            >
                                                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover/btn:border-purple-500 transition-colors">
                                                                    <Library size={16} className="text-zinc-500 group-hover/btn:text-purple-500" />
                                                                </div>
                                                                <span className="text-[10px] font-medium text-zinc-500">Galerie</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={coverInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleUpload(e, "cover")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {stepName === "MEMBERSHIP" && (
                                <div className="space-y-8 max-w-lg mx-auto py-4">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold">Accès & Confidentialité</h3>
                                        <p className="text-zinc-500">Définissez qui peut rejoindre.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div
                                            onClick={() => setFormData({ ...formData, type: "PUBLIC" })}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer flex items-start gap-4 transition-all",
                                                formData.type === "PUBLIC"
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
                                                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                                            )}
                                        >
                                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shrink-0">
                                                <Globe className="text-indigo-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold flex items-center gap-2">
                                                    Public
                                                    {formData.type === "PUBLIC" && <Check size={16} className="text-indigo-500" />}
                                                </h4>
                                                <p className="text-sm text-zinc-500">Visible par tous. Idéal pour construire une large audience.</p>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setFormData({ ...formData, type: "PRIVATE" })}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer flex items-start gap-4 transition-all",
                                                formData.type === "PRIVATE"
                                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                                                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                                            )}
                                        >
                                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shrink-0">
                                                <Lock className="text-purple-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold flex items-center gap-2">
                                                    Privé
                                                    {formData.type === "PRIVATE" && <Check size={16} className="text-purple-500" />}
                                                </h4>
                                                <p className="text-sm text-zinc-500">Sur invitation uniquement. Pour des groupes exclusifs.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 opacity-50 cursor-not-allowed filter grayscale">
                                        <div className="flex justify-between items-center mb-4">
                                            <Label className="flex items-center gap-2">
                                                <DollarSign size={16} />
                                                Prix d'entrée (Bientôt)
                                            </Label>
                                            <Badge variant="outline">Pro</Badge>
                                        </div>
                                        <Input disabled placeholder="Gratuit" value="Gratuit" />
                                    </div>
                                </div>
                            )}

                            {stepName === "REVIEW" && (
                                <div className="space-y-8 max-w-lg mx-auto py-4">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold">Récapitulatif</h3>
                                        <p className="text-zinc-500">À quoi ressemblera votre communauté.</p>
                                    </div>

                                    {/* PREVIEW CARD */}
                                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl max-w-sm mx-auto transform hover:scale-105 transition-transform duration-500">
                                        <div className={cn("h-32 w-full bg-gradient-to-r relative", formData.theme.from, formData.theme.to)}>
                                            {formData.coverImage && (
                                                <img src={formData.coverImage} className="w-full h-full object-cover" alt="" />
                                            )}
                                        </div>
                                        <div className="px-6 pb-6 relative">
                                            <div className="-mt-10 mb-3">
                                                <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-zinc-950 bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center overflow-hidden">
                                                    {formData.avatar ? (
                                                        <img src={formData.avatar} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className={cn("text-2xl font-bold", formData.theme.text)}>{formData.name[0] || "?"}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-lg mb-1">{formData.name || "Nom du groupe"}</h4>
                                            <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                                                {formData.description || "Pas de description..."}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-zinc-400">
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} /> 0 membre
                                                </span>
                                                <Badge variant="secondary" className="text-[10px] h-5">
                                                    {formData.category || "Général"}
                                                </Badge>
                                            </div>
                                            <Button className={cn("w-full mt-4", formData.theme.value, "hover:opacity-90")}>
                                                Rejoindre
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {stepName === "SUCCESS" && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                        className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"
                                    >
                                        <Check size={48} strokeWidth={4} />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Félicitations ! 🎉</h3>
                                        <p className="text-zinc-500 max-w-xs mx-auto">
                                            Votre communauté <strong className="text-zinc-900 dark:text-zinc-100">{formData.name}</strong> est prête à décoller.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full max-w-xs">
                                        <Button
                                            onClick={() => router.push(`/communities/${formData.slug}`)}
                                            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-12 text-base rounded-xl"
                                        >
                                            Visiter la communauté
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" onClick={reset} className="w-full rounded-xl">
                                            Fermer
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                {stepName !== "SUCCESS" && (
                    <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={currentStep === 0 || loading}
                            className="text-zinc-500"
                        >
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Retour
                        </Button>

                        {stepName === "REVIEW" ? (
                            <Button
                                onClick={handleCreate}
                                disabled={loading}
                                className={cn("px-8 font-semibold text-white", formData.theme.value)}
                            >
                                {loading ? "Création..." : "Lancer la communauté 🚀"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={!formData.name}
                                className="bg-zinc-900 text-white hover:bg-zinc-800 px-8"
                            >
                                Continuer
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        )}
                    </div>
                )}
            </DialogContent>

            <BannerLibraryDialog
                isOpen={isBannerLibraryOpen}
                onClose={() => setIsBannerLibraryOpen(false)}
                onSelect={(url) => {
                    setFormData(prev => ({ ...prev, coverImage: url }));
                }}
            />
        </Dialog>
    );
}
