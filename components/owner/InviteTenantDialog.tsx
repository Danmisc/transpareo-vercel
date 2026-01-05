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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Users, Mail, ArrowRight } from "lucide-react";
import { inviteTenant } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    rentAmount: z.coerce.number().min(1, "Loyer requis"),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Date invalide",
    }),
});

interface InviteTenantDialogProps {
    propertyId: string;
    propertyName: string;
    suggestedRent?: number;
    trigger?: React.ReactNode;
}

export function InviteTenantDialog({ propertyId, propertyName, suggestedRent, trigger }: InviteTenantDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            rentAmount: suggestedRent || 0,
            startDate: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const result = await inviteTenant({
                propertyId,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                rentAmount: values.rentAmount,
                startDate: new Date(values.startDate),
            });

            if (result.success) {
                toast.success("Locataire associé avec succès !");
                setOpen(false);
                form.reset();
                router.refresh();
            } else {
                toast.error("Erreur lors de l'ajout");
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
                    <Button size="sm" variant="link" className="text-red-600 h-auto p-0 text-xs font-bold">
                        Candidats <ArrowRight size={10} className="ml-1" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <Users size={24} />
                        </div>
                        Ajouter un locataire
                    </DialogTitle>
                    <DialogDescription>
                        Pour le bien : <strong>{propertyName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prénom</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jean" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dupont" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email du locataire</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                                            <Input placeholder="jean.dupont@email.com" className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="rentAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loyer (€/mois)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Début du bail</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ajout...
                                    </>
                                ) : (
                                    "Valider le locataire"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
