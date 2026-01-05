"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, Mail, Star, Quote, CheckCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { addRecommendation } from "@/lib/actions/dossier";

interface RecommendationManagerProps {
    userId: string;
    recommendations: any[];
}

export function RecommendationManager({ userId, recommendations }: RecommendationManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State (Simulating the external form filling by the landlord)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "LANDLORD",
        rating: 5,
        comment: ""
    });

    const handleSubmit = async () => {
        setIsLoading(true);
        // Simulate "Request" flow: User enters email -> Email sent -> Landlord clicks link -> Landlord fills form
        // Here we just add it directly for the demo
        const res = await addRecommendation(userId, formData);
        setIsLoading(false);

        if (res.success) {
            toast.success("Recommandation ajoutée !");
            setIsDialogOpen(false);
            setFormData({ name: "", email: "", role: "LANDLORD", rating: 5, comment: "" });
        } else {
            toast.error("Erreur lors de l'ajout");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900">Recommandations Vérifiées</h2>
                    <p className="text-zinc-500">La parole de vos anciens propriétaires vaut de l'or.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
                            <Mail className="mr-2 h-4 w-4" /> Demander une reco
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Demander une recommandation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
                                ℹ️ En situation réelle, nous envoyons un email sécurisé à votre propriétaire pour qu'il remplisse ce formulaire. Ici, simulez sa réponse.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nom du Propriétaire</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Jean Dupont" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="jean@immo.com" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Relation</Label>
                                <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LANDLORD">Propriétaire Particulier</SelectItem>
                                        <SelectItem value="AGENCY">Agence Immobilière</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Note Globale (Sérieux, Paiement, Soin)</Label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className={`p-1 transition-colors ${formData.rating >= star ? "text-yellow-400" : "text-zinc-200"}`}
                                        >
                                            <Star className="fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Commentaire</Label>
                                <Textarea
                                    value={formData.comment}
                                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                    placeholder="Locataire exemplaire, paiements toujours à l'heure..."
                                />
                            </div>

                            <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isLoading ? "Validation..." : "Valider la recommandation"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            {recommendations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-300">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                        <ThumbsUp size={32} />
                    </div>
                    <h3 className="font-medium text-zinc-900">Aucune recommandation pour le moment</h3>
                    <p className="text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
                        Invitez vos anciens propriétaires. 80% des dossiers avec une recommandation sont acceptés en priorité.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {recommendations.map(reco => (
                        <div key={reco.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                                <CheckCircle size={12} /> VÉRIFIÉ
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                    <Quote size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-lg text-zinc-900">{reco.authorName}</h4>
                                        <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-600 font-medium">
                                            {reco.authorRole === "LANDLORD" ? "Propriétaire" : "Agence"}
                                        </span>
                                    </div>
                                    <div className="flex text-yellow-400 mb-3">
                                        {Array.from({ length: reco.rating }).map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                                    </div>
                                    <p className="text-zinc-600 italic text-sm leading-relaxed">
                                        "{reco.comment}"
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center gap-4 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1"><UserCheck size={12} /> Identité vérifiée</span>
                                        <span className="flex items-center gap-1"><Mail size={12} /> Email professionnel</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
