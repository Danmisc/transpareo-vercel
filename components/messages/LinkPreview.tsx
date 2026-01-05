import { LinkMetadata } from "@/lib/metadata";
import Image from "next/image";

interface LinkPreviewProps {
    metadata: string; // JSON string from DB
}

export function LinkPreview({ metadata }: LinkPreviewProps) {
    let data: LinkMetadata | null = null;
    try {
        data = JSON.parse(metadata);
    } catch (e) {
        return null;
    }

    if (!data) return null;

    return (
        <a href={data.url} target="_blank" rel="noopener noreferrer" className="block mt-2 mb-1 group">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden hover:bg-zinc-100 transition-colors max-w-[400px]">
                {data.image && (
                    <div className="aspect-video relative bg-zinc-200">
                        <img
                            src={data.image}
                            alt={data.title || "Link preview"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                        {data.favicon && <img src={data.favicon} className="w-4 h-4 rounded-sm" />}
                        <span className="text-xs text-zinc-500 truncate">{new URL(data.url).hostname}</span>
                    </div>
                    {data.title && <h3 className="font-semibold text-zinc-900 text-sm mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{data.title}</h3>}
                    {data.description && <p className="text-xs text-zinc-500 line-clamp-2">{data.description}</p>}
                </div>
            </div>
        </a>
    );
}
