"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CatAvatar, CatTraits, DEFAULT_CAT_TRAITS } from "./CatAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Save, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";

interface AvatarBuilderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (avatarUrl: string) => void;
}

export function AvatarBuilderDialog({ isOpen, onClose, onSave }: AvatarBuilderDialogProps) {
    const [traits, setTraits] = useState<CatTraits>(DEFAULT_CAT_TRAITS);
    const avatarRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate high-quality image data URL
    const generateImage = async (scale = 2) => {
        if (!avatarRef.current) return null;
        try {
            const canvas = await html2canvas(avatarRef.current, {
                backgroundColor: null,
                scale: scale,
                logging: false,
                useCORS: true
            });
            return canvas.toDataURL("image/png");
        } catch (error) {
            console.error("Failed to generate avatar", error);
            return null;
        }
    };

    const handleSave = async () => {
        setIsGenerating(true);
        const url = await generateImage(2);
        if (url) {
            onSave(url);
            onClose();
        }
        setIsGenerating(false);
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        const url = await generateImage(4);
        if (url) {
            const link = document.createElement("a");
            link.href = url;
            link.download = `mon-avatar-chat-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setIsGenerating(false);
    };

    const randomize = () => {
        const bg: CatTraits['background'][] = ["blue", "green", "orange", "purple", "yellow", "zinc", "galaxy", "forest", "sunset", "disco", "cherry", "sky"];
        const skins: CatTraits['skin'][] = ["orange", "black", "white", "grey", "tabby", "siamese", "calico", "tuxedo"];
        const eyes: CatTraits['eyes'][] = ["normal", "happy", "cool", "winking", "surprised", "sleepy", "starry"];
        const mouths: CatTraits['mouth'][] = ["smile", "toungue", "neutral", "open", "frown"];
        const clothes: CatTraits['clothing'][] = ["none", "suit", "hoodie", "shirt", "bowtie", "kimono", "space_suit", "ninja", "wizard", "pirate", "overalls", "dress"];
        const hats: CatTraits['hat'][] = ["none", "cap", "party", "headphones", "crown", "helmet", "wizard_hat", "pirate_hat", "viking", "beret", "flower"];
        const accs: CatTraits['accessory'][] = ["none", "glasses", "scarf", "laptop", "eyepatch", "monocle", "gold_chain", "mask"];

        setTraits({
            background: bg[Math.floor(Math.random() * bg.length)],
            skin: skins[Math.floor(Math.random() * skins.length)],
            eyes: eyes[Math.floor(Math.random() * eyes.length)],
            mouth: mouths[Math.floor(Math.random() * mouths.length)],
            clothing: clothes[Math.floor(Math.random() * clothes.length)],
            hat: hats[Math.floor(Math.random() * hats.length)],
            accessory: accs[Math.floor(Math.random() * accs.length)],
        });
    };

    const CategoryTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3 mt-1">
            {Icon && <Icon className="w-3 h-3" />} {children}
        </h4>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[900px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col md:flex-row bg-background rounded-2xl shadow-2xl border-2">

                {/* LEFT: PREVIEW & ACTIONS */}
                <div className="md:w-[350px] bg-zinc-100/50 dark:bg-zinc-900/50 flex flex-col border-r relative flex-shrink-0">
                    <div className="md:hidden p-4 border-b flex justify-between items-center bg-background">
                        <span className="font-bold">Studio Avatar</span>
                        <Button size="icon" variant="ghost" onClick={onClose}>X</Button>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-dot-pattern min-h-[200px]">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="relative z-10 animate-in zoom-in-50 duration-500">
                            <div
                                ref={avatarRef}
                                className="relative rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                <CatAvatar traits={traits} size={280} />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t bg-background/50 backdrop-blur-sm space-y-4">
                        <div className="flex gap-2">
                            <Button onClick={randomize} variant="outline" className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors group">
                                <Sparkles className="w-4 h-4 mr-2 group-hover:text-amber-500 transition-colors" /> Aléatoire
                            </Button>
                            <Button onClick={handleDownload} variant="outline" size="icon" title="Télécharger">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button size="lg" className="w-full font-semibold shadow-lg shadow-primary/20" onClick={handleSave} disabled={isGenerating}>
                            {isGenerating ? "Traitement..." : (
                                <><Save className="w-4 h-4 mr-2" /> Utiliser cet Avatar</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* RIGHT: CUSTOMIZATION CONTROLS */}
                <div className="flex-1 flex flex-col bg-background h-full overflow-hidden min-w-0 min-h-0">
                    <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-primary" />
                            Personnalisation
                        </h2>
                    </div>

                    <Tabs defaultValue="appearance" className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="px-4 border-b bg-muted/20 flex-shrink-0">
                            <TabsList className="bg-transparent w-full justify-start gap-6 h-12 p-0 rounded-none overflow-x-auto scrollbar-none">
                                <TabTrigger value="appearance">Apparence</TabTrigger>
                                <TabTrigger value="style">Style</TabTrigger>
                                <TabTrigger value="background">Ambiance</TabTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/20 min-h-0">

                            {/* TAB 1: APPEARANCE */}
                            <TabsContent value="appearance" className="space-y-8 m-0 outline-none animate-in slide-in-from-right-2 duration-300">
                                <div className="space-y-3">
                                    <CategoryTitle>Couleur & Motif</CategoryTitle>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { id: "orange", label: "Roux" }, { id: "black", label: "Noir" },
                                            { id: "white", label: "Blanc" }, { id: "grey", label: "Gris" },
                                            { id: "tabby", label: "Tigré" }, { id: "siamese", label: "Siamois" },
                                            { id: "calico", label: "Calico" }, { id: "tuxedo", label: "Tuxedo" }
                                        ].map((item) => (
                                            <ColorButton
                                                key={item.id}
                                                color={
                                                    item.id === 'orange' ? '#fb923c' : item.id === 'black' ? '#333' :
                                                        item.id === 'white' ? '#fff' : item.id === 'grey' ? '#9ca3af' :
                                                            item.id === 'tabby' ? '#D6C0B0' : item.id === 'siamese' ? '#F5F5DC' :
                                                                item.id === 'calico' ? '#ffffff' : '#222'
                                                }
                                                active={traits.skin === item.id}
                                                onClick={() => setTraits({ ...traits, skin: item.id as any })}
                                                label={item.label}
                                                preview={(
                                                    ['calico', 'tuxedo', 'tabby', 'siamese'].includes(item.id)
                                                        ? <SkinPreview id={item.id} />
                                                        : null
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <CategoryTitle>Yeux</CategoryTitle>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {[
                                            { id: "normal", label: "Normal" }, { id: "happy", label: "Joyeux" },
                                            { id: "cool", label: "Cool" }, { id: "winking", label: "Clin d'œil" },
                                            { id: "surprised", label: "Surpris" }, { id: "sleepy", label: "Dormeur" },
                                            { id: "starry", label: "Étoiles" }
                                        ].map((item) => (
                                            <OptionButton
                                                key={item.id}
                                                active={traits.eyes === item.id}
                                                onClick={() => setTraits({ ...traits, eyes: item.id as any })}
                                            >
                                                {item.label}
                                            </OptionButton>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <CategoryTitle>Bouche</CategoryTitle>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {[
                                            { id: "smile", label: "Sourire" }, { id: "toungue", label: "Langue" },
                                            { id: "neutral", label: "Neutre" }, { id: "open", label: "Ouvert" },
                                            { id: "frown", label: "Triste" }
                                        ].map((item) => (
                                            <OptionButton
                                                key={item.id}
                                                active={traits.mouth === item.id}
                                                onClick={() => setTraits({ ...traits, mouth: item.id as any })}
                                            >
                                                {item.label}
                                            </OptionButton>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB 2: STYLE */}
                            <TabsContent value="style" className="space-y-8 m-0 outline-none animate-in slide-in-from-right-2 duration-300">
                                <div className="space-y-3">
                                    <CategoryTitle>Vêtements</CategoryTitle>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: "none", label: "Aucun" }, { id: "suit", label: "Costume" },
                                            { id: "hoodie", label: "Sweat" }, { id: "shirt", label: "T-Shirt" },
                                            { id: "bowtie", label: "Nœud Pap" }, { id: "kimono", label: "Kimono" },
                                            { id: "space_suit", label: "Espace" }, { id: "ninja", label: "Ninja" },
                                            { id: "wizard", label: "Sorcier" }, { id: "pirate", label: "Pirate" },
                                            { id: "overalls", label: "Salopette" }, { id: "dress", label: "Robe" }
                                        ].map((item) => (
                                            <OptionButton
                                                key={item.id}
                                                active={traits.clothing === item.id}
                                                onClick={() => setTraits({ ...traits, clothing: item.id as any })}
                                            >
                                                {item.label}
                                            </OptionButton>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <CategoryTitle>Chapeaux</CategoryTitle>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: "none", label: "Aucun" }, { id: "cap", label: "Casquette" },
                                            { id: "party", label: "Fête" }, { id: "headphones", label: "Casque" },
                                            { id: "crown", label: "Couronne" }, { id: "helmet", label: "Astronaute" },
                                            { id: "wizard_hat", label: "Chapeau Sorcier" }, { id: "pirate_hat", label: "Tricorne" },
                                            { id: "viking", label: "Viking" }, { id: "beret", label: "Béret" },
                                            { id: "flower", label: "Fleur" }
                                        ].map((item) => (
                                            <OptionButton
                                                key={item.id}
                                                active={traits.hat === item.id}
                                                onClick={() => setTraits({ ...traits, hat: item.id as any })}
                                            >
                                                {item.label}
                                            </OptionButton>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <CategoryTitle>Accessoires</CategoryTitle>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: "none", label: "Aucun" }, { id: "glasses", label: "Lunettes" },
                                            { id: "scarf", label: "Écharpe" }, { id: "laptop", label: "Ordi" },
                                            { id: "eyepatch", label: "Cache-œil" }, { id: "monocle", label: "Monocle" },
                                            { id: "gold_chain", label: "Chaîne Or" }, { id: "mask", label: "Masque" }
                                        ].map((item) => (
                                            <OptionButton
                                                key={item.id}
                                                active={traits.accessory === item.id}
                                                onClick={() => setTraits({ ...traits, accessory: item.id as any })}
                                            >
                                                {item.label}
                                            </OptionButton>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB 3: BACKGROUND */}
                            <TabsContent value="background" className="space-y-8 m-0 outline-none animate-in slide-in-from-right-2 duration-300">
                                <div className="space-y-3">
                                    <CategoryTitle>Couleur</CategoryTitle>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {[
                                            { id: "blue", label: "Bleu", color: "var(--blue-100)", hex: "#dbeafe" },
                                            { id: "green", label: "Vert", color: "var(--green-100)", hex: "#dcfce7" },
                                            { id: "orange", label: "Orange", color: "var(--orange-100)", hex: "#ffedd5" },
                                            { id: "purple", label: "Violet", color: "var(--purple-100)", hex: "#f3e8ff" },
                                            { id: "yellow", label: "Jaune", color: "var(--yellow-100)", hex: "#fef9c3" },
                                            { id: "zinc", label: "Gris", color: "var(--zinc-100)", hex: "#f4f4f5" },
                                            { id: "cherry", label: "Cerise", color: "#FCE7F3", hex: "#FCE7F3" },
                                            { id: "sky", label: "Ciel", color: "#BAE6FD", hex: "#BAE6FD" },
                                            { id: "galaxy", label: "Galaxie", color: "#312e81", hex: "#312e81" },
                                            { id: "forest", label: "Forêt", color: "#14532D", hex: "#14532D" },
                                            { id: "sunset", label: "Sunset", color: "#C2410C", hex: "#C2410C" },
                                            { id: "disco", label: "Disco", color: "#831843", hex: "#831843" },
                                        ].map((item) => (
                                            <ColorButton
                                                key={item.id}
                                                color={item.color}
                                                hex={item.hex}
                                                active={traits.background === item.id}
                                                onClick={() => setTraits({ ...traits, background: item.id as any })}
                                                label={item.label}
                                                className={cn("h-16 w-full rounded-xl",
                                                    ['galaxy', 'forest', 'sunset', 'disco'].includes(item.id) ? "text-white" : ""
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- SUBCOMPONENTS ---

function TabTrigger({ value, children }: { value: string, children: React.ReactNode }) {
    return (
        <TabsTrigger
            value={value}
            className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-0 pt-0 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
        >
            {children}
        </TabsTrigger>
    );
}

function OptionButton({ active, onClick, children, className }: { active: boolean, onClick: () => void, children: React.ReactNode, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "h-10 px-3 rounded-md border text-sm font-medium transition-all hover:border-primary/50 hover:bg-accent capitalize truncate",
                active ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20" : "bg-background border-input",
                className
            )}
        >
            {children}
        </button>
    );
}

// Helper to get skin preview
function SkinPreview({ id }: { id: string }) {
    if (id === 'calico') {
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full bg-white">
                <defs>
                    <pattern id="calico-pat" x="0" y="0" width="1" height="1">
                        <circle cx="30" cy="30" r="35" fill="#1F2937" />
                        <circle cx="70" cy="80" r="30" fill="#EA580C" />
                        <circle cx="85" cy="20" r="20" fill="#EA580C" opacity="0.9" />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#calico-pat)" />
            </svg>
        );
    }
    if (id === 'tuxedo') {
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full bg-[#1F2937]">
                <path d="M50 0 L0 0 L0 100 L100 100 L100 0 L50 0 Z" fill="#1F2937" />
                <path d="M50 100 L20 40 Q50 10 80 40 Z" fill="white" />
            </svg>
        );
    }
    if (id === 'tabby') {
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full bg-[#D6C0B0]">
                <g transform="rotate(20 50 50)">
                    <rect x="0" y="20" width="120" height="15" fill="#8D6E63" opacity="0.8" />
                    <rect x="0" y="60" width="120" height="15" fill="#8D6E63" opacity="0.8" />
                </g>
            </svg>
        );
    }
    if (id === 'siamese') {
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full bg-[#F5F5DC]">
                <circle cx="50" cy="50" r="40" fill="url(#siamese-grad)" />
                <defs>
                    <radialGradient id="siamese-grad">
                        <stop offset="0%" stopColor="#4B3621" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#F5F5DC" stopOpacity="0" />
                    </radialGradient>
                </defs>
            </svg>
        );
    }
    return null;
}

function ColorButton({ active, onClick, color, label, className, hex, preview }: { active: boolean, onClick: () => void, color: string, label: string, className?: string, hex?: string, preview?: React.ReactNode }) {
    // If it's a background selection (uses h-16), keep the old "full fill" style but ensure text contrast
    if (className?.includes("h-16")) {
        return (
            <button
                onClick={onClick}
                className={cn(
                    "flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 relative overflow-hidden",
                    active ? "border-primary ring-2 ring-primary/20 ring-offset-2" : "border-transparent ring-1 ring-border",
                    className
                )}
                style={{ backgroundColor: hex || color }}
            >
                <span className={cn("text-xs font-bold capitalize truncate w-full text-center relative z-10", className?.includes("text-white") ? "text-white" : "text-foreground")}>{label}</span>
            </button>
        );
    }

    // Default "Swatch" style for skins/colors
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-3 p-3 rounded-xl border bg-card transition-all hover:bg-accent/50 active:scale-95 group",
                active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-input hover:border-primary/50",
                className
            )}
        >
            <div className="relative">
                <div
                    className={cn(
                        "w-12 h-12 rounded-full shadow-sm overflow-hidden border-2 border-white dark:border-zinc-800 transition-transform group-hover:scale-110",
                        active && "border-primary"
                    )}
                    style={!preview ? { backgroundColor: hex || color } : {}}
                >
                    {preview}
                </div>
                {active && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-background">
                        ✓
                    </div>
                )}
            </div>
            <span className="text-xs font-semibold capitalize truncate w-full text-center text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
        </button>
    );
}
