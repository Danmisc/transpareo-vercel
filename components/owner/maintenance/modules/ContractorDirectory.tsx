"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Phone, MapPin, Clock, ShieldCheck, Mail, Plus, Search, Trash2, MoreVertical, Briefcase, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getContractors, addContractor, deleteContractor, submitPartnerRequest } from "@/lib/actions-maintenance";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// --- PARTNER WIZARD COMPONENT ---
function PartnerWizard({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company: "", siret: "", address: "", web: "",
        specialty: "", size: "", insurance: "", zone: "",
        phone: "", email: "", contact: ""
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await submitPartnerRequest(formData);
            setStep(3); // Success
            toast.success("Dossier transmis au service Transpareo Pro !");
        } catch (e) {
            toast.error("Erreur d'envoi");
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(1);
        setFormData({
            company: "", siret: "", address: "", web: "",
            specialty: "", size: "", insurance: "", zone: "",
            phone: "", email: "", contact: ""
        });
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={(val) => !val && reset()}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-zinc-950 text-white border-zinc-800">

                {/* PROGRESS BAR */}
                <div className="h-1 bg-zinc-900 w-full">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                        style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                    />
                </div>

                <div className="p-8 max-h-[85vh] overflow-y-auto">

                    {/* STEP 1: IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <Briefcase className="text-indigo-400 w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Identité Entreprise</h2>
                                    <p className="text-zinc-400 text-sm">Étape 1/2 : Informations légales</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Nom de la Société <span className="text-red-500">*</span></Label>
                                        <Input
                                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            placeholder="Ex: Martin Rénovation SAS"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Numéro SIRET <span className="text-red-500">*</span></Label>
                                        <Input
                                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                                            value={formData.siret}
                                            onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                                            placeholder="14 chiffres"
                                            maxLength={14}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Adresse du Siège</Label>
                                    <Input
                                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Adresse complète"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Nom du Gérant</Label>
                                        <Input
                                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            placeholder="Prénom Nom"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Site Web (optionnel)</Label>
                                        <Input
                                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                                            value={formData.web}
                                            onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                                            placeholder="www.mon-entreprise.fr"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={() => setStep(2)} className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 mt-4">
                                Suivant <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* STEP 2: PRO DETAILS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <ShieldCheck className="text-indigo-400 w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Accréditation Pro</h2>
                                    <p className="text-zinc-400 text-sm">Étape 2/2 : Assurance & Activité</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Corps de Métier Principal <span className="text-red-500">*</span></Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, specialty: v })}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectValue placeholder="Choisir..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["Plomberie", "Électricité", "Serrurerie", "Chauffage", "Rénovation Globale", "Peinture", "Autre"].map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Effectif Entreprise</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, size: v })}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectValue placeholder="Taille..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["1 (Indépendant)", "2-5 salariés", "6-20 salariés", "20+ salariés"].map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Numéro Police Décennale <span className="text-red-500">*</span></Label>
                                    <Input
                                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                                        value={formData.insurance}
                                        onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                                        placeholder="Ex: AXA-123456789"
                                    />
                                    <p className="text-xs text-zinc-500">Un justificatif sera demandé ultérieurement.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Téléphone Pro <span className="text-red-500">*</span></Label>
                                        <Input
                                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Email Pro <span className="text-red-500">*</span></Label>
                                        <Input
                                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400 hover:text-white">Retour</Button>
                                <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Soumettre ma candidature"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center text-center space-y-6 py-10 animate-in zoom-in-95 fade-in duration-500">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-indigo-500/20">
                                <CheckCircle2 className="text-white w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white">Dossier en traitement</h2>
                                <p className="text-zinc-400 max-w-sm mx-auto leading-relaxed">
                                    Merci {formData.contact.split(' ')[0]}. Votre demande d'adhésion pour <strong className="text-white">{formData.company}</strong> a bien été enregistrée.
                                </p>
                            </div>

                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 max-w-sm w-full text-left space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Référence dossier</span>
                                    <span className="text-zinc-300 font-mono">REQ-{Math.floor(Math.random() * 10000)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Délai estimé</span>
                                    <span className="text-emerald-400">48h ouvrées</span>
                                </div>
                            </div>

                            <Button onClick={reset} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white w-full max-w-xs">
                                Retour à l'annuaire
                            </Button>
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- MAIN DIRECTORY COMPONENT ---
export function ContractorDirectory() {
    const [contractors, setContractors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("Tous");

    // Partner Modal State
    const [isPartnerOpen, setIsPartnerOpen] = useState(false);

    // Add Pro Form State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", jobType: "", phone: "", email: "" });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getContractors();
            setContractors(data);
        } catch (e) {
            toast.error("Erreur chargement annuaire");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.name || !newItem.jobType) {
            toast.error("Nom et Métier requis");
            return;
        }

        try {
            await addContractor(newItem);
            toast.success("Artisan ajouté !");
            setIsAddOpen(false);
            setNewItem({ name: "", jobType: "", phone: "", email: "" });
            loadData();
        } catch (e) {
            toast.error("Erreur ajout");
        }
    };

    const handleDelete = async (id: string, e: any) => {
        e.stopPropagation();
        try {
            await deleteContractor(id);
            toast.success("Artisan supprimé");
            setContractors(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            toast.error("Erreur suppression");
        }
    };

    const filteredContractors = contractors.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.jobType.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterType === "Tous" || c.jobType === filterType;
        return matchesSearch && matchesFilter;
    });

    const jobTypes = ["Tous", "Plomberie", "Électricité", "Serrurerie", "Chauffage", "Peinture", "Autre"];

    return (
        <div className="pr-2 pb-10">

            {/* PARTNER WIZARD */}
            <PartnerWizard open={isPartnerOpen} onOpenChange={setIsPartnerOpen} />

            {/* SEARCH BAR (kept discreetly) */}
            <div className="mb-6 sticky top-0 z-10 bg-zinc-50/95 backdrop-blur py-2">
                <div className="relative w-full max-w-md mx-auto">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Rechercher un artisan..."
                        className="pl-9 bg-white border-zinc-200 shadow-sm rounded-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* PROMO CARD (Restored) */}
                <Card className="col-span-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none shadow-lg overflow-hidden relative group cursor-pointer" onClick={() => setIsPartnerOpen(true)}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:opacity-10 transition-opacity"></div>
                    <CardContent className="p-8 flex items-center justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-indigo-200" />
                                <span className="font-bold text-indigo-100 text-sm tracking-widest uppercase">Transpareo Pro</span>
                            </div>
                            <h2 className="text-3xl font-black mb-2">Accédez aux meilleurs artisans.</h2>
                            <p className="text-indigo-100 max-w-xl">
                                Une sélection d'artisans vérifiés, notés par la communauté, avec des tarifs négociés.
                                Garantie "Satisfait ou Refait" incluse sur les interventions partenaires.
                            </p>
                        </div>
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-8 shadow-xl hidden md:flex transition-transform hover:scale-105" onClick={(e) => { e.stopPropagation(); setIsPartnerOpen(true); }}>
                            Devenir Partenaire
                        </Button>
                    </CardContent>
                </Card>

                {/* FILTERS */}
                <div className="col-span-full flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {jobTypes.map((filter, i) => (
                        <Button
                            key={i}
                            variant={filterType === filter ? "default" : "outline"}
                            onClick={() => setFilterType(filter)}
                            className={`rounded-full text-xs h-8 ${filterType === filter ? 'bg-zinc-900' : 'bg-white border-zinc-200'}`}
                        >
                            {filter}
                        </Button>
                    ))}
                </div>

                {/* CARDS */}
                {filteredContractors.map((pro) => (
                    <Card key={pro.id} className="bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all group relative">
                        {/* DELETE ACTION */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/80 backdrop-blur hover:bg-white rounded-full">
                                        <MoreVertical size={12} className="text-zinc-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-rose-600 focus:text-rose-600 text-xs" onClick={(e) => handleDelete(pro.id, e)}>
                                        <Trash2 className="mr-2 h-3 w-3" /> Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm bg-zinc-100 text-zinc-400">
                                        <AvatarFallback className="font-bold">
                                            {pro.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{pro.name}</h3>
                                        <p className="text-xs text-zinc-500 font-medium">{pro.jobType}</p>
                                    </div>
                                </div>
                                {pro.isVerified && (
                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 gap-1 text-[10px]">
                                        <ShieldCheck size={10} /> Vérifié
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-xs text-zinc-600">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-zinc-900">{pro.rating || "N/A"}</span>
                                    <span className="text-zinc-400">({pro.reviews || 0} avis)</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-600">
                                    <MapPin size={14} className="text-zinc-400" />
                                    <span className="truncate">{pro.location || "Localisation non spécifiée"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-600">
                                    <Clock size={14} className="text-zinc-400" />
                                    <span className={(pro.availability || "").includes('Immédiate') ? 'text-emerald-600 font-bold' : ''}>
                                        {pro.availability || "Sur RDV"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full text-xs border-zinc-200 hover:bg-zinc-50 h-9" asChild>
                                    <a href={`mailto:${pro.email}`}>
                                        <Mail size={14} className="mr-2 text-zinc-400" /> Devis
                                    </a>
                                </Button>
                                <Button className="w-full text-xs bg-zinc-900 hover:bg-zinc-800 h-9" asChild>
                                    <a href={`tel:${pro.phone}`}>
                                        <Phone size={14} className="mr-2" /> Appeler
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* ADD NEW CARD (Restored) */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Card className="bg-zinc-50 border-dashed border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center gap-2 min-h-[220px]">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                                <Plus size={24} className="text-zinc-400" />
                            </div>
                            <h3 className="font-bold text-zinc-600">Ajouter un artisan</h3>
                            <p className="text-xs text-zinc-400 max-w-[150px]">
                                Ajoutez vos propres contacts à votre carnet d'adresses.
                            </p>
                        </Card>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nouveau Contact</DialogTitle>
                            <DialogDescription>Ajoutez un artisan à votre carnet d'adresses personnel.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom / Entreprise</Label>
                                <Input id="name" placeholder="Ex: Plomberie Martin" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="job">Métier</Label>
                                <Select onValueChange={(v) => setNewItem({ ...newItem, jobType: v })} value={newItem.jobType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Plomberie">Plomberie</SelectItem>
                                        <SelectItem value="Électricité">Électricité</SelectItem>
                                        <SelectItem value="Serrurerie">Serrurerie</SelectItem>
                                        <SelectItem value="Chauffage">Chauffage</SelectItem>
                                        <SelectItem value="Peinture">Peinture</SelectItem>
                                        <SelectItem value="Autre">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input id="phone" placeholder="06..." value={newItem.phone} onChange={e => setNewItem({ ...newItem, phone: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="@..." value={newItem.email} onChange={e => setNewItem({ ...newItem, email: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAdd}>Enregistrer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}

