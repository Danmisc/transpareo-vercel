"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Check, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { connectExternalBank } from "@/lib/actions-banking-connect";

const BANKS = [
    { id: "revolut", name: "Revolut", logo: "R", color: "bg-black text-white" },
    { id: "bourso", name: "BoursoBank", logo: "B", color: "bg-pink-600 text-white" },
    { id: "bnp", name: "BNP Paribas", logo: "B", color: "bg-emerald-700 text-white" },
    { id: "ca", name: "Crédit Agricole", logo: "C", color: "bg-emerald-600 text-white" },
    { id: "sg", name: "Société Générale", logo: "SG", color: "bg-red-600 text-white" },
    { id: "qonto", name: "Qonto", logo: "Q", color: "bg-purple-600 text-white" },
];

export function ConnectBankModal({ children }: { children: React.ReactNode }) {
    const [step, setStep] = useState<"SEARCH" | "LOGIN" | "SYNC">("SEARCH");
    const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (bank: typeof BANKS[0]) => {
        setSelectedBank(bank);
        setStep("LOGIN");
    };

    const handleConnect = async () => {
        if (!username || !password) {
            toast.error("Identifiants requis");
            return;
        }
        setIsProcessing(true);

        // Simulate Authenticating with Bank
        await new Promise(r => setTimeout(r, 1500));

        setStep("SYNC");

        // Simulate Syncing Data
        try {
            await connectExternalBank(selectedBank!.id, selectedBank!.name);
            await new Promise(r => setTimeout(r, 2000)); // Fake heavy sync

            toast.success(`${selectedBank?.name} connecté avec succès !`);
            setIsOpen(false);
            setStep("SEARCH");
            setUsername("");
            setPassword("");
        } catch (err) {
            toast.error("Échec de la connexion bancaire");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 rounded-[24px] h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-zinc-500" />
                        Connecter une banque
                    </DialogTitle>
                </DialogHeader>

                {step === "SEARCH" && (
                    <div className="flex-1 overflow-y-auto p-1 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
                            <Input placeholder="Rechercher (ex: Revolut)" className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Banques Populaires</p>
                            <div className="grid grid-cols-2 gap-3">
                                {BANKS.map(bank => (
                                    <button
                                        key={bank.id}
                                        onClick={() => handleSelect(bank)}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${bank.color}`}>
                                            {bank.logo}
                                        </div>
                                        <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200">{bank.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 items-start mt-4">
                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                La connexion est chiffrée de bout en bout. Vos identifiants ne sont jamais stockés par Transpareo. Nous utilisons une agrégation bancaire régulée DSP2.
                            </p>
                        </div>
                    </div>
                )}

                {step === "LOGIN" && selectedBank && (
                    <div className="flex-1 flex flex-col justify-center space-y-6 px-4">
                        <div className="text-center space-y-2">
                            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold shadow-xl ${selectedBank.color}`}>
                                {selectedBank.logo}
                            </div>
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Connexion à {selectedBank.name}</h3>
                            <p className="text-sm text-zinc-500">Entrez vos identifiants client</p>
                        </div>

                        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500">Identifiant Client</label>
                                <Input
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="12345678"
                                    className="bg-white dark:bg-zinc-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500">Code Secret</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="bg-white dark:bg-zinc-950"
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-base font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl"
                            onClick={handleConnect}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : "Connexion Sécurisée"}
                        </Button>

                        <button onClick={() => setStep("SEARCH")} className="text-sm text-zinc-500 hover:underline">
                            Choisir une autre banque
                        </button>
                    </div>
                )}

                {step === "SYNC" && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                            <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-black">
                                <Lock size={12} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Synchronisation...</h3>
                            <p className="text-zinc-500 text-sm max-w-[250px] mx-auto">
                                Nous récupérons vos comptes et transactions de {selectedBank?.name}. Cela peut prendre quelques secondes.
                            </p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
