"use client";

import { useState, useEffect, useCallback } from "react";
import { ExternalLink, X, Loader2, Globe, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchLinkPreview } from "@/lib/actions-content";
import { useDebounce } from "@/hooks/use-debounce";

interface LinkPreviewData {
    url: string;
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    siteName?: string | null;
    faviconUrl?: string | null;
    type?: string;
}

interface LinkPreviewCardProps {
    url?: string;
    data?: LinkPreviewData;
    onRemove?: () => void;
    onFetch?: (data: LinkPreviewData) => void;
    compact?: boolean;
    editable?: boolean;
}

export function LinkPreviewCard({
    url,
    data,
    onRemove,
    onFetch,
    compact = false,
    editable = true
}: LinkPreviewCardProps) {
    const [preview, setPreview] = useState<LinkPreviewData | null>(data || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedUrl = useDebounce(url, 500);

    const loadPreview = useCallback(async (targetUrl: string) => {
        if (!targetUrl) return;

        // Validate URL format
        try {
            new URL(targetUrl);
        } catch {
            return;
        }

        setLoading(true);
        setError(null);

        const result = await fetchLinkPreview(targetUrl);

        if (result.success && result.preview) {
            setPreview(result.preview as LinkPreviewData);
            onFetch?.(result.preview as LinkPreviewData);
        } else {
            setError(result.error || "Impossible de charger l'aperçu");
        }

        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Only fetch once when URL stabilizes
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (debouncedUrl && !data && !hasFetched && !loading) {
            setHasFetched(true);
            loadPreview(debouncedUrl);
        }
    }, [debouncedUrl, data, hasFetched, loading, loadPreview]);

    useEffect(() => {
        if (data) {
            setPreview(data);
        }
    }, [data]);

    if (loading) {
        return (
            <div className={cn(
                "rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden",
                "bg-zinc-50 dark:bg-zinc-800/50 animate-pulse"
            )}>
                <div className="flex items-center gap-3 p-4">
                    <Loader2 className="animate-spin text-zinc-400" size={20} />
                    <div className="flex-1">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    {editable && (
                        <button
                            onClick={() => url && loadPreview(url)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <RefreshCw size={14} className="text-red-500" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!preview) return null;

    if (compact) {
        return (
            <div className="group relative rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">
                <a
                    href={preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3"
                >
                    {preview.faviconUrl && (
                        <img
                            src={preview.faviconUrl}
                            alt=""
                            className="w-4 h-4 flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                    <span className="text-sm truncate text-zinc-600 dark:text-zinc-300">
                        {preview.title || preview.url}
                    </span>
                    <ExternalLink size={12} className="flex-shrink-0 text-zinc-400" />
                </a>
                {editable && onRemove && (
                    <button
                        onClick={(e) => { e.preventDefault(); onRemove(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-zinc-200 dark:bg-zinc-700 rounded-full transition-opacity"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">
            {editable && onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={14} className="text-white" />
                </button>
            )}

            <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                {/* Image */}
                {preview.imageUrl && (
                    <div className="relative h-40 bg-zinc-100 dark:bg-zinc-800">
                        <img
                            src={preview.imageUrl}
                            alt={preview.title || ""}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-4">
                    {/* Site info */}
                    <div className="flex items-center gap-2 mb-2">
                        {preview.faviconUrl ? (
                            <img
                                src={preview.faviconUrl}
                                alt=""
                                className="w-4 h-4"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <Globe size={14} className="text-zinc-400" />
                        )}
                        <span className="text-xs text-zinc-400 uppercase tracking-wide">
                            {preview.siteName || new URL(preview.url).hostname}
                        </span>
                    </div>

                    {/* Title */}
                    {preview.title && (
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1 text-zinc-800 dark:text-zinc-200 group-hover:text-orange-500 transition-colors">
                            {preview.title}
                        </h4>
                    )}

                    {/* Description */}
                    {preview.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            {preview.description}
                        </p>
                    )}
                </div>
            </a>
        </div>
    );
}

// --- Link Input Component ---
interface LinkInputProps {
    onLinkAdd: (url: string, preview: LinkPreviewData) => void;
    placeholder?: string;
}

export function LinkInput({ onLinkAdd, placeholder = "Coller un lien..." }: LinkInputProps) {
    const [url, setUrl] = useState("");
    const [preview, setPreview] = useState<LinkPreviewData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFetch = (data: LinkPreviewData) => {
        setPreview(data);
    };

    const handleAdd = () => {
        if (preview) {
            onLinkAdd(url, preview);
            setUrl("");
            setPreview(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                />
                {preview && (
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Ajouter
                    </button>
                )}
            </div>

            {url && (
                <LinkPreviewCard
                    url={url}
                    onFetch={handleFetch}
                    editable={false}
                />
            )}
        </div>
    );
}

