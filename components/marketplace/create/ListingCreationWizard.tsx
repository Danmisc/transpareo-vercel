"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createListing } from "@/lib/actions/marketplace";
import { useSession } from "next-auth/react";

// Steps Components
import StepLocation from "./steps/StepLocation";
import StepType from "./steps/StepType";
import StepDetails from "./steps/StepDetails";
import StepMedia from "./steps/StepMedia";
import StepDescription from "./steps/StepDescription";
import StepRecap from "./steps/StepRecap";
import StepEnergy from "./steps/StepEnergy";
import StepContact from "./steps/StepContact";

export type ListingFormData = {
    type: "RENT" | "SALE";
    propertyType: "APARTMENT" | "HOUSE" | "STUDIO" | "ROOM" | "PARKING";
    address: string;
    latitude: number;
    longitude: number;
    surface: number;
    rooms: number;
    bedrooms: number;
    floor: number;
    totalFloors: number;
    isFurnished: boolean;
    heatingType: "INDIVIDUAL" | "COLLECTIVE" | "";
    amenities: string[];
    energyClass: string;
    dpeValue: number;
    gesValue: number;
    images: string[];
    virtualTourUrl: string;
    description: string;
    title: string;
    price: number;
    charges: number;
    deposit: number;
    availabilityDate: Date | null;
    // Contact
    contactName: string;
    contactPhone: string;
    contactEmail: string;
};

const INITIAL_DATA: ListingFormData = {
    type: "RENT",
    propertyType: "APARTMENT",
    address: "",
    latitude: 0,
    longitude: 0,
    surface: 0,
    rooms: 1,
    bedrooms: 0,
    floor: 0,
    totalFloors: 0,
    isFurnished: false,
    heatingType: "",
    amenities: [],
    energyClass: "",
    dpeValue: 0,
    gesValue: 0,
    images: [],
    virtualTourUrl: "",
    description: "",
    title: "",
    price: 0,
    charges: 0,
    deposit: 0,
    availabilityDate: null,
    contactName: "",
    contactPhone: "",
    contactEmail: ""
};

export function ListingCreationWizard() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ListingFormData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = 8;
    const progress = (step / totalSteps) * 100;

    const updateData = (data: Partial<ListingFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        if (!session?.user?.id) return;
        setIsSubmitting(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                price: formData.price,
                surface: formData.surface,
                rooms: formData.rooms,
                // New Fields
                bedrooms: formData.bedrooms,
                type: formData.type,
                propertyType: formData.propertyType,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
                images: formData.images,
                virtualTourUrl: formData.virtualTourUrl,
                amenities: formData.amenities,
                // Technical
                isFurnished: formData.isFurnished,
                floor: formData.floor,
                totalFloors: formData.totalFloors,
                heatingType: formData.heatingType,
                // Energy
                energyClass: formData.energyClass,
                dpeValue: formData.dpeValue,
                gesValue: formData.gesValue,
                // Financials
                charges: formData.charges,
                deposit: formData.deposit,
                // Contact
                contactName: formData.contactName,
                contactPhone: formData.contactPhone,
                contactEmail: formData.contactEmail,
            };

            const result = await createListing(payload, session.user.id);

            if (result.success) {
                toast.success("Annonce publiée avec succès !");
                router.push(`/marketplace/${result.data.id}`);
            } else {
                toast.error("Erreur lors de la publication : " + result.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur inattendue est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Header Wizard */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 text-zinc-500">
                        <ArrowLeft size={16} />
                        {step === 1 ? "Quitter" : "Retour"}
                    </Button>
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                            Étape {step} sur {totalSteps}
                        </span>
                        <div className="h-1 w-32 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <div className="w-20" /> {/* Spacer for centering */}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

                {step === 1 && <StepType data={formData} update={updateData} onNext={handleNext} />}
                {step === 2 && <StepLocation data={formData} update={updateData} onNext={handleNext} />}
                {step === 3 && <StepDetails data={formData} update={updateData} onNext={handleNext} />}
                {step === 4 && <StepEnergy data={formData} update={updateData} onNext={handleNext} />}
                {step === 5 && <StepMedia data={formData} update={updateData} onNext={handleNext} />}
                {step === 6 && <StepDescription data={formData} update={updateData} onNext={handleNext} />}
                {step === 7 && <StepContact data={formData} update={updateData} onNext={handleNext} />}
                {step === 8 && <StepRecap data={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}

            </div>
        </div>
    );
}
