"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

interface MediaPreviewProps {
    mediaItems: { id: string; url: string; type: string }[];
}

export function MediaPreview({ mediaItems }: MediaPreviewProps) {
    if (!mediaItems || mediaItems.length === 0) return null;

    return (
        <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Photos</CardTitle>
                <Link href="#" className="text-xs text-primary hover:underline">Voir tout</Link>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-1 rounded-md overflow-hidden">
                    {mediaItems.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="aspect-square bg-muted relative">
                            {item.url ? (
                                <img src={item.url} alt="Media" className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <ImageIcon className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

