"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ShieldCheck, Mail, CheckCircle, Plus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { addGuarantor } from "@/lib/actions/dossier";

interface GuarantorManagerProps {
    guarantors: any[];
    dossierId: string;
}

export function GuarantorManager({ guarantors, dossierId }: GuarantorManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        relation: "FAMILY",
        monthlyIncome: ""
    });

    const handleSubmit = async () => {
        const res = await addGuarantor(dossierId, { ...formData, monthlyIncome: Number(formData.monthlyIncome) });
        if (res.success) {
            toast.success("Garant ajouté");
            setIsDialogOpen(false);
        } else {
            toast.error("Erreur");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-600" /> Vos Garants
                    </h2>
                    <p className="text-zinc-500">Un garant solide augmente vos chances de 50%.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-zinc-900 text-white shadow-lg shadow-zinc-900/20">
                            <Plus size={16} className="mr-2" /> Ajouter un Garant
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nouveau Garant</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nom complet (ou Organisme)</Label>
                                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Jean Martin ou Visale" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@garant.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Revenus Mensuels (€)</Label>
                                <Input type="number" value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: e.target.value})} placeholder="3000" />
                            </div>
                            <Button onClick={handleSubmit} className="w-full bg-zinc-900 text-white">Ajouter</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Official Organism Promo Card */}
                <div className="border border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Building2 size={24} />
                    </div>
                    <h3 className="font-bold text-zinc-900">Pas de garant physique ?</h3>
                    <p className="text-sm text-zinc-500 mt-2 mb-4">Utilisez des services certifiés comme Visale ou GarantMe.</p>
                    <Button variant="outline" size="sm">Découvrir les solutions</Button>
                </div>

                {/* Guarantor List */}
                {guarantors.map(g => (
                    <div key={g.id} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-lg">
                                {g.name.charAt(0)}
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle size={10} /> VALIDÉ
                            </div>
                        </div>

                        <h3 className="font-bold text-xl text-zinc-900 mb-1">{g.name}</h3>
                        <p className="text-sm text-zinc-500 flex items-center gap-2 mb-4">
                            <Mail size={12} /> {g.email}
                        </p>

                        <div className="bg-zinc-50 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-xs text-zinc-500 font-medium uppercase">Revenus</span>
                            <span className="font-bold text-zinc-900">{g.monthlyIncome} €</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

