"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    MapPin,
    Calculator,
    Calendar,
    Navigation,
    Maximize2,
    BedDouble,
    Bath,
    Square,
    Euro
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Dynamically import Leaflet components to avoid SSR issues
const Map = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet
// Must be done inside useEffect or client-side only context
export function LeafletFix() {
    const [mounted, setMounted] = useState(false);

    useMemo(async () => {
        if (typeof window !== 'undefined') {
            const L = (await import("leaflet")).default;
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        }
    }, []);
    return null;
}


interface SmartPropertyCardProps {
    price: string;
    location: string;
    surface: string;
    rooms: string;
    image?: string;
    coords?: [number, number]; // [lat, lng]
    id?: string;
}

export function SmartPropertyCard({
    price,
    location,
    surface,
    rooms,
    image,
    coords = [45.764043, 4.835659], // Default to Lyon
    id
}: SmartPropertyCardProps) {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [isVisitOpen, setIsVisitOpen] = useState(false);
    const router = useRouter();

    // Mortgage Calc State
    const priceNum = parseInt(price.replace(/[^0-9]/g, '')) || 0;
    const [downPayment, setDownPayment] = useState(priceNum * 0.2);
    const [years, setYears] = useState(25);
    const rate = 3.8; // Approx current rate

    const monthlyPayment = useMemo(() => {
        const principal = priceNum - downPayment;
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = years * 12;
        return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
    }, [priceNum, downPayment, years, rate]);

    const handleVisitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setIsVisitOpen(false);
        toast.success("Demande de visite envoyée !", {
            description: "Le propriétaire recevra vos coordonnées et vous recontactera."
        });
    };

    return (
        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md group">
            <LeafletFix />
            {/* HER IMAGE & PRICE TAG */}
            <div className="relative h-64 w-full overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={location}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <MapPin className="h-12 w-12 opacity-50" />
                    </div>
                )}

                <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-md shadow-sm text-sm font-bold px-3 py-1 hover:bg-white">
                        {price} €
                    </Badge>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{location}</span>
                    </h3>
                    <div className="flex gap-4 mt-2 text-zinc-200 text-xs font-medium">
                        <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5" /> {surface} m²</span>
                        <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {rooms} p.</span>
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="grid grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
                <button
                    onClick={() => router.push(`/marketplace?id=${id || ''}`)}
                    className="flex flex-col items-center justify-center py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors gap-1 text-zinc-600 dark:text-zinc-400"
                >
                    <MapPin className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Carte</span>
                </button>
                <button
                    onClick={() => setShowCalculator(true)}
                    className="flex flex-col items-center justify-center py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors gap-1 text-zinc-600 dark:text-zinc-400"
                >
                    <Calculator className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Simuler</span>
                </button>
                <button
                    onClick={() => setIsVisitOpen(true)}
                    className="flex flex-col items-center justify-center py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors gap-1 text-zinc-600 dark:text-zinc-400"
                >
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Visiter</span>
                </button>
                <button
                    onClick={() => {
                        if (coords) {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`, "_blank");
                        } else {
                            toast.error("Coordonnées non disponibles", {
                                description: "Impossible de calculer l'itinéraire pour ce bien."
                            });
                        }
                    }}
                    className="flex flex-col items-center justify-center py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors gap-1 text-zinc-600 dark:text-zinc-400"
                >
                    <Navigation className="h-4 w-4" />
                    <span className="text-[10px] font-medium">Itinéraire</span>
                </button>

            </div>

            {/* CALCULATOR DIALOG */}
            <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center text-center space-y-4 pt-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Calculator className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold">Simulateur de Prêt</DialogTitle>
                            <p className="text-sm text-muted-foreground">Estimez vos mensualités pour ce bien.</p>
                        </div>

                        <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl space-y-4 text-left">
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-zinc-500">Mensualité estimée</span>
                                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} €
                                    <span className="text-xs text-zinc-400 font-normal ml-1">/mois</span>
                                </span>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div>
                                    <div className="flex justify-between text-xs mb-2 text-zinc-500 font-medium">
                                        <span>Apport ({Math.round((downPayment / priceNum) * 100)}%)</span>
                                        <span className="text-zinc-900 dark:text-white">{downPayment.toLocaleString()} €</span>
                                    </div>
                                    <input
                                        type="range" min="0" max={priceNum} step="1000"
                                        value={downPayment}
                                        onChange={(e) => setDownPayment(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-2 text-zinc-500 font-medium">
                                        <span>Durée du prêt</span>
                                        <span className="text-zinc-900 dark:text-white">{years} ans</span>
                                    </div>
                                    <input
                                        type="range" min="7" max="30" step="1"
                                        value={years}
                                        onChange={(e) => setYears(Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                        <span>7 ans</span>
                                        <span>30 ans</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                    <div className="flex justify-between text-xs text-zinc-500">
                                        <span>Taux d'intérêt estimé</span>
                                        <span>{rate}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                        <span>Montant du prêt</span>
                                        <span>{(priceNum - downPayment).toLocaleString()} €</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full" onClick={() => setShowCalculator(false)}>
                            Fermer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* EXPANDABLE: CALCULATOR REMOVED - NOW IN DIALOG */}

            {/* MAP DIALOG - Untouched */}
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                {/* ... map content ... */}
                <DialogContent className="max-w-3xl h-[80vh] p-0 overflow-hidden" aria-describedby={undefined}>
                    <DialogTitle className="sr-only">Localisation du logement</DialogTitle>
                    <div className="relative w-full h-full">
                        <Map center={coords} zoom={13} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={coords}>
                                <Popup>
                                    <div className="text-xs font-bold">{location}</div>
                                    <div className="text-xs">{price} €</div>
                                </Popup>
                            </Marker>
                        </Map>
                        <div className="absolute top-4 left-4 z-[400] bg-white p-2 rounded-lg shadow-lg">
                            <h3 className="font-bold text-sm">{location}</h3>
                            <p className="text-xs text-zinc-500">{price} €</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* VISIT DIALOG - IMPROVED */}
            <Dialog open={isVisitOpen} onOpenChange={setIsVisitOpen}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center text-center space-y-4 pt-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold">Planifier une visite</DialogTitle>
                            <p className="text-sm text-muted-foreground">Remplissez ce formulaire pour être recontacté rapidement.</p>
                        </div>

                        <form onSubmit={handleVisitRequest} className="w-full space-y-4 text-left mt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Nom complet</label>
                                    <input required type="text" className="w-full p-2 rounded-md border text-sm bg-transparent" placeholder="Jean Dupont" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
                                    <input required type="tel" className="w-full p-2 rounded-md border text-sm bg-transparent" placeholder="06 12 34 56 78" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Email</label>
                                <input required type="email" className="w-full p-2 rounded-md border text-sm bg-transparent" placeholder="jean@example.com" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Disponibilités préférées</label>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" className="flex-1 text-xs h-8">Semaine</Button>
                                    <Button type="button" variant="outline" size="sm" className="flex-1 text-xs h-8">Soirée</Button>
                                    <Button type="button" variant="outline" size="sm" className="flex-1 text-xs h-8">Week-end</Button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Message</label>
                                <textarea
                                    className="w-full min-h-[60px] p-2 rounded-md border text-sm bg-transparent resize-none"
                                    placeholder="Disponibilités spécifiques, questions..."
                                />
                            </div>

                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                Confirmer la demande
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

