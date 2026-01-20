"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon, Link as LinkIcon, Image as ImageIcon, Video, Music } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getConversationMedia } from "@/lib/services/messaging.service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SharedMediaSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversationId: string;
}

export function SharedMediaSheet({ open, onOpenChange, conversationId }: SharedMediaSheetProps) {
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && conversationId) {
            loadMedia();
        }
    }, [open, conversationId]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const res = await getConversationMedia(conversationId);
            if (res.success && res.data) {
                setMedia(res.data);
            }
        } catch (error) {
            console.error("Failed to load media", error);
        } finally {
            setLoading(false);
        }
    };

    const imagesAndVideos = media.filter(m =>
        (m.type === "IMAGE" || m.type === "VIDEO") ||
        m.attachments?.some((a: any) => ["IMAGE", "VIDEO"].includes(a.type))
    );

    const files = media.filter(m =>
        (m.type === "FILE" || m.type === "AUDIO") ||
        m.attachments?.some((a: any) => ["FILE", "AUDIO", "PDF"].includes(a.type))
    );

    const links = media.filter(m => m.metadata);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-2 border-b">
                    <SheetTitle>Médias partagés</SheetTitle>
                </SheetHeader>

                <Tabs defaultValue="media" className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 py-2">
                        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                            <TabsTrigger value="media" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 py-2">
                                Médias ({imagesAndVideos.length})
                            </TabsTrigger>
                            <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 py-2">
                                Fichiers ({files.length})
                            </TabsTrigger>
                            <TabsTrigger value="links" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 py-2">
                                Liens ({links.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="media" className="flex-1 min-h-0 relative m-0">
                        <ScrollArea className="h-full p-4">
                            <div className="grid grid-cols-3 gap-2">
                                {imagesAndVideos.flatMap(m => {
                                    // Handle legacy single image or attachments
                                    const items = [];
                                    if (m.type === "IMAGE" && m.image) items.push({ url: m.image, type: "IMAGE" });
                                    if (m.attachments) items.push(...m.attachments.filter((a: any) => ["IMAGE", "VIDEO"].includes(a.type)));

                                    return items.map((item, i) => (
                                        <div key={`${m.id}-${i}`} className="aspect-square relative rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                                            {item.type === "VIDEO" ? (
                                                <div className="w-full h-full flex items-center justify-center bg-black">
                                                    <Video className="text-white/50" />
                                                </div>
                                            ) : (
                                                <Image
                                                    src={item.url}
                                                    alt="media"
                                                    width={200}
                                                    height={200}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    ));
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="files" className="flex-1 min-h-0 relative m-0">
                        <ScrollArea className="h-full p-4">
                            <div className="flex flex-col gap-2">
                                {files.flatMap(m => {
                                    const items = [];
                                    if (m.type === "FILE" && m.file) items.push({ url: m.file, name: "Fichier", type: "FILE", size: 0 });
                                    if (m.type === "AUDIO") items.push({ url: m.file || m.attachments?.[0]?.url, name: "Message vocal", type: "AUDIO" }); // Legacy
                                    if (m.attachments) items.push(...m.attachments.filter((a: any) => !["IMAGE", "VIDEO"].includes(a.type)));

                                    return items.map((item, i) => (
                                        <a href={item.url} target="_blank" key={`${m.id}-${i}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100">
                                                {item.type === "AUDIO" ? <Music size={18} /> : <FileIcon size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name || "Document sans nom"}</p>
                                                <p className="text-xs text-zinc-400">{format(new Date(m.createdAt), "dd MMM yyyy", { locale: fr })}</p>
                                            </div>
                                        </a>
                                    ));
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="links" className="flex-1 min-h-0 relative m-0">
                        <ScrollArea className="h-full p-4">
                            <div className="flex flex-col gap-2">
                                {links.map(m => {
                                    let meta;
                                    try { meta = typeof m.metadata === 'string' ? JSON.parse(m.metadata) : m.metadata; } catch (e) { return null; }
                                    if (!meta) return null;

                                    return (
                                        <a href={meta.url} target="_blank" key={m.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all">
                                            <div className="w-20 h-20 rounded-lg bg-zinc-100 flex-shrink-0 overflow-hidden relative border border-zinc-200">
                                                {meta.image ? (
                                                    <img src={meta.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                        <LinkIcon size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <h4 className="font-semibold text-sm line-clamp-1">{meta.title || meta.url}</h4>
                                                <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{meta.description}</p>
                                                <div className="flex items-center gap-1 mt-2">
                                                    {meta.favicon && <img src={meta.favicon} className="w-3 h-3" />}
                                                    <span className="text-[10px] text-zinc-400">{new URL(meta.url).hostname}</span>
                                                </div>
                                            </div>
                                        </a>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}

