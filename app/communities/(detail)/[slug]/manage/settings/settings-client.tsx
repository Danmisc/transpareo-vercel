"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { updateCommunitySettings } from "@/lib/community-management-actions";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Loader2, UploadCloud, Image as ImageIcon, Library, Check,
    Globe, Lock, ShieldAlert, Save, RefreshCw, LayoutTemplate
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BannerLibraryDialog } from "@/components/profile/BannerLibraryDialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import isEqual from "lodash/isEqual";

interface SettingsClientProps {
    community: any;
    currentUserId: string;
}

const THEME_COLORS = [
    { name: "Indigo", value: "bg-indigo-600", secondary: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-600" },
    { name: "Emerald", value: "bg-emerald-600", secondary: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-600" },
    { name: "Rose", value: "bg-rose-600", secondary: "bg-rose-50", text: "text-rose-600", border: "border-rose-600" },
    { name: "Amber", value: "bg-amber-600", secondary: "bg-amber-50", text: "text-amber-600", border: "border-amber-600" },
    { name: "Sky", value: "bg-sky-600", secondary: "bg-sky-50", text: "text-sky-600", border: "border-sky-600" },
    { name: "Zinc", value: "bg-zinc-600", secondary: "bg-zinc-50", text: "text-zinc-600", border: "border-zinc-600" },
];

const CATEGORIES = [
    "Immobilier", "Investissement", "Bourse", "Crypto", "Startup", "Lifestyle", "Autre"
];

export default function SettingsClient({ community, currentUserId }: SettingsClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
    const [isBannerLibraryOpen, setIsBannerLibraryOpen] = useState(false);

    // Refs for file inputs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Initial Data Parsing
    const initialTheme = community.theme ? JSON.parse(community.theme) : {};
    const initialSettings = community.settings ? JSON.parse(community.settings) : {};

    // Ensure we have a valid theme object
    const currentThemeObj = useMemo(() => {
        return THEME_COLORS.find(c => c.value === initialTheme.value) || THEME_COLORS[0];
    }, [initialTheme]);

    // Construct Clean Initial Data for Comparison
    const initialData = useMemo(() => ({
        name: community.name || "",
        description: community.description || "",
        category: community.category || "",
        image: community.image || "",
        coverImage: community.coverImage || "",
        privacy: (community.type as "PUBLIC" | "PRIVATE" | "RESTRICTED") || "PUBLIC",
        joinRequestsEnabled: community.joinRequestsEnabled || false,
        theme: currentThemeObj
    }), [community, currentThemeObj]);

    const [formData, setFormData] = useState(initialData);

    // Deep Compare for Dirty State
    const isDirty = useMemo(() => {
        return !isEqual(formData, initialData);
    }, [formData, initialData]);

    // Reset form when initialData changes (e.g. after save/refresh)
    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    // Helper for Image Upload
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
                    [type === "avatar" ? "image" : "coverImage"]: res.url
                }));
                toast.success("Image mise à jour");
            } else {
                toast.error("Erreur lors de l'envoi");
            }
        } catch (err) {
            toast.error("Erreur réseau");
        } finally {
            setUploading(null);
            if (e.target) e.target.value = "";
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Prepare Theme Object
            const themeToSave = formData.theme;
            const settingsToSave = { ...initialSettings };

            const result = await updateCommunitySettings(
                community.id,
                currentUserId,
                settingsToSave,
                themeToSave,
                {
                    name: formData.name,
                    description: formData.description,
                    privacy: formData.privacy,
                    category: formData.category,
                    image: formData.image,
                    coverImage: formData.coverImage,
                    joinRequestsEnabled: formData.joinRequestsEnabled
                }
            );

            if (result.success) {
                toast.success("Paramètres enregistrés avec succès");
                router.refresh();
            } else {
                toast.error("Échec de l'enregistrement");
            }
        } catch (error) {
            toast.error("Une erreur inconnue est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiscard = () => {
        setFormData(initialData);
        toast.info("Modifications annulées");
    };

    return (
        <div className="space-y-6 max-w-4xl pb-20 relative">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Paramètres de la communauté</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Gérez l'identité, l'apparence et l'accès à votre espace.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start h-12 bg-zinc-100/50 dark:bg-zinc-800/50 p-1 rounded-xl mb-6 overflow-x-auto">
                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm">
                        <LayoutTemplate className="w-4 h-4 mr-2" /> Général
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm">
                        <Save className="w-4 h-4 mr-2" /> Apparence
                    </TabsTrigger>
                    <TabsTrigger value="access" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm">
                        <Lock className="w-4 h-4 mr-2" /> Accès & Confidentialité
                    </TabsTrigger>
                    <TabsTrigger value="danger" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm text-red-500 data-[state=active]:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Danger
                    </TabsTrigger>
                </TabsList>

                {/* TAB: GENERAL */}
                <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Branding Column */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="space-y-3">
                                <Label>Logo</Label>
                                <div
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative overflow-hidden group"
                                >
                                    {uploading === "avatar" ? (
                                        <Loader2 className="animate-spin text-zinc-400" />
                                    ) : formData.image ? (
                                        <>
                                            <img src={formData.image} alt="Logo" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                <UploadCloud className="w-6 h-6" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 text-zinc-400">
                                                <ImageIcon size={20} />
                                            </div>
                                            <span className="text-xs text-zinc-500 font-medium">Ajouter un logo</span>
                                        </div>
                                    )}
                                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "avatar")} />
                                </div>
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className="md:col-span-2 space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="space-y-3">
                                <Label>Nom de la communauté</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="font-medium text-lg"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="resize-none"
                                />
                                <p className="text-xs text-zinc-500 text-right">Visible sur la page d'accueil de la communauté</p>
                            </div>

                            <div className="space-y-3">
                                <Label>Catégorie</Label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFormData({ ...formData, category: cat })}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
                                                formData.category === cat
                                                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white"
                                                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Image de couverture</Label>
                        <div className="relative w-full h-48 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900 group">
                            {uploading === "cover" ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-zinc-400" />
                                </div>
                            ) : formData.coverImage ? (
                                <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                </div>
                            )}

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <Button size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()}>
                                    <UploadCloud className="w-4 h-4 mr-2" /> Changer
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsBannerLibraryOpen(true);
                                    }}
                                >
                                    <Library className="w-4 h-4 mr-2" /> Galerie
                                </Button>
                            </div>
                            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "cover")} />
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: APPEARANCE */}
                <TabsContent value="appearance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-semibold mb-4">Thème de couleur</h3>
                        <div className="flex flex-wrap gap-4">
                            {THEME_COLORS.map(theme => (
                                <button
                                    key={theme.name}
                                    onClick={() => setFormData({ ...formData, theme })}
                                    className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative",
                                        theme.value,
                                        formData.theme.name === theme.name
                                            ? "ring-4 ring-offset-2 ring-zinc-900 dark:ring-white scale-105"
                                            : "opacity-80 hover:opacity-100 hover:scale-105"
                                    )}
                                >
                                    {formData.theme.name === theme.name && <Check className="text-white w-6 h-6" strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-zinc-500">
                            Cette couleur sera appliquée aux boutons, liens et indicateurs de votre communauté.
                        </p>
                    </div>

                    <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex justify-center">
                        {/* Fake Post Preview */}
                        <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden">
                                    {formData.image && <img src={formData.image} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">{formData.name || "Ma Communauté"}</div>
                                    <div className="text-xs text-zinc-500">il y a 2h</div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 w-3/4 rounded-full" />
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 w-full rounded-full" />
                            </div>
                            <Button className={cn("w-full", formData.theme.value)}>
                                S'abonner
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: ACCESS */}
                <TabsContent value="access" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
                        {/* Privacy Toggle */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    {formData.privacy === "PUBLIC" ? <Globe size={18} /> : <Lock size={18} />}
                                    Visibilité
                                </Label>
                                <p className="text-sm text-zinc-500 max-w-md">
                                    {formData.privacy === "PUBLIC"
                                        ? "Votre communauté est visible par tous. Tout le monde peut voir le contenu."
                                        : "Seuls les membres peuvent voir le contenu et les discussions."}
                                </p>
                            </div>
                            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                                <button
                                    onClick={() => setFormData({ ...formData, privacy: "PUBLIC" })}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                                        formData.privacy === "PUBLIC"
                                            ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white"
                                            : "text-zinc-500"
                                    )}
                                >
                                    Public
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, privacy: "PRIVATE" })}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                                        formData.privacy === "PRIVATE"
                                            ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white"
                                            : "text-zinc-500"
                                    )}
                                >
                                    Privé
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                        {/* Join Requests */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Demandes d'adhésion</Label>
                                <p className="text-sm text-zinc-500 max-w-md">
                                    Si activé, les nouveaux membres devront être approuvés par un modérateur avant de pouvoir rejoindre.
                                </p>
                            </div>
                            <Switch
                                checked={formData.joinRequestsEnabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, joinRequestsEnabled: checked })}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: DANGER */}
                <TabsContent value="danger" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl">
                        <h3 className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-5 h-5" /> Zone de Danger
                        </h3>
                        <p className="text-red-600/70 dark:text-red-400/70 text-sm mb-6 max-w-md">
                            La suppression d'une communauté est irréversible. Tous les messages, membres et données seront effacés définitivement.
                        </p>
                        <div className="flex items-center gap-4">
                            <Button variant="destructive" disabled>
                                Supprimer la communauté
                            </Button>
                            <span className="text-xs text-zinc-400 italic">Pour des raisons de sécurité, cette action est temporairement désactivée.</span>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* SMOOTH SAVE BAR */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-end md:justify-center md:pl-[280px] z-50"
                    >
                        <div className="w-full max-w-4xl flex items-center justify-between">
                            <span className="text-sm text-zinc-500 hidden md:block">
                                Modifications non enregistrées
                            </span>
                            <div className="flex gap-4">
                                <Button variant="ghost" onClick={handleDiscard}>
                                    Annuler
                                </Button>
                                <Button onClick={handleSave} disabled={isLoading} className={cn("min-w-[120px]", formData.theme.value)}>
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Enregistrer
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BannerLibraryDialog
                isOpen={isBannerLibraryOpen}
                onClose={() => setIsBannerLibraryOpen(false)}
                onSelect={(url) => {
                    setFormData(prev => ({ ...prev, coverImage: url }));
                }}
            />
        </div>
    );
}
