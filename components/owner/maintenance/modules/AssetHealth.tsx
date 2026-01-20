"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOwnerAssets, addAsset, deleteAsset } from "@/lib/actions-maintenance";
import { getOwnerProperties } from "@/lib/actions-owner";
import { toast } from "sonner";
import {
    Activity,
    Thermometer,
    Droplets,
    Home,
    Wind,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    History,
    Plus,
    Trash2,
    Zap,
    Loader2,
    Clock
} from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AssetHealth() {
    const [assets, setAssets] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Add Form State
    const [newAsset, setNewAsset] = useState({
        name: "",
        type: "Heating",
        installDate: "",
        lifespan: "15",
        propertyId: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [fetchedAssets, fetchedProps] = await Promise.all([
                getOwnerAssets(),
                getOwnerProperties()
            ]);
            setAssets(fetchedAssets || []);
            setProperties(fetchedProps || []);
        } catch (e) {
            console.error("Error loading assets", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAsset = async () => {
        if (!newAsset.name || !newAsset.propertyId || !newAsset.installDate) {
            toast.error("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        setIsSubmitting(true);
        try {
            await addAsset({
                name: newAsset.name,
                type: newAsset.type,
                installDate: new Date(newAsset.installDate),
                lifespan: parseInt(newAsset.lifespan),
                propertyId: newAsset.propertyId
            });
            toast.success("Équipement ajouté !");
            setIsAddOpen(false);
            setNewAsset({ name: "", type: "Heating", installDate: "", lifespan: "15", propertyId: "" });
            loadData();
        } catch (e) {
            toast.error("Erreur lors de l'ajout.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DELETE LOGIC ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

    const promptDelete = (id: string) => {
        setAssetToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!assetToDelete) return;
        try {
            await deleteAsset(assetToDelete);
            setAssets(prev => prev.filter(a => a.id !== assetToDelete));
            toast.success("Équipement supprimé");
        } catch (e) {
            toast.error("Erreur suppression");
        } finally {
            setDeleteDialogOpen(false);
            setAssetToDelete(null);
        }
    };

    // --- LOGIC & HELPERS ---

    const getIcon = (type: string) => {
        switch (type) {
            case 'Heating': return Thermometer;
            case 'Plumbing': return Droplets;
            case 'Structure': return Home;
            case 'Ventilation': return Wind;
            case 'Electric': return Zap;
            default: return Home;
        }
    };

    const getStatusColor = (score: number) => {
        if (score > 60) return 'bg-emerald-500';
        if (score > 30) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    // --- KPI CALCULATIONS ---
    const avgHealth = assets.length ? Math.round(assets.reduce((acc, curr) => acc + (curr.healthScore || 0), 0) / assets.length) : 0;
    const criticalCount = assets.filter(a => (a.healthScore || 0) < 30).length;
    const nextServiceCount = assets.filter(a => {
        if (!a.nextServiceDate) return false;
        const diff = new Date(a.nextServiceDate).getTime() - new Date().getTime();
        return diff < 1000 * 60 * 60 * 24 * 30; // within 30 days
    }).length;

    // AI Prediction: Find worst performing asset
    const worstAsset = [...assets].sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0))[0];

    // --- HISTORY LOGIC ---
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const openHistory = async (asset: any) => {
        setSelectedAsset(asset);
        setHistoryOpen(true);
        setLoadingHistory(true);
        try {
            const { getAssetHistory } = await import("@/lib/actions-maintenance");
            const events = await getAssetHistory(asset.id);
            setHistoryEvents(events);
        } catch (e) {
            console.error(e);
            toast.error("Impossible de charger l'historique");
        } finally {
            setLoadingHistory(false);
        }
    };

    if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" /></div>;

    return (
        <div className="h-full overflow-y-auto pr-2 pb-10 space-y-6 animate-in fade-in duration-500">

            {/* HEADER ACTIONS */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Activity size={20} className="text-indigo-600" />
                        Carnet de Santé
                    </h3>
                    <p className="text-sm text-zinc-500">Suivi temps réel de la vétusté.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-zinc-900 text-white hover:bg-zinc-800 gap-2">
                            <Plus size={16} /> Ajouter un équipement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Nouvel Équipement</DialogTitle>
                            <CardDescription>Ajoutez un appareil pour le suivi prédictif.</CardDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nom</Label>
                                <Input id="name" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} className="col-span-3" placeholder="Ex: Chaudière Gaz" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="prop" className="text-right">Bien</Label>
                                <Select onValueChange={v => setNewAsset({ ...newAsset, propertyId: v })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sélectionner un bien" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {properties.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <Select onValueChange={v => setNewAsset({ ...newAsset, type: v })} defaultValue="Heating">
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Heating">Chauffage</SelectItem>
                                        <SelectItem value="Plumbing">Plomberie</SelectItem>
                                        <SelectItem value="Electric">Électricité</SelectItem>
                                        <SelectItem value="Structure">Structure (Toit/Mur)</SelectItem>
                                        <SelectItem value="Ventilation">Ventilation</SelectItem>
                                        <SelectItem value="Appliance">Électroménager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Installé le</Label>
                                <Input id="date" type="date" value={newAsset.installDate} onChange={e => setNewAsset({ ...newAsset, installDate: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="life" className="text-right">Durée Vie</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input id="life" type="number" value={newAsset.lifespan} onChange={e => setNewAsset({ ...newAsset, lifespan: e.target.value })} />
                                    <span className="text-sm text-zinc-500">ans</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button disabled={isSubmitting} onClick={handleAddAsset}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* KPI OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-zinc-100 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-full ${avgHealth > 60 ? 'bg-emerald-50 text-emerald-600' : avgHealth > 30 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase">Santé Globale</p>
                            <p className="text-2xl font-black text-zinc-900">{avgHealth}%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-zinc-100 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase">Entretiens (30j)</p>
                            <p className="text-2xl font-black text-zinc-900">{nextServiceCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-zinc-100 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase">Critiques</p>
                            <p className="text-2xl font-black text-zinc-900">{criticalCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ASSET LIST */}
            <div className="grid grid-cols-1 gap-4">
                {assets.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-xl">
                        <p className="text-zinc-400 mb-4">Aucun équipement suivi.</p>
                        <Button variant="outline" onClick={() => setIsAddOpen(true)}>Ajouter mon premier équipement</Button>
                    </div>
                )}
                {assets.map((asset) => {
                    const Icon = getIcon(asset.type);
                    const health = asset.healthScore || 0;
                    return (
                        <Card key={asset.id} className="border-l-4 border-l-transparent hover:border-l-indigo-500 transition-all hover:shadow-md group">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                    {/* INFO */}
                                    <div className="flex items-start gap-4 min-w-[200px]">
                                        <div className={`p-3 rounded-xl bg-zinc-50 text-zinc-500`}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-zinc-900">{asset.name}</h4>
                                                {health < 30 && <Badge variant="destructive" className="text-[10px] h-5">Critique</Badge>}
                                                {health >= 30 && health < 60 && <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] h-5">À Surveiller</Badge>}
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-1">{asset.property?.name || "Bien Inconnu"} • {asset.type}</p>
                                        </div>
                                    </div>

                                    {/* HEALTH BAR */}
                                    <div className="flex-1 space-y-2 min-w-[200px]">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-500">Santé (Fin de vie: {new Date(asset.installDate).getFullYear() + (asset.lifespan || 10)})</span>
                                            <span className={`font-bold ${health < 30 ? 'text-rose-600' : 'text-zinc-700'}`}>{health}%</span>
                                        </div>
                                        <Progress value={health} className="h-2" indicatorClassName={getStatusColor(health)} />
                                    </div>

                                    {/* ACTIONS / SERVICE */}
                                    <div className="min-w-[180px] text-right space-y-3 flex flex-col items-end">
                                        <div className="text-xs">
                                            <span className="text-zinc-400 block mb-1">Entretien</span>
                                            {asset.nextServiceDate && new Date(asset.nextServiceDate) < new Date() ? (
                                                <span className="text-rose-600 font-bold flex items-center justify-end gap-1">
                                                    <AlertTriangle size={12} /> En Retard ({new Date(asset.nextServiceDate).toLocaleDateString()})
                                                </span>
                                            ) : (
                                                <span className="text-zinc-700 font-medium flex items-center justify-end gap-1">
                                                    <Clock size={12} className="text-zinc-400" /> {asset.nextServiceDate ? new Date(asset.nextServiceDate).toLocaleDateString() : 'Non prévu'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-50" onClick={() => promptDelete(asset.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => openHistory(asset)}>
                                                <History size={12} className="mr-2 text-zinc-400" />
                                                Historique
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* AI PREDICTION CARD (Conditional) */}
            {worstAsset && (worstAsset.healthScore || 0) < 40 && (
                <Card className="bg-indigo-50 border-indigo-100 animate-in slide-in-from-bottom-4">
                    <CardContent className="p-4 flex gap-4">
                        <div className="p-2 bg-white rounded-full h-fit text-indigo-600 shadow-sm">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900 text-sm">Conseil Prédictif IA</h4>
                            <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                                Votre <strong>{worstAsset.name}</strong> ({worstAsset.property?.name}) montre des signes de fatigue (Santé: {worstAsset.healthScore}%).
                                Sa fin de vie théorique est proche ({new Date(worstAsset.installDate).getFullYear() + (worstAsset.lifespan || 10)}).
                                Nous recommandons de demander un devis de remplacement maintenant pour éviter l'urgence.
                            </p>
                            <Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
                                Demander un devis (Gratuit)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* HISTORY DIALOG */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History size={18} className="text-zinc-500" />
                            Historique : {selectedAsset?.name}
                        </DialogTitle>
                        <CardDescription>Événements et interventions sur cet équipement.</CardDescription>
                    </DialogHeader>

                    <div className="py-6 max-h-[60vh] overflow-y-auto">
                        {loadingHistory ? (
                            <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-zinc-300" /></div>
                        ) : (
                            <ol className="relative border-l border-zinc-200 ml-3 space-y-8">
                                {historyEvents.map((event, i) => (
                                    <li key={i} className="mb-4 ml-6">
                                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white ${event.type === 'INSTALLATION' ? 'bg-indigo-100 ring-indigo-50' :
                                                event.type === 'PLANNED' ? 'bg-amber-100 ring-amber-50' : 'bg-green-100 ring-green-50'
                                            }`}>
                                            {event.type === 'INSTALLATION' && <Plus size={12} className="text-indigo-600" />}
                                            {event.type === 'PLANNED' && <Clock size={12} className="text-amber-600" />}
                                            {event.type === 'TICKET' && <CheckCircle2 size={12} className="text-green-600" />}
                                        </span>
                                        <h3 className="flex items-center mb-1 text-sm font-semibold text-zinc-900">
                                            {event.title}
                                            {event.type === 'PLANNED' && <Badge variant="outline" className="ml-2 text-[10px] text-amber-600 bg-amber-50 border-amber-200">À venir</Badge>}
                                        </h3>
                                        <time className="block mb-2 text-xs font-normal leading-none text-zinc-400">
                                            {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </time>
                                        <p className="mb-4 text-sm font-normal text-zinc-500">
                                            {event.description}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        )}
                        {!loadingHistory && historyEvents.length === 0 && (
                            <p className="text-center text-zinc-400 text-sm">Aucun historique disponible.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION DIALOG */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement cet équipement de votre suivi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}

