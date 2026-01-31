"use client";

import React from "react";
import { FileText, Download, ExternalLink, Video, FolderOpen, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Resource {
    id: string;
    title: string;
    description: string;
    type: "PDF" | "VIDEO" | "LINK" | "ARCHIVE";
    url: string;
    category: string;
    downloads?: number;
    fileSize?: string;
    date: string;
}

interface CommunityResourcesTabProps {
    resources: Resource[];
    isAdmin?: boolean;
}

export function CommunityResourcesTab({ resources, isAdmin }: CommunityResourcesTabProps) {
    // Group resources by category
    const groupedResources = resources.reduce((acc, resource) => {
        if (!acc[resource.category]) {
            acc[resource.category] = [];
        }
        acc[resource.category].push(resource);
        return acc;
    }, {} as Record<string, Resource[]>);

    const categories = Object.keys(groupedResources);

    const getIcon = (type: Resource["type"]) => {
        switch (type) {
            case "PDF": return <FileText className="w-5 h-5 text-red-500" />;
            case "VIDEO": return <Video className="w-5 h-5 text-blue-500" />;
            case "ARCHIVE": return <Archive className="w-5 h-5 text-amber-500" />;
            case "LINK": return <ExternalLink className="w-5 h-5 text-green-500" />;
            default: return <FileText className="w-5 h-5 text-zinc-500" />;
        }
    };

    if (resources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                    <FolderOpen className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucune ressource disponible</h3>
                <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                    Les administrateurs n'ont pas encore partagé de fichiers ou de liens dans cette communauté.
                </p>
                {isAdmin && (
                    <Button>Ajouter une ressource</Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {categories.map((category) => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{category}</h3>
                        <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-normal">
                            {groupedResources[category].length}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupedResources[category].map((resource) => (
                            <div
                                key={resource.id}
                                className="group relative flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all duration-300"
                            >
                                <div className={cn(
                                    "p-3 rounded-xl shrink-0 transition-colors",
                                    resource.type === "PDF" && "bg-red-50 dark:bg-red-900/10 group-hover:bg-red-100 dark:group-hover:bg-red-900/20",
                                    resource.type === "VIDEO" && "bg-blue-50 dark:bg-blue-900/10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20",
                                    resource.type === "ARCHIVE" && "bg-amber-50 dark:bg-amber-900/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/20",
                                    resource.type === "LINK" && "bg-green-50 dark:bg-green-900/10 group-hover:bg-green-100 dark:group-hover:bg-green-900/20",
                                )}>
                                    {getIcon(resource.type)}
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between">
                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-2">
                                            {resource.title}
                                        </h4>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                        {resource.description}
                                    </p>
                                    <div className="flex items-center gap-3 pt-2 text-xs text-zinc-400">
                                        <span>{resource.date}</span>
                                        {resource.filesize && (
                                            <>
                                                <span>•</span>
                                                <span>{resource.filesize}</span>
                                            </>
                                        )}
                                        {resource.downloads !== undefined && (
                                            <>
                                                <span>•</span>
                                                <span>{resource.downloads} téléchargements</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                        {resource.type === "LINK" ? <ExternalLink size={16} /> : <Download size={16} />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
