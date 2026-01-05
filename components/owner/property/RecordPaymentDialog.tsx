"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordPayment } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Coins } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
    amount: z.coerce.number().min(1, "Montant invalide"),
    type: z.string(),
    date: z.date(),
});

interface RecordPaymentDialogProps {
    leaseId: string;
    tenantName: string;
    rentAmount?: number;
    trigger?: React.ReactNode;
}

export function RecordPaymentDialog({ leaseId, tenantName, rentAmount, trigger }: RecordPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: rentAmount || 0,
            type: "RENT",
            date: new Date(),
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const result = await recordPayment({
                leaseId,
                amount: values.amount,
                type: values.type,
                date: values.date
            });

            if (result.success) {
                toast.success("Paiement enregistré");
                setOpen(false);
                form.reset({ amount: rentAmount || 0, type: "RENT", date: new Date() });
                router.refresh();
            } else {
                toast.error("Erreur lors de l'enregistrement");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm">Enregistrer un paiement</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Encaisser un loyer</DialogTitle>
                    <DialogDescription>
                        Locataire : <span className="font-bold text-zinc-900">{tenantName}</span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Montant reçu (€)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                                            <Input type="number" step="0.01" className="pl-9 font-bold" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="RENT">Loyer mensuel</SelectItem>
                                            <SelectItem value="CHARGES">Régularisation charges</SelectItem>
                                            <SelectItem value="DEPOSIT">Dépôt de garantie</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date de réception</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                            <Button type="submit" className="bg-zinc-900" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Valider
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
