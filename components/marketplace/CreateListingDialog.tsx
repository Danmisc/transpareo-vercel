"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface CreateListingDialogProps {
    onSuccess?: () => void;
}

export function CreateListingDialog({ onSuccess }: CreateListingDialogProps) {
    return (
        <Link href="/marketplace/create">
            <Button variant="default" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white gap-2 rounded-full shadow-md transition-all hover:scale-105">
                <Plus size={16} /> Publier
            </Button>
        </Link>
    );
}

