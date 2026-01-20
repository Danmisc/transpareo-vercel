"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { updateTenantProfile, getTenantProfile } from "@/lib/actions/cv";
import { User, Briefcase, Home, Heart, Car, Save, Sparkles, Loader2 } from "lucide-react";

interface TenantCVProps {
    userId: string;
    onDirtyChange?: (isDirty: boolean) => void;
}

export function TenantCV({ userId, onDirtyChange }: TenantCVProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const load = async () => {
            const res = await getTenantProfile(userId);
            if (res.success && res.data) {
                setFormData(res.data);
            }
            setLoading(false);
        };
        load();
    }, [userId]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (onDirtyChange) onDirtyChange(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const res = await updateTenantProfile(userId, formData);
        setSaving(false);
        if (res.success) {
            toast.success("CV mis à jour avec succès");
            if (onDirtyChange) onDirtyChange(false);
        } else {
            toast.error("Erreur lors de la sauvegarde");
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
                        Mon CV Locataire <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Source de Vérité</span>
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Complétez ce profil à 100% pour générer votre dossier PDF et rassurer les propriétaires.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-zinc-900 text-white">
                    {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                    Enregistrer
                </Button>
            </div>

            {/* SECTION 1: IDENTITY & BIO */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="text-blue-500" /> Identité & Impact</CardTitle>
                    <CardDescription>Qui êtes-vous ? Humanisez votre dossier.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label>Votre Pitch (140 caractères max)</Label>
                        <Textarea
                            placeholder="Ex: Ingénieur calme, passionné de rando, cherche T2 lumineux..."
                            maxLength={140}
                            value={formData.bio || ""}
                            onChange={(e) => handleChange("bio", e.target.value)}
                        />
                        <p className="text-xs text-zinc-400 flex justify-end">{formData.bio?.length || 0}/140</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                            placeholder="06 12 34 56 78"
                            value={formData.phone || ""}
                            onChange={(e) => handleChange("phone", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Nationalité</Label>
                        <Input
                            placeholder="Française"
                            value={formData.nationality || ""}
                            onChange={(e) => handleChange("nationality", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 2: PROFESSIONAL */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase className="text-emerald-500" /> Stabilité Professionnelle</CardTitle>
                    <CardDescription>Votre situation, revenus et employeur.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={formData.status || ""} onValueChange={(v) => handleChange("status", v)}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CDI">CDI (Période essai validée)</SelectItem>
                                <SelectItem value="CDI_TRIAL">CDI (Période essai)</SelectItem>
                                <SelectItem value="CDD">CDD</SelectItem>
                                <SelectItem value="FREELANCE">Freelance / Indépendant</SelectItem>
                                <SelectItem value="PUBLIC">Fonctionnaire</SelectItem>
                                <SelectItem value="STUDENT">Etudiant</SelectItem>
                                <SelectItem value="RETIRED">Retraité</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Employeur / Entreprise</Label>
                        <Input
                            placeholder="Ex: Google France"
                            value={formData.employer || ""}
                            onChange={(e) => handleChange("employer", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Poste occupé</Label>
                        <Input
                            placeholder="Ex: Chef de projet Marketing"
                            value={formData.jobTitle || ""}
                            onChange={(e) => handleChange("jobTitle", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Revenus Nets Mensuels (Avant impôt)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="2500"
                                className="pl-8"
                                value={formData.netIncome || ""}
                                onChange={(e) => handleChange("netIncome", parseInt(e.target.value) || 0)}
                            />
                            <span className="absolute left-3 top-2.5 text-zinc-400">€</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Profil LinkedIn (Optionnel)</Label>
                        <Input
                            placeholder="https://linkedin.com/in/..."
                            value={formData.linkedinUrl || ""}
                            onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Mode de travail</Label>
                        <Select value={formData.workMode || ""} onValueChange={(v) => handleChange("workMode", v)}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ONSITE">100% Présentiel</SelectItem>
                                <SelectItem value="HYBRID">Hybride (Télétravail partiel)</SelectItem>
                                <SelectItem value="REMOTE">Full Remote</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 3: LIFESTYLE */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Heart className="text-pink-500" /> Mode de Vie & Foyer</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Situation Familiale</Label>
                        <Select value={formData.familyStatus || ""} onValueChange={(v) => handleChange("familyStatus", v)}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SINGLE">Célibataire / Seul(e)</SelectItem>
                                <SelectItem value="COUPLE">En Couple</SelectItem>
                                <SelectItem value="FAMILY">Famille</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Enfants à charge</Label>
                        <Input
                            type="number"
                            value={formData.childrenCount || 0}
                            onChange={(e) => handleChange("childrenCount", parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Animaux</Label>
                        <Input
                            placeholder="Non ou Ex: 1 Chat calme"
                            value={formData.pets || ""}
                            onChange={(e) => handleChange("pets", e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label>Fumeur ?</Label>
                        <Switch
                            checked={formData.smoker || false}
                            onCheckedChange={(c) => handleChange("smoker", c)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 4: HISTORY & PROJECT */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Home className="text-orange-500" /> Parcours & Projet</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Situation Actuelle</Label>
                        <Select value={formData.currentStatus || ""} onValueChange={(v) => handleChange("currentStatus", v)}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TENANT">Locataire</SelectItem>
                                <SelectItem value="OWNER">Propriétaire</SelectItem>
                                <SelectItem value="HOSTED">Hébergé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Loyer Actuel</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                className="pl-8"
                                value={formData.currentRent || ""}
                                onChange={(e) => handleChange("currentRent", parseInt(e.target.value) || 0)}
                            />
                            <span className="absolute left-3 top-2.5 text-zinc-400">€</span>
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Pourquoi déménagez-vous ?</Label>
                        <Input
                            placeholder="Ex: Rapprochement professionnel, Besoin d'une chambre en plus..."
                            value={formData.reasonForMove || ""}
                            onChange={(e) => handleChange("reasonForMove", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Durée envisagée</Label>
                        <Select value={formData.durationIntent || ""} onValueChange={(v) => handleChange("durationIntent", v)}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1_YEAR">Au moins 1 an</SelectItem>
                                <SelectItem value="LONG_TERM">Long terme (3 ans+)</SelectItem>
                                <SelectItem value="UNKNOWN">Je ne sais pas encore</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

