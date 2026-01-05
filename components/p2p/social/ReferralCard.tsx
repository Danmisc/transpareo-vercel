"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, Sparkles } from "lucide-react";
import { generateReferralCode } from "@/lib/actions-p2p-social";
import { toast } from "sonner";

interface ReferralCardProps {
    initialCode?: string | null;
}

export function ReferralCard({ initialCode }: ReferralCardProps) {
    const [code, setCode] = useState(initialCode);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const res = await generateReferralCode();
            setCode(res.code);
            toast.success("Code généré avec succès !");
        } catch (error) {
            toast.error("Erreur lors de la génération du code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(`https://transpareo.com/register?ref=${code}`); // Mock URL
        setHasCopied(true);
        toast.success("Lien copié !");
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Sparkles size={20} className="text-yellow-300" />
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">Beta</Badge>
                </div>
                <CardTitle className="text-2xl font-bold">Invitez vos proches</CardTitle>
                <CardDescription className="text-indigo-100">
                    Gagnez +10 points de confiance pour chaque ami vérifié. Construisez votre cercle de confiance.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {code ? (
                    <div className="space-y-4">
                        <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 flex items-center justify-between border border-white/10">
                            <code className="text-xl font-mono font-bold tracking-widest">{code}</code>
                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={handleCopy}>
                                {hasCopied ? <Check size={18} /> : <Copy size={18} />}
                            </Button>
                        </div>
                        <p className="text-xs text-indigo-200 text-center">Partagez ce code pour lier vos comptes.</p>
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="bg-white text-indigo-700 hover:bg-indigo-50 w-full font-bold shadow-lg"
                        >
                            {isLoading ? "Génération..." : "Générer mon Code Unique"}
                        </Button>
                    </div>
                )}
            </CardContent>

            {code && (
                <CardFooter>
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                        <Share2 size={16} className="mr-2" /> Partager le lien
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

// Helper badge component since we are inside a file
function Badge({ children, className, variant }: any) {
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${className}`}>{children}</span>
}
