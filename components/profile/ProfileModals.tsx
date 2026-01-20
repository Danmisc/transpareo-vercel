"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addPortfolioItem, updateSocialLinks, giveEndorsement } from "@/lib/actions-profile-enhanced";
import { Loader2, Plus, Link as LinkIcon, Twitter, Linkedin, Instagram, Facebook, Youtube, Globe } from "lucide-react";
import { toast } from "sonner";

// ==========================================
// ADD PORTFOLIO ITEM MODAL
// ==========================================

interface AddPortfolioModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddPortfolioModal({ open, onOpenChange }: AddPortfolioModalProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "PROJECT",
        price: "",
        location: "",
        link: "",
        imageUrl: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;

        setLoading(true);
        try {
            await addPortfolioItem({
                title: form.title,
                description: form.description || undefined,
                category: form.category,
                price: form.price ? parseFloat(form.price) : undefined,
                location: form.location || undefined,
                link: form.link || undefined,
                imageUrl: form.imageUrl || undefined
            });
            toast.success("Élément ajouté au portfolio!");
            onOpenChange(false);
            setForm({ title: "", description: "", category: "PROJECT", price: "", location: "", link: "", imageUrl: "" });
        } catch (error) {
            toast.error("Erreur lors de l'ajout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajouter au Portfolio</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                            id="title"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Ex: Appartement Paris 16e"
                        />
                    </div>
                    <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SOLD">Vendu</SelectItem>
                                <SelectItem value="RENTED">Loué</SelectItem>
                                <SelectItem value="PROJECT">Projet</SelectItem>
                                <SelectItem value="SERVICE">Service</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Décrivez ce projet..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="price">Prix (€)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                placeholder="450000"
                            />
                        </div>
                        <div>
                            <Label htmlFor="location">Localisation</Label>
                            <Input
                                id="location"
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                placeholder="Paris, France"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="link">Lien (optionnel)</Label>
                        <Input
                            id="link"
                            value={form.link}
                            onChange={e => setForm({ ...form, link: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading || !form.title}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Ajouter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ==========================================
// EDIT SOCIAL LINKS MODAL
// ==========================================

interface SocialLink {
    platform: string;
    url: string;
    label?: string;
}

interface EditLinksModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLinks: SocialLink[];
}

const PLATFORMS = [
    { id: "twitter", label: "Twitter", icon: Twitter },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "facebook", label: "Facebook", icon: Facebook },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "website", label: "Site web", icon: Globe },
];

export function EditLinksModal({ open, onOpenChange, currentLinks }: EditLinksModalProps) {
    const [loading, setLoading] = useState(false);
    const [links, setLinks] = useState<SocialLink[]>(currentLinks);

    const handleAddLink = () => {
        setLinks([...links, { platform: "website", url: "", label: "" }]);
    };

    const handleRemoveLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleUpdateLink = (index: number, field: keyof SocialLink, value: string) => {
        const updated = [...links];
        updated[index] = { ...updated[index], [field]: value };
        setLinks(updated);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const validLinks = links.filter(l => l.url.trim());
            await updateSocialLinks(validLinks);
            toast.success("Liens mis à jour!");
            onOpenChange(false);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Modifier les liens</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {links.map((link, i) => (
                        <div key={i} className="flex gap-2 items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            <Select value={link.platform} onValueChange={v => handleUpdateLink(i, "platform", v)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PLATFORMS.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                value={link.url}
                                onChange={e => handleUpdateLink(i, "url", e.target.value)}
                                placeholder="https://..."
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveLink(i)}
                                className="text-red-500 hover:text-red-600"
                            >
                                ✕
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddLink} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un lien
                    </Button>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ==========================================
// GIVE ENDORSEMENT MODAL
// ==========================================

interface GiveEndorsementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receiverId: string;
    receiverName: string;
}

const SKILLS = [
    "Négociation",
    "Expertise marché",
    "Estimation",
    "Juridique immobilier",
    "Gestion locative",
    "Investissement",
    "Rénovation",
    "Relation client",
    "Marketing digital",
    "Crowdfunding",
];

export function GiveEndorsementModal({ open, onOpenChange, receiverId, receiverName }: GiveEndorsementModalProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        skill: "",
        message: "",
        relationship: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.skill) return;

        setLoading(true);
        try {
            await giveEndorsement(
                receiverId,
                form.skill,
                form.message || undefined,
                form.relationship || undefined
            );
            toast.success(`Recommandation envoyée à ${receiverName}!`);
            onOpenChange(false);
            setForm({ skill: "", message: "", relationship: "" });
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Recommander {receiverName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Compétence *</Label>
                        <Select value={form.skill} onValueChange={v => setForm({ ...form, skill: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir une compétence" />
                            </SelectTrigger>
                            <SelectContent>
                                {SKILLS.map(skill => (
                                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Votre relation</Label>
                        <Select value={form.relationship} onValueChange={v => setForm({ ...form, relationship: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Optionnel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Client">Client</SelectItem>
                                <SelectItem value="Collègue">Collègue</SelectItem>
                                <SelectItem value="Partenaire">Partenaire</SelectItem>
                                <SelectItem value="Ami">Ami</SelectItem>
                                <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Message (optionnel)</Label>
                        <Textarea
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                            placeholder="Décrivez votre expérience..."
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading || !form.skill}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Envoyer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

