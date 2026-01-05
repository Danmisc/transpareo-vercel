"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Check, Upload, Image as ImageIcon, User, Share2, Palette, Globe, Linkedin, Instagram, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string;
        bio?: string;
        location?: string;
        website?: string;
        coverImage?: string;
        avatar?: string;
        links?: string;
    };
}

const PRESET_AVATARS = [
    "/avatars/01.png",
    "/avatars/02.png",
    "/avatars/03.png",
    "/avatars/04.png",
    "/avatars/avatar_abstract_blue.png",
    "/avatars/default.svg"
];

const PRESET_COVERS = [
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1080&q=80", // Gradient 1
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1080&q=80", // Gradient 2
    "/welcome.png",
    "/loft-lyon.png"
];

export function EditProfileDialog({ isOpen, onClose, user }: EditProfileDialogProps) {
    const [formData, setFormData] = useState({
        name: user.name,
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        avatar: user.avatar || "",
        coverImage: user.coverImage || ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { update } = useSession();
    const router = useRouter();

    const [socials, setSocials] = useState(() => {
        try {
            return user.links ? JSON.parse(user.links) : { twitter: "", linkedin: "", instagram: "" };
        } catch {
            return { twitter: "", linkedin: "", instagram: "" };
        }
    });

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "avatar" | "coverImage") => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic preview
        const objectUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, [field]: objectUrl }));

        const data = new FormData();
        data.append("file", file);

        // Import dynamically to avoid server action issues if any, or just use import at top
        const { uploadFile } = await import("@/lib/upload");
        const res = await uploadFile(data);

        if (res.success && res.url) {
            setFormData(prev => ({ ...prev, [field]: res.url }));
        } else {
            setError("Echec de l'upload. Veuillez réessayer.");
            // Revert optimistically if needed, but keeping local preview is often fine until save
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const itemsToSubmit = {
            ...formData,
            links: JSON.stringify(socials)
        };

        const res = await updateProfile(user.id, itemsToSubmit);

        if (res.success) {
            await update({
                name: itemsToSubmit.name,
                image: itemsToSubmit.avatar
            });
            router.refresh();
            onClose();
        } else {
            setError(res.error || "Une erreur est survenue");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-background rounded-xl shadow-2xl border p-0 m-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="font-semibold text-lg">Modifier le profil</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="profile" className="flex flex-col md:flex-row h-full">

                        {/* Sidebar / Tabs List */}
                        <div className="md:w-64 border-r bg-muted/30 p-4">
                            <TabsList className="flex flex-col h-auto bg-transparent gap-1 p-0">
                                <TabsTrigger value="profile" className="w-full justify-start gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md transition-colors">
                                    <User className="h-4 w-4" /> Informations
                                </TabsTrigger>
                                <TabsTrigger value="appearance" className="w-full justify-start gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md transition-colors">
                                    <Palette className="h-4 w-4" /> Apparence
                                </TabsTrigger>
                                <TabsTrigger value="social" className="w-full justify-start gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md transition-colors">
                                    <Share2 className="h-4 w-4" /> Réseaux Sociaux
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6">
                            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">

                                <TabsContent value="profile" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* Avatar Selection */}
                                    <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg border border-dashed">
                                        <div className="relative group">
                                            <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                                                <AvatarImage src={formData.avatar} />
                                                <AvatarFallback>{formData.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                                <Upload className="h-6 w-6 text-white" />
                                            </div>
                                            <input
                                                type="file"
                                                ref={avatarInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, "avatar")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Photo de profil</h4>
                                            <div className="flex gap-2">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="sm">Choisir un preset</Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-64 p-2 grid grid-cols-4 gap-2">
                                                        {PRESET_AVATARS.map((src) => (
                                                            <div
                                                                key={src}
                                                                className={cn("aspect-square rounded-full overflow-hidden cursor-pointer border-2 hover:border-primary transition-all", formData.avatar === src ? "border-primary" : "border-transparent")}
                                                                onClick={() => setFormData({ ...formData, avatar: src })}
                                                            >
                                                                <img src={src} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </PopoverContent>
                                                </Popover>
                                                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setFormData({ ...formData, avatar: "/avatars/default.svg" })}>
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nom affiché</Label>
                                            <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea id="bio" className="min-h-[100px]" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} maxLength={150} />
                                            <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/150</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="location">Localisation</Label>
                                                <Input id="location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Ville, Pays" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="website">Site Web</Label>
                                                <Input id="website" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://" />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="appearance" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Image de couverture</Label>
                                            <div className="aspect-[3/1] rounded-lg bg-muted relative overflow-hidden group shadow-sm border">
                                                {formData.coverImage ? (
                                                    <img src={formData.coverImage} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                                        <ImageIcon className="h-8 w-8 opacity-50" />
                                                    </div>
                                                )}

                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => coverInputRef.current?.click()}>
                                                        <Upload className="h-4 w-4" /> Uploader
                                                    </Button>
                                                    <input
                                                        type="file"
                                                        ref={coverInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, "coverImage")}
                                                    />

                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="secondary" size="sm" className="gap-2">
                                                                <Palette className="h-4 w-4" /> Choisir
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80 p-2">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {PRESET_COVERS.map((src, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="aspect-[2/1] bg-muted rounded overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                                                                        onClick={() => setFormData({ ...formData, coverImage: src })}
                                                                    >
                                                                        <img src={src} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="p-2 border-t mt-2">
                                                                <Label className="text-xs mb-1 block">Ou URL personnalisée</Label>
                                                                <Input
                                                                    className="h-8 text-xs"
                                                                    value={formData.coverImage}
                                                                    onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                                                                    placeholder="https://..."
                                                                />
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="social" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">Ajoutez des liens vers vos autres profils pour que vos abonnés puissent vous retrouver ailleurs.</p>

                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Twitter className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-xs mb-1">Twitter (X)</Label>
                                                    <Input
                                                        value={socials.twitter || ""}
                                                        onChange={e => setSocials({ ...socials, twitter: e.target.value })}
                                                        placeholder="https://twitter.com/..."
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-700/10 flex items-center justify-center text-blue-700">
                                                    <Linkedin className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-xs mb-1">LinkedIn</Label>
                                                    <Input
                                                        value={socials.linkedin || ""}
                                                        onChange={e => setSocials({ ...socials, linkedin: e.target.value })}
                                                        placeholder="https://linkedin.com/in/..."
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                                                    <Instagram className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-xs mb-1">Instagram</Label>
                                                    <Input
                                                        value={socials.instagram || ""}
                                                        onChange={e => setSocials({ ...socials, instagram: e.target.value })}
                                                        placeholder="https://instagram.com/..."
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </form>
                        </div>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="border-t bg-muted/20 p-4 flex items-center justify-between">
                    {error ? <p className="text-sm text-destructive font-medium">{error}</p> : <span />}
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" form="edit-profile-form" disabled={isSubmitting}>
                            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
