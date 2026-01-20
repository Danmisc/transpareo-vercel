"use client";

import { ShieldCheck, FileCheck, CheckCircle2, Award, ExternalLink, Pencil } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { Button } from "@/components/ui/button";

interface ProfileCertificationsProps {
    isOwner: boolean;
    certifications?: any[];
    onEdit?: () => void;
}

export function ProfileCertifications({ isOwner, certifications = [], onEdit }: ProfileCertificationsProps) {
    if (certifications.length === 0) {
        if (!isOwner) return null; // Don't show empty section to visitors
        return (
            <ProfileSection title="Licences et certifications">
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                    <Award className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                    <p className="text-sm text-zinc-500 font-medium">Ajoutez vos licences et certifications</p>
                    <p className="text-xs text-muted-foreground mb-4">Renforcez la confiance de votre profil.</p>
                    {onEdit && (
                        <Button variant="outline" size="sm" onClick={onEdit}>
                            Ajouter une licence
                        </Button>
                    )}
                </div>
            </ProfileSection>
        );
    }

    return (
        <ProfileSection title="Licences et certifications">
            <div className="space-y-6">
                {certifications.map((cert) => (
                    <div key={cert.id} className="group relative flex gap-4 items-start pb-6 border-b last:border-0 border-zinc-100 dark:border-zinc-800 last:pb-0">
                        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 bg-blue-100 dark:bg-blue-900/20 shadow-sm border border-transparent">
                            <FileCheck className="w-5 h-5 opacity-90" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-none mb-1 pr-8">
                                {cert.name}
                            </h3>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                {cert.issuer}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                                Délivré {new Date(cert.issueDate).toLocaleDateString()}
                                {cert.credentialId && ` · ID: ${cert.credentialId}`}
                            </div>

                            {cert.credentialUrl && (
                                <div className="mt-3">
                                    <a
                                        href={cert.credentialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm group/link"
                                    >
                                        Voir la certification
                                        <ExternalLink className="ml-1.5 w-3 h-3 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Edit Button (Visible on Hover for Owner) */}
                        {isOwner && onEdit && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-0 right-0 h-8 w-8 text-zinc-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={onEdit}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </ProfileSection>
    );
}

function ExternalLinkIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}
