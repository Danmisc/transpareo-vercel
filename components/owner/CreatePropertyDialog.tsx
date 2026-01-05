"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Building2 } from "lucide-react";
import { createProperty } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
    title: z.string().min(2, "Le titre doit faire au moins 2 caractères"),
    address: z.string().min(5, "L'adresse est requise"),
    type: z.string().min(1, "Type de bien requis"),
    surface: z.coerce.number().min(9, "Surface minimum 9m²"),
    rent: z.coerce.number().min(0, "Loyer invalide"),
});

interface CreatePropertyDialogProps {
    trigger?: React.ReactNode;
}

export function CreatePropertyDialog({ trigger }: CreatePropertyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            address: "",
            type: "APARTMENT",
            surface: 0,
            rent: 0,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const result = await createProperty(values);
            if (result.success) {
                toast.success("Bien immobilier créé avec succès !");
                setOpen(false);
                form.reset();
                router.refresh(); // REFRESH DATA
            } else {
                toast.error("Erreur lors de la création");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg">
                        <Plus size={16} className="mr-2" /> Nouveau Bien
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <Building2 size={24} />
                        </div>
                        Ajouter un nouveau bien
                    </DialogTitle>
                    <DialogDescription>
                        Renseignez les informations principales de votre bien pour l'ajouter à votre portefeuille.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom du bien (ex: Appartement Paris 11)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="T2 Cosy - Centre Ville" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adresse complète</FormLabel>
                                    <FormControl>
                                        <Input placeholder="12 Rue de la Paix, 75002 Paris" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="APARTMENT">Appartement</SelectItem>
                                                <SelectItem value="HOUSE">Maison</SelectItem>
                                                <SelectItem value="STUDIO">Studio</SelectItem>
                                                <SelectItem value="PARKING">Parking / Box</SelectItem>
                                                <SelectItem value="COMMERCIAL">Local Commercial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="surface"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Surface (m²)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="rent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loyer Hors Charges Estimé (€)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Sert à calculer vos projections de revenus.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...
                                    </>
                                ) : (
                                    "Ajouter ce bien"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
