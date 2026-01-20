"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTicket } from "@/lib/actions-owner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
    description: z.string().min(10, "La description doit faire au moins 10 caractères"),
    priority: z.string(),
    category: z.string().optional(),
});

interface CreateTicketDialogProps {
    propertyId: string;
    propertyName?: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateTicketDialog({ propertyId, propertyName, trigger, open, onOpenChange }: CreateTicketDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "MEDIUM",
            category: "GENERAL",
        },
    });

    // Handle controlled/uncontrolled state
    const show = open !== undefined ? open : isOpen;
    const setShow = onOpenChange || setIsOpen;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const result = await createTicket({
                propertyId,
                title: values.title,
                description: values.description,
                priority: values.priority
            });

            if (result.success) {
                toast.success("Ticket créé avec succès");
                setShow(false);
                form.reset();
                router.refresh();
            } else {
                toast.error("Erreur lors de la création du ticket");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        }
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            <DialogTrigger asChild>
                {trigger || <Button>Créer un ticket</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Signaler un incident</DialogTitle>
                    <DialogDescription>
                        Créez un ticket pour suivre les travaux ou incidents sur {propertyName || "ce bien"}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Titre de l'incident</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Fuite d'eau SDB" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priorité</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une priorité" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="LOW">Basse</SelectItem>
                                            <SelectItem value="MEDIUM">Moyenne</SelectItem>
                                            <SelectItem value="HIGH">Haute</SelectItem>
                                            <SelectItem value="URGENT">Urgente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description détaillée</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Décrivez le problème, sa localisation..."
                                            className="resize-none h-24"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShow(false)}>Annuler</Button>
                            <Button type="submit" className="bg-zinc-900" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Créer le ticket
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

