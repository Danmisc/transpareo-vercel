"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // NEW
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Image, MapPin, BarChart2, Video, Send, X, Loader2,
    FileText, Code, Link2, Clock, Users, Save, Home,
    ChevronDown, Sparkles, Layers, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createPost } from "@/lib/actions";
import { saveDraft, schedulePost } from "@/lib/actions-content";
import { UserProfile } from "@/lib/types";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { toast } from "sonner";

// Import new editor components
import { RichTextEditor, MarkdownPreview } from "@/components/editor/RichTextEditor";
import { DraftsPanel } from "@/components/editor/DraftsPanel";
import { SchedulePostModal } from "@/components/editor/SchedulePostModal";
import { LinkPreviewCard, LinkInput } from "@/components/editor/LinkPreviewCard";
import { CodeBlockInput } from "@/components/editor/CodeBlockInput";
import { CarouselEditor } from "@/components/editor/CarouselEditor";
import { MapEmbedPicker } from "@/components/editor/MapEmbedPicker";
import { CollaboratorInvite } from "@/components/editor/CollaboratorInvite";

type PostType = "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "PROPERTY" | "CODE" | "LINK" | "MAP";
type ContentFormat = "TEXT" | "MARKDOWN" | "RICHTEXT";

interface CreatePostEnhancedProps {
    currentUser?: UserProfile;
    onPostCreated?: () => void;
}

interface CodeBlock {
    language: string;
    code: string;
    filename?: string;
}

interface LinkPreview {
    url: string;
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    siteName?: string | null;
}

interface MapLocation {
    latitude: number;
    longitude: number;
    address?: string;
    zoomLevel?: number;
}

interface CarouselSlide {
    id: string;
    url: string;
    caption?: string;
    type: "IMAGE" | "VIDEO";
}

export function CreatePostEnhanced({ currentUser, onPostCreated }: CreatePostEnhancedProps) {
    const searchParams = useSearchParams(); // NEW

    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState<PostType>("TEXT");
    const [contentFormat, setContentFormat] = useState<ContentFormat>("MARKDOWN");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Auto-expand if URL param present
    useEffect(() => {
        if (searchParams?.get("action") === "create_post") {
            setIsExpanded(true);

            // Remove param from URL to keep it clean
            const url = new URL(window.location.href);
            url.searchParams.delete("action");
            window.history.replaceState({}, "", url);

            // Optional: Scroll into view
            const element = document.getElementById("create-post-container");
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [searchParams]);

    // Media
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
    const [isCarousel, setIsCarousel] = useState(false);

    // Poll
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

    // Property
    const [propertyDetails, setPropertyDetails] = useState({
        price: "", location: "", surface: "", rooms: ""
    });

    // Code blocks
    const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);

    // Link previews
    const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([]);

    // Map embeds
    const [mapEmbeds, setMapEmbeds] = useState<MapLocation[]>([]);

    // Collaboration
    const [collaborators, setCollaborators] = useState<any[]>([]);

    // Reset form
    const resetForm = () => {
        setContent("");
        setPostType("TEXT");
        setMediaUrls([]);
        setCarouselSlides([]);
        setIsCarousel(false);
        setPollOptions(["", ""]);
        setPropertyDetails({ price: "", location: "", surface: "", rooms: "" });
        setCodeBlocks([]);
        setLinkPreviews([]);
        setMapEmbeds([]);
        setCollaborators([]);
        setIsExpanded(false);
        setShowAdvanced(false);
    };

    // Handle publish
    const handlePublish = async () => {
        if (!content.trim() && postType === "TEXT" && mediaUrls.length === 0 && codeBlocks.length === 0) {
            toast.error("Ajoutez du contenu à votre post");
            return;
        }
        if (!currentUser?.id) return;

        setIsSubmitting(true);

        let metadata: any = {
            contentFormat,
            codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
            linkPreviews: linkPreviews.length > 0 ? linkPreviews : undefined,
            mapEmbeds: mapEmbeds.length > 0 ? mapEmbeds : undefined,
        };

        if (postType === "POLL") {
            metadata.options = pollOptions.filter(o => o.trim());
        } else if (postType === "PROPERTY") {
            metadata = { ...metadata, ...propertyDetails };
        }

        try {
            const res = await createPost(
                currentUser.id,
                content,
                postType === "CODE" || postType === "LINK" || postType === "MAP" ? "TEXT" : postType,
                isCarousel && carouselSlides.length > 0 ? carouselSlides[0].url : (mediaUrls[0] || undefined),
                metadata,
                undefined,
                propertyDetails.location || mapEmbeds[0]?.address || undefined,
                undefined,
                isCarousel ? carouselSlides.map(s => s.url) : mediaUrls
            );

            if (res.success) {
                toast.success("Post publié ! 🚀");
                resetForm();
                onPostCreated?.();
            } else {
                toast.error(res.error || "Erreur lors de la publication");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur inattendue");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle save draft
    const handleSaveDraft = async () => {
        if (!content.trim() && mediaUrls.length === 0 && codeBlocks.length === 0) {
            toast.error("Rien à sauvegarder");
            return;
        }

        setIsSavingDraft(true);

        try {
            const res = await saveDraft({
                content,
                type: postType,
                contentFormat,
                isCarousel,
                attachments: isCarousel ? carouselSlides.map(s => s.url) : mediaUrls,
                codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
                embedLinks: linkPreviews.length > 0 ? linkPreviews.map(lp => ({
                    url: lp.url,
                    title: lp.title ?? undefined,
                    description: lp.description ?? undefined,
                    imageUrl: lp.imageUrl ?? undefined,
                    siteName: lp.siteName ?? undefined,
                })) : undefined,
                mapEmbeds: mapEmbeds.length > 0 ? mapEmbeds : undefined,
            });

            if (res.success) {
                toast.success("Brouillon sauvegardé ✓");
            } else {
                toast.error(res.error || "Erreur de sauvegarde");
            }
        } catch (error) {
            toast.error("Erreur inattendue");
        } finally {
            setIsSavingDraft(false);
        }
    };

    // Handle schedule
    const handleSchedule = async (scheduledDate: Date) => {
        if (!content.trim()) {
            toast.error("Ajoutez du contenu");
            return;
        }

        try {
            const res = await schedulePost({
                content,
                scheduledAt: scheduledDate,
                type: postType,
                contentFormat,
                attachments: isCarousel ? carouselSlides.map(s => s.url) : mediaUrls,
            });

            if (res.success) {
                toast.success(`Programmé pour le ${scheduledDate.toLocaleDateString("fr-FR")} ⏰`);
                resetForm();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Erreur inattendue");
        }
    };

    // Load draft into editor
    const handleLoadDraft = (draft: any) => {
        setContent(draft.content || "");
        setPostType(draft.type || "TEXT");
        setContentFormat(draft.contentFormat || "TEXT");
        setIsCarousel(draft.isCarousel || false);
        if (draft.attachments) {
            setMediaUrls(draft.attachments.map((a: any) => a.url));
        }
        if (draft.codeBlocks) {
            setCodeBlocks(draft.codeBlocks);
        }
        setIsExpanded(true);
    };

    // Type buttons config
    const typeButtons = [
        { type: "TEXT" as PostType, icon: FileText, label: "Texte" },
        { type: "IMAGE" as PostType, icon: Image, label: "Photo" },
        { type: "VIDEO" as PostType, icon: Video, label: "Vidéo" },
        { type: "POLL" as PostType, icon: BarChart2, label: "Sondage" },
        { type: "PROPERTY" as PostType, icon: Home, label: "Immo" },
        { type: "CODE" as PostType, icon: Code, label: "Code" },
        { type: "LINK" as PostType, icon: Link2, label: "Lien" },
        { type: "MAP" as PostType, icon: MapPin, label: "Carte" },
    ];

    return (
        <Card id="create-post-container" className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl mb-4 md:mb-6 overflow-hidden transition-all duration-300 hover:border-zinc-300/80 dark:hover:border-zinc-700">
            <CardContent className="p-3 md:p-5">
                <div className="flex gap-3 md:gap-4">
                    <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:opacity-90 flex-shrink-0">
                        <AvatarImage src={currentUser?.avatar || "/avatars/default.svg"} alt="@user" />
                        <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
                        {/* Compact Input */}
                        {!isExpanded && (
                            <div className="relative" onClick={() => setIsExpanded(true)}>
                                <textarea
                                    placeholder="Quoi de neuf dans l'immo ?"
                                    className="w-full h-10 resize-none bg-transparent placeholder:text-zinc-500 focus:outline-none min-h-[44px] text-[15px] pt-2 overflow-hidden cursor-text"
                                    readOnly
                                />
                            </div>
                        )}

                        {/* Expanded Editor */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 md:space-y-4"
                                >
                                    {/* Rich Text Editor */}
                                    <RichTextEditor
                                        value={content}
                                        onChange={setContent}
                                        contentFormat={contentFormat}
                                        onFormatChange={setContentFormat}
                                        placeholder={postType === "POLL" ? "Votre question..." : "Partagez votre actualité..."}
                                    />

                                    {/* Type-specific content */}
                                    {postType === "POLL" && (
                                        <div className="space-y-2 pl-3 border-l-2 border-orange-500/30">
                                            {pollOptions.map((opt, i) => (
                                                <input
                                                    key={i}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 border border-zinc-200 dark:border-zinc-700"
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...pollOptions];
                                                        newOpts[i] = e.target.value;
                                                        setPollOptions(newOpts);
                                                    }}
                                                />
                                            ))}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-orange-600"
                                                onClick={() => setPollOptions([...pollOptions, ""])}
                                            >
                                                + Ajouter une option
                                            </Button>
                                        </div>
                                    )}

                                    {postType === "PROPERTY" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 border border-zinc-200 dark:border-zinc-700"
                                                placeholder="Prix (€)"
                                                type="number"
                                                value={propertyDetails.price}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, price: e.target.value })}
                                            />
                                            <input
                                                className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 border border-zinc-200 dark:border-zinc-700"
                                                placeholder="Ville / Quartier"
                                                value={propertyDetails.location}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, location: e.target.value })}
                                            />
                                            <input
                                                className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 border border-zinc-200 dark:border-zinc-700"
                                                placeholder="Surface (m²)"
                                                type="number"
                                                value={propertyDetails.surface}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, surface: e.target.value })}
                                            />
                                            <input
                                                className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 border border-zinc-200 dark:border-zinc-700"
                                                placeholder="Pièces"
                                                type="number"
                                                value={propertyDetails.rooms}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, rooms: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {/* Image/Video with Carousel option */}
                                    {(postType === "IMAGE" || postType === "VIDEO" || postType === "PROPERTY") && (
                                        <div className="space-y-3">
                                            {/* Carousel toggle */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setIsCarousel(!isCarousel)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                                        isCarousel
                                                            ? "bg-orange-500 text-white"
                                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                    )}
                                                >
                                                    <Layers size={14} />
                                                    {isCarousel ? "Mode Carousel actif" : "Activer Carousel"}
                                                </button>
                                            </div>

                                            {isCarousel ? (
                                                <CarouselEditor
                                                    slides={carouselSlides}
                                                    onChange={setCarouselSlides}
                                                    maxSlides={10}
                                                />
                                            ) : (
                                                <MultiImageUpload
                                                    value={mediaUrls}
                                                    onChange={(urls) => setMediaUrls(urls)}
                                                    onRemove={(url) => setMediaUrls(mediaUrls.filter(u => u !== url))}
                                                    maxFiles={4}
                                                    accept={postType === "VIDEO" ? "video/*" : "image/*"}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Code Block */}
                                    {postType === "CODE" && (
                                        <div className="space-y-3">
                                            {codeBlocks.map((block, i) => (
                                                <CodeBlockInput
                                                    key={i}
                                                    value={block}
                                                    onChange={(updated) => {
                                                        const newBlocks = [...codeBlocks];
                                                        newBlocks[i] = updated;
                                                        setCodeBlocks(newBlocks);
                                                    }}
                                                    onRemove={() => setCodeBlocks(codeBlocks.filter((_, idx) => idx !== i))}
                                                />
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCodeBlocks([...codeBlocks, { language: "javascript", code: "" }])}
                                                className="w-full border-dashed"
                                            >
                                                <Code size={14} className="mr-2" />
                                                Ajouter un bloc de code
                                            </Button>
                                        </div>
                                    )}

                                    {/* Link Preview */}
                                    {postType === "LINK" && (
                                        <div className="space-y-3">
                                            {linkPreviews.map((lp, i) => (
                                                <LinkPreviewCard
                                                    key={i}
                                                    data={lp}
                                                    onRemove={() => setLinkPreviews(linkPreviews.filter((_, idx) => idx !== i))}
                                                />
                                            ))}
                                            <LinkInput
                                                onLinkAdd={(url, preview) => setLinkPreviews([...linkPreviews, preview])}
                                                placeholder="Coller ou taper une URL..."
                                            />
                                        </div>
                                    )}

                                    {/* Map Embed */}
                                    {postType === "MAP" && (
                                        <div className="space-y-3">
                                            {mapEmbeds.map((me, i) => (
                                                <MapEmbedPicker
                                                    key={i}
                                                    value={me}
                                                    onChange={(updated) => {
                                                        const newEmbeds = [...mapEmbeds];
                                                        newEmbeds[i] = updated;
                                                        setMapEmbeds(newEmbeds);
                                                    }}
                                                    onRemove={() => setMapEmbeds(mapEmbeds.filter((_, idx) => idx !== i))}
                                                />
                                            ))}
                                            {mapEmbeds.length === 0 && (
                                                <MapEmbedPicker
                                                    onChange={(loc) => setMapEmbeds([loc])}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Type selector toolbar - icons only on mobile */}
                                    <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                        {typeButtons.map(({ type, icon: Icon, label }) => (
                                            <button
                                                key={type}
                                                onClick={() => setPostType(type)}
                                                className={cn(
                                                    "flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                                    postType === type
                                                        ? "bg-orange-500 text-white shadow-sm"
                                                        : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                )}
                                                title={label}
                                            >
                                                <Icon size={14} />
                                                <span className="hidden sm:inline">{label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Action buttons - single row */}
                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        {/* Left: Secondary actions */}
                                        <div className="flex items-center">
                                            {/* Drafts */}
                                            <DraftsPanel
                                                onEditDraft={handleLoadDraft}
                                                trigger={
                                                    <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" title="Brouillons">
                                                        <FileText size={18} />
                                                    </button>
                                                }
                                            />

                                            {/* Schedule */}
                                            <SchedulePostModal
                                                onSchedule={handleSchedule}
                                                trigger={
                                                    <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors" title="Programmer">
                                                        <Clock size={18} />
                                                    </button>
                                                }
                                            />

                                            {/* Collaborators */}
                                            <CollaboratorInvite
                                                collaborators={collaborators}
                                                onInvite={(userId, role) => {
                                                    setCollaborators([...collaborators, { userId, role, status: "PENDING" }]);
                                                }}
                                                trigger={
                                                    <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative" title="Collab">
                                                        <Users size={18} />
                                                        {collaborators.length > 0 && (
                                                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] flex items-center justify-center">
                                                                {collaborators.length}
                                                            </span>
                                                        )}
                                                    </button>
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Save draft */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleSaveDraft}
                                                disabled={isSavingDraft}
                                                className="text-zinc-500"
                                            >
                                                {isSavingDraft ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Save size={14} />
                                                )}
                                            </Button>

                                            {/* Cancel */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={resetForm}
                                                className="text-zinc-500"
                                            >
                                                Annuler
                                            </Button>

                                            {/* Publish */}
                                            <Button
                                                onClick={handlePublish}
                                                disabled={isSubmitting}
                                                className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-bold px-6"
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        Publier
                                                        <Send size={14} className="ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
