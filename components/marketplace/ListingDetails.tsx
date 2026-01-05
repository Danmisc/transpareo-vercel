"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Maximize2, Video, ShoppingBag, CheckCircle2, ArrowLeft,
    TrendingUp, Sun, Shield, MapPin, Grid
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import ListingMap from "@/components/marketplace/ListingMap";
import { ListingImageGallery } from "./details/ListingImageGallery";
import { ListingHeader } from "./details/ListingHeader";
import { ListingSidebar } from "./details/ListingSidebar";
import ImageLightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface ListingDetailsProps {
    listing: {
        id: string;
        title: string;
        description: string;
        price: number;
        type: string;
        surface: number;
        rooms: number;
        address: string;
        latitude: number;
        longitude: number;
        energyClass?: string | null;
        dpeValue?: number | null;
        gesValue?: number | null;
        amenities?: string | null;
        // Technical
        bedrooms?: number | null;
        floor?: number | null;
        totalFloors?: number | null;
        isFurnished?: boolean | null;
        heatingType?: string | null;
        // Financials
        charges?: number | null;
        deposit?: number | null;
        availabilityDate?: Date | null;
        // Contact
        contactName?: string | null;
        contactPhone?: string | null;
        contactEmail?: string | null;
        images: { url: string }[];
        user: {
            id: string;
            name: string | null;
            image: string | null;
            role?: string;
        };
        virtualTourUrl?: string;
    };
    similarListings?: {
        id: string;
        title: string;
        price: number;
        surface: number;
        rooms: number;
        images: { url: string }[];
    }[];
}

export function ListingDetails({ listing, similarListings = [] }: ListingDetailsProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isLiveVisitOpen, setIsLiveVisitOpen] = useState(false);
    const [isSubmittingLive, setIsSubmittingLive] = useState(false);

    // Parse features
    const amenityList = listing.amenities ? listing.amenities.split(',') : [];
    const features = [
        ...(amenityList.map((a: string) => ({ icon: <CheckCircle2 size={18} />, label: a }))),
        listing.isFurnished !== null && { icon: <ShoppingBag size={18} />, label: listing.isFurnished ? "Meublé" : "Non meublé" },
        listing.floor && { icon: <TrendingUp size={18} />, label: `Étage ${listing.floor}${listing.totalFloors ? '/' + listing.totalFloors : ''}` },
        listing.heatingType && { icon: <Sun size={18} />, label: `Chauffage ${listing.heatingType === 'INDIVIDUAL' ? 'Indiv.' : 'Coll.'}` },
        listing.bedrooms && { icon: <Maximize2 size={18} />, label: `${listing.bedrooms} Chambres` },
    ].filter(Boolean) as { icon: any, label: string }[];

    const handleLiveVisitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmittingLive(true);
        // Simulate sending request
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Demande envoyée !", {
            description: "L'agent vous proposera 3 créneaux par email."
        });
        setIsLiveVisitOpen(false);
        setIsSubmittingLive(false);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col pt-6">

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 pb-20">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/marketplace">
                        <Button
                            variant="ghost"
                            className="pl-0 hover:bg-transparent hover:text-orange-600 transition-colors gap-2 text-zinc-500"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium text-lg">Retour à la recherche</span>
                        </Button>
                    </Link>
                </div>

                {/* 1. Header Section */}
                <ListingHeader listing={listing} />

                {/* 2. Image Gallery */}
                <ListingImageGallery images={listing.images} title={listing.title} />

                {/* 3. Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">

                    {/* LEFT COLUMN (Content) */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Host Info (Divider) */}
                        <div className="flex justify-between items-center py-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Proposé par {listing.contactName || listing.user?.name || "un propriétaire"}
                                </h2>
                                <p className="text-zinc-500 text-sm">
                                    {listing.user?.role === 'AGENCY' ? 'Agence Immobilière' : 'Particulier'} • {listing.type === 'RENT' ? 'Location' : 'Vente'}
                                </p>
                            </div>
                            <Avatar className="h-12 w-12 border border-zinc-100">
                                <AvatarImage src={listing.user?.image || undefined} />
                                <AvatarFallback>{(listing.contactName || listing.user?.name || "U").charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Top Highlights */}
                        <div className="py-6 border-b border-zinc-100 dark:border-zinc-800 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-4">
                                    <Shield size={24} className="text-zinc-900 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Dossier Facile</h3>
                                        <p className="text-zinc-500 text-sm">Postulez directement avec votre dossier complet en un clic.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin size={24} className="text-zinc-900 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Localisation idéale</h3>
                                        <p className="text-zinc-500 text-sm">95% des locataires récents ont noté 5 étoile la localisation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="py-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">À propos de ce logement</h2>
                            <div className={`relative ${!isDescriptionExpanded ? 'max-h-32 overflow-hidden' : ''}`}>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-base">
                                    {listing.description}
                                </p>
                                {!isDescriptionExpanded && (
                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent" />
                                )}
                            </div>
                            <Button
                                variant="link"
                                className="p-0 h-auto text-zinc-900 font-semibold underline decoration-zinc-300 underline-offset-4 mt-2"
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            >
                                {isDescriptionExpanded ? "Voir moins" : "En savoir plus"}
                            </Button>
                        </div>


                        {/* Amenities - Redesigned to Bubbles */}
                        <div className="py-8 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Ce que propose ce logement</h2>
                            <div className="flex flex-wrap gap-3">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-full border border-zinc-200 dark:border-zinc-700/50 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors cursor-default">
                                        <div className="text-orange-600 dark:text-orange-400 scale-90">
                                            {f.icon}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 capitalize">
                                            {f.label.toLowerCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Immersion (Virtual Tour) */}
                        <div className="py-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Visite Immersion</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 3D Tour Card */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative h-56 rounded-[1.5rem] overflow-hidden group cursor-pointer border border-zinc-200 dark:border-zinc-800">
                                            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Visite 3D" />
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white group-hover:bg-black/30 transition-colors">
                                                <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-3 group-hover:scale-110 transition-transform">
                                                    <Maximize2 size={32} />
                                                </div>
                                                <span className="font-bold text-lg">Visite 3D</span>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl h-[80vh] p-0 overflow-hidden bg-black border-none">
                                        <DialogTitle className="sr-only">Visite Virtuelle 3D</DialogTitle>
                                        {listing.virtualTourUrl ? (
                                            <iframe
                                                src={listing.virtualTourUrl}
                                                className="w-full h-full"
                                                allowFullScreen
                                                allow="xr-spatial-tracking"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-white">
                                                <p>Visite 3D non disponible pour le moment.</p>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>

                                {/* Live Visit Card */}
                                <Dialog open={isLiveVisitOpen} onOpenChange={setIsLiveVisitOpen}>
                                    <DialogTrigger asChild>
                                        <div className="relative h-56 rounded-[1.5rem] overflow-hidden group cursor-pointer border border-zinc-200 dark:border-zinc-800 bg-orange-950">
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/90 to-amber-900/90 flex flex-col items-center justify-center text-white p-6 text-center">
                                                <div className="bg-white/10 p-4 rounded-full backdrop-blur-md mb-3 group-hover:scale-110 transition-transform ring-1 ring-white/20">
                                                    <Video size={32} className="text-orange-300" />
                                                </div>
                                                <span className="font-bold text-lg mb-1">Visite Live</span>
                                                <p className="text-sm text-orange-200/80 mb-4">Visitez en visio avec le propriétaire.</p>
                                                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 border-none text-white rounded-full px-6 font-semibold shadow-lg shadow-orange-900/20">
                                                    Demander un créneau
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogTitle>Demander une visite live</DialogTitle>
                                        <form onSubmit={handleLiveVisitRequest} className="space-y-4 pt-4">
                                            <p className="text-sm text-zinc-500">
                                                L'agent vous fera visiter le bien en direct via WhatsApp ou FaceTime.
                                            </p>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Vos disponibilités</label>
                                                <input required type="text" placeholder="Ex: Lundi vers 18h..." className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Votre téléphone</label>
                                                <input required type="tel" placeholder="06..." className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800" />
                                            </div>
                                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmittingLive}>
                                                {isSubmittingLive ? "Envoi..." : "Envoyer"}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* ENERGY PERFORMANCE (DPE) - RESTORED */}
                        <div className="py-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Performance Énergétique</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* DPE Graph */}
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Consommation énergétique</p>
                                    <div className="space-y-1.5">
                                        {[
                                            { label: 'A', color: 'bg-green-500', width: 'w-16' },
                                            { label: 'B', color: 'bg-green-400', width: 'w-24' },
                                            { label: 'C', color: 'bg-lime-400', width: 'w-32' },
                                            { label: 'D', color: 'bg-yellow-400', width: 'w-40' },
                                            { label: 'E', color: 'bg-orange-400', width: 'w-48' },
                                            { label: 'F', color: 'bg-orange-600', width: 'w-56' },
                                            { label: 'G', color: 'bg-red-600', width: 'w-64' },
                                        ].map((grade) => {
                                            const isActive = listing.energyClass === grade.label || (!listing.energyClass && grade.label === 'C'); // Default to C for demo
                                            return (
                                                <div key={grade.label} className="flex items-center gap-2 group cursor-default">
                                                    <div className={`h-7 ${grade.width} ${grade.color} ${isActive ? 'shadow-md scale-[1.02]' : 'opacity-40 grayscale-[0.3]'} rounded-r-lg flex items-center px-3 text-white font-bold text-xs transition-all duration-300`}>
                                                        {grade.label}
                                                    </div>
                                                    {isActive && (
                                                        <div className="text-xs font-bold text-zinc-900 dark:text-white animate-in slide-in-from-left-2 fade-in">
                                                            {listing.dpeValue || 145} kWh/m²
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* GHG or Summary Box */}
                                <div>
                                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Bilan Carbone</p>
                                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center h-[200px]">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-3">
                                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">A</span>
                                        </div>
                                        <p className="text-zinc-900 dark:text-zinc-100 font-medium">Faible émission</p>
                                        <p className="text-xs text-zinc-500 mt-1">4 kg CO₂/m²/an</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Location */}
                        <div className="py-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Localisation</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-4">{listing.address}</p>
                            <ListingMap lat={listing.latitude} lng={listing.longitude} address={listing.address} />
                        </div>

                        {/* Similar Listings */}
                        {similarListings && similarListings.length > 0 && (
                            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Biens similaires à proximité</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {similarListings.map((item) => (
                                        <Link href={`/marketplace/${item.id}`} key={item.id} className="group cursor-pointer">
                                            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative">
                                                <img
                                                    src={item.images[0]?.url || "https://placehold.co/600x400?text=No+Image"}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    alt={item.title}
                                                />
                                                <Badge className="absolute top-2 left-2 bg-white/90 text-black">Exclusivité</Badge>
                                                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white font-bold">
                                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.price)}
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</h3>
                                            <div className="text-sm text-zinc-500 mt-1 flex gap-2">
                                                <span>{item.surface} m²</span>
                                                <span>•</span>
                                                <span>{item.rooms} pièces</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN (Sticky Sidebar) */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-24">
                            <ListingSidebar listing={listing} />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
