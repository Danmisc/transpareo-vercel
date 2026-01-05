"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createCollection } from "@/lib/bookmark-actions";

export function CreateCollectionDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isReadingList, setIsReadingList] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const type = isReadingList ? "READING_LIST" : "DEFAULT";
        const res = await createCollection(name, description, isPublic, type);
        if (res.success) {
            setOpen(false);
            setName("");
            setDescription("");
            setIsPublic(false);
            setIsReadingList(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle Collection
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Créer une collection</DialogTitle>
                    <DialogDescription>
                        Organisez vos sauvegardes avec des collections personnalisées.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Inspiration, Recettes..."
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optionnel)</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description courte..."
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isReadingList"
                            checked={isReadingList}
                            onChange={(e) => setIsReadingList(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="isReadingList" className="font-normal cursor-pointer">
                            Liste de Lecture (Suivi de progression)
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="isPublic" className="font-normal cursor-pointer">
                            Rendre cette collection publique
                        </Label>
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Création..." : "Créer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
