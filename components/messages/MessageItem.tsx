"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, X, Check, CheckCheck, SmilePlus, Reply, Info, Pin, Plus, File as FileIcon, Loader2, MessageSquare } from "lucide-react";
import { deleteMessage, editMessage, toggleReaction } from "@/lib/services/messaging.service";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useSession } from "next-auth/react";
import { MessageReadList } from "./MessageReadList";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";
import { LinkPreview } from "./LinkPreview";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./CodeBlock";
import dynamic from "next/dynamic";

const LocationMessage = dynamic(() => import("./LocationMessage"), { ssr: false });

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮"];

interface MessageItemProps {
    message: any;
    isMe: boolean;
    isSequence: boolean;
    previousMessageSenderId?: string;
    onReply?: (message: any) => void;
    onPin?: (message: any) => void;
    onQuoteClick?: (messageId: string) => void;
    onThread?: (message: any) => void;
}

export function MessageItem({ message, isMe, isSequence, onReply, onPin, onQuoteClick, onThread }: MessageItemProps) {
    const { data: session } = useSession();
    const [isEditing, setIsEditing] = useState(false);

    const [editContent, setEditContent] = useState(message.content || "");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'quick' | 'full'>('quick');
    const [showReadList, setShowReadList] = useState(false);

    const handleReaction = async (emoji: string) => {
        setShowPicker(false);
        setPickerMode('quick'); // Reset
        await toggleReaction(message.id, session?.user?.id!, emoji);
    };

    const groupedReactions = (message.reactions || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.emoji]) acc[curr.emoji] = [];
        acc[curr.emoji].push(curr.user);
        return acc;
    }, {});

    // If deleted, show a placeholder
    if (message.isDeleted) {
        return (
            <div className={cn(
                "flex w-full mb-1",
                isMe ? "justify-end" : "justify-start"
            )}>
                <div className={cn(
                    "max-w-[70%] md:max-w-[60%] px-4 py-2 text-[13px] italic text-zinc-400 border border-zinc-100 bg-zinc-50/50 rounded-2xl",
                    isMe ? "rounded-tr-none" : "rounded-tl-none"
                )}>
                    Message supprimé
                </div>
            </div>
        );
    }

    const handleEdit = async () => {
        if (!editContent.trim() || editContent === message.content) {
            setIsEditing(false);
            return;
        }
        const res = await editMessage(message.id, session?.user?.id!, editContent);
        if (res.success) {
            setIsEditing(false);
        } else {
            console.error(res.error);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const res = await deleteMessage(message.id, session?.user?.id!);
        if (!res.success) {
            console.error(res.error);
            setIsDeleting(false);
        }
    };

    return (
        <div className={cn(
            "flex w-full mb-1 group relative",
            isMe ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[70%] md:max-w-[60%] flex flex-col relative",
                isMe ? "items-end" : "items-start"
            )}>
                {/* Context Menu Trigger (Visible on Hover or if Menu Open) */}
                {isMe && !isEditing && (
                    <div className={cn(
                        "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1",
                        "right-[100%] mr-2"
                    )}>
                        <Popover open={showPicker} onOpenChange={(open) => {
                            setShowPicker(open);
                            if (!open) setPickerMode('quick');
                        }}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500">
                                    <SmilePlus size={14} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="center" className="w-auto p-2 border-zinc-200 shadow-lg rounded-xl">
                                {pickerMode === 'quick' ? (
                                    <div className="flex items-center gap-1">
                                        {QUICK_REACTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReaction(emoji)}
                                                className="text-2xl hover:scale-125 transition-transform p-1.5 active:scale-95"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                        <div className="w-[1px] h-6 bg-zinc-100 mx-1" />
                                        <button
                                            onClick={() => setPickerMode('full')}
                                            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-[300px]">
                                        <EmojiPicker
                                            onEmojiClick={(data: EmojiClickData) => handleReaction(data.emoji)}
                                            width="100%"
                                            height={350}
                                            previewConfig={{ showPreview: false }}
                                            searchDisabled={false}
                                        />
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        <MessageActionsMenu
                            onEdit={() => setIsEditing(true)}
                            onDelete={handleDelete}
                            onReply={() => onReply?.(message)}
                            onInfo={() => setShowReadList(true)}
                            onPin={() => onPin?.(message)}
                            isPinned={message.isPinned}
                            onThread={onThread ? () => onThread(message) : undefined}
                        />
                    </div>
                )}

                {/* Hover Actions !isMe */}
                {!isMe && !isEditing && (
                    <div className={cn(
                        "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1",
                        "left-[100%] ml-2"
                    )}>
                        <Popover open={showPicker} onOpenChange={(open) => {
                            setShowPicker(open);
                            if (!open) setPickerMode('quick');
                        }}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500">
                                    <SmilePlus size={14} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="center" className="w-auto p-2 border-zinc-200 shadow-lg rounded-xl">
                                {pickerMode === 'quick' ? (
                                    <div className="flex items-center gap-1">
                                        {QUICK_REACTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReaction(emoji)}
                                                className="text-2xl hover:scale-125 transition-transform p-1.5 active:scale-95"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                        <div className="w-[1px] h-6 bg-zinc-100 mx-1" />
                                        <button
                                            onClick={() => setPickerMode('full')}
                                            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-[300px]">
                                        <EmojiPicker
                                            onEmojiClick={(data: EmojiClickData) => handleReaction(data.emoji)}
                                            width="100%"
                                            height={350}
                                            previewConfig={{ showPreview: false }}
                                            searchDisabled={false}
                                        />
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500" onClick={() => onReply?.(message)}>
                            <Reply size={14} />
                        </Button>
                    </div>
                )}
                {!isMe && !isSequence && (
                    <span className="text-[10px] text-zinc-500 ml-1 mb-1">{message.senderName || "User"}</span>
                )}

                <div className={cn(
                    "relative shadow-sm transition-all",
                    // Shape logic
                    "rounded-2xl",
                    isMe && "rounded-tr-none bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/20",
                    !isMe && "rounded-tl-none bg-zinc-100 text-zinc-900 border border-zinc-200/50",
                    // Sequence overrides
                    isSequence && isMe && "rounded-tr-2xl",
                    isSequence && !isMe && "rounded-tl-2xl",
                    // Pure Media overrides (No bubble)
                    (!message.content && message.attachments?.length > 0 && message.attachments.every((a: any) => ["IMAGE", "VIDEO"].includes(a.type))) &&
                    "p-0 bg-transparent border-none shadow-none",
                    // Standard Padding if not pure media
                    !(!message.content && message.attachments?.length > 0 && message.attachments.every((a: any) => ["IMAGE", "VIDEO"].includes(a.type))) && "px-4 py-2",

                    message.type === "image" && "p-0 bg-transparent border-none shadow-none",
                    isEditing && "w-full min-w-[200px]"
                )}>
                    {/* QUOTE BLOCK */}
                    {message.replyTo && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuoteClick?.(message.replyTo.id);
                            }}
                            className={cn(
                                "mb-1 mt-0.5 mx-0.5 p-2 rounded-lg border-l-[3px] text-xs cursor-pointer active:scale-95 transition-all select-none",
                                isMe ? "bg-black/20 border-white/60 text-white/90" : "bg-black/5 border-orange-500 text-zinc-600 hover:bg-black/10"
                            )}
                        >
                            <div className="flex items-center gap-1 mb-0.5">
                                <Reply size={10} className="stroke-[3px]" />
                                <span className="font-bold text-[10px]">{message.replyTo.sender.name}</span>
                            </div>
                            <p className="line-clamp-1 opacity-90 truncate font-medium">{message.replyTo.content || "📎 Fichier joint"}</p>
                        </div>
                    )}

                    {/* Content Rendering */}
                    {(message.attachments && message.attachments.length > 0) ? (
                        <div className="flex flex-col gap-1 min-w-[150px]">
                            {/* Images */}
                            {message.attachments.filter((a: any) => a.type === "IMAGE").length > 0 && (
                                <>
                                    <div className={cn("grid gap-0.5 overflow-hidden rounded-lg cursor-pointer",
                                        message.attachments.filter((a: any) => a.type === "IMAGE").length === 1 ? "grid-cols-1" :
                                            message.attachments.filter((a: any) => a.type === "IMAGE").length === 2 ? "grid-cols-2" : "grid-cols-2"
                                    )}>
                                        {message.attachments.filter((a: any) => a.type === "IMAGE").slice(0, 4).map((img: any, idx: number) => (
                                            <div key={idx} className="relative aspect-square" onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}>
                                                <img src={img.url} alt="Attachment" className={cn("w-full h-full object-cover hover:opacity-90 transition-opacity", img.isOptimistic && "opacity-70 blur-[1px]")} />
                                                {img.isOptimistic && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                    </div>
                                                )}
                                                {/* +X More overlay */}
                                                {idx === 3 && message.attachments.filter((a: any) => a.type === "IMAGE").length > 4 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                                                        +{message.attachments.filter((a: any) => a.type === "IMAGE").length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Lightbox
                                        open={lightboxOpen}
                                        close={() => setLightboxOpen(false)}
                                        index={lightboxIndex}
                                        slides={message.attachments.filter((a: any) => a.type === "IMAGE").map((a: any) => ({ src: a.url }))}
                                    />
                                </>
                            )}

                            {/* Videos */}
                            {message.attachments.filter((a: any) => a.type === "VIDEO").map((vid: any, idx: number) => (
                                <div key={idx} className="rounded-lg overflow-hidden bg-black w-full max-w-[320px] aspect-video relative">
                                    <video
                                        src={vid.url}
                                        controls
                                        preload="metadata"
                                        className={cn("w-full h-full object-contain", vid.isOptimistic && "opacity-70")}
                                    />
                                    {vid.isOptimistic && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Audios */}
                            {message.attachments.filter((a: any) => a.type === "AUDIO").map((aud: any, idx: number) => (
                                <VoiceMessagePlayer
                                    key={idx}
                                    src={aud.url}
                                    isMe={isMe}
                                    isOptimistic={aud.isOptimistic}
                                />
                            ))}

                            {/* Files (Documents) */}
                            {message.attachments.filter((a: any) => !["IMAGE", "VIDEO", "AUDIO"].includes(a.type)).map((file: any, idx: number) => (
                                <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors border",
                                    isMe ? "bg-white/10 hover:bg-white/20 border-white/10 text-white" : "bg-white hover:bg-white/80 border-zinc-200 text-zinc-900"
                                )}>
                                    <div className={cn("p-2 rounded-full", isMe ? "bg-white/20" : "bg-orange-100 text-orange-600")}>
                                        <FileIcon size={20} />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium truncate max-w-[150px]">{file.name || "Fichier"}</span>
                                        <span className="text-xs opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </a>
                            ))}

                            {/* Text Caption for media */}
                            {message.content && (
                                <div className={cn("mt-1 text-sm leading-relaxed",
                                    message.attachments.some((a: any) => ["IMAGE", "VIDEO"].includes(a.type)) ? "px-1" : ""
                                )}>
                                    <ReactMarkdown
                                        components={{
                                            code(props) {
                                                const { children, className, node, ...rest } = props
                                                const match = /language-(\w+)/.exec(className || '')
                                                return match ? (
                                                    <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                                                ) : (
                                                    <code {...rest} className={cn("bg-black/10 rounded px-1 py-0.5 text-xs font-mono", className)}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                            {/* Link Preview */}
                            {message.metadata && <LinkPreview metadata={message.metadata} />}
                        </div>
                    ) : message.metadata && (typeof message.metadata === 'object' ? message.metadata.type === "location" : JSON.parse(message.metadata).type === "location") ? (
                        <LocationMessage metadata={typeof message.metadata === 'string' ? JSON.parse(message.metadata) : message.metadata} />
                    ) : (message.type === "image" || message.type === "IMAGE") ? (
                        <div className="rounded-xl overflow-hidden border border-zinc-100 shadow-sm">
                            <img src={message.image} alt="Attachment" className="max-w-full h-auto object-cover max-h-[300px]" />
                        </div>
                    ) : (
                        <div>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="h-8 text-black bg-white/90 border-none focus-visible:ring-0"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleEdit();
                                            if (e.key === 'Escape') setIsEditing(false);
                                        }}
                                    />
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/20" onClick={handleEdit}>
                                        <Check size={14} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => setIsEditing(false)}>
                                        <X size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="markdown-content text-sm">
                                    <ReactMarkdown
                                        components={{
                                            code(props) {
                                                const { children, className, node, ...rest } = props
                                                const match = /language-(\w+)/.exec(className || '')
                                                return match ? (
                                                    <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                                                ) : (
                                                    <code {...rest} className={cn("bg-black/10 rounded px-1 py-0.5 text-xs font-mono", className)}>
                                                        {children}
                                                    </code>
                                                )
                                            },
                                            p: ({ children }) => <p className="mb-1 last:mb-0 whitespace-pre-wrap leading-relaxed">{children}</p>,
                                            a: ({ children, href }) => <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Instagram-style Reactions Overlay */}
                    {Object.keys(groupedReactions).length > 0 && (
                        <div className={cn(
                            "absolute -bottom-4 flex items-center gap-0.5 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-zinc-100 z-10 scale-95",
                            isMe ? "right-2" : "left-2"
                        )}>
                            {Object.entries(groupedReactions).map(([emoji, users]: [string, any]) => {
                                const hasReacted = users.some((u: any) => u.id === session?.user?.id);
                                return (
                                    <button
                                        key={emoji}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReaction(emoji);
                                        }}
                                        className={cn(
                                            "text-[10px] flex items-center gap-0.5 transition-transform hover:scale-110",
                                            hasReacted ? "text-orange-600 font-medium" : "text-zinc-600"
                                        )}
                                    >
                                        <span>{emoji}</span>
                                        {users.length > 1 && <span className="text-[9px] text-zinc-400">{users.length}</span>}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer: Timestamp + Status */}
                <div className={cn(
                    "flex items-center gap-1 select-none transition-all",
                    Object.keys(groupedReactions).length > 0 ? "mt-5" : "mt-1",
                    isMe ? "mr-1 flex-row-reverse" : "ml-1"
                )}>
                    <span className="text-[9px] text-zinc-400">
                        {format(new Date(message.time || message.createdAt), "HH:mm")}
                    </span>
                    {isMe && (
                        message.isRead ?
                            <CheckCheck size={14} className="text-blue-500 cursor-pointer" onClick={() => setShowReadList(true)} /> :
                            message.attachments?.some((a: any) => a.isOptimistic) ? <Loader2 size={10} className="text-zinc-400 animate-spin" /> :
                                <Check size={14} className="text-zinc-400" />
                    )}
                    {message.isEdited && !isEditing && (
                        <span className="text-[9px] text-zinc-400 italic">(modifié)</span>
                    )}
                    {message.isPinned && (
                        <Pin size={10} className="text-orange-500 fill-orange-500 rotate-45" />
                    )}
                </div>

                {/* Thread Badge */}
                {message.replies && message.replies.length > 0 && onThread && (
                    <button
                        onClick={() => onThread(message)}
                        className={cn(
                            "flex items-center gap-1.5 mt-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                            "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30",
                            isMe ? "mr-1" : "ml-1"
                        )}
                    >
                        <MessageSquare size={12} />
                        <span>{message.replies.length} réponse{message.replies.length !== 1 ? "s" : ""}</span>
                    </button>
                )}
            </div>

            {/* Reactions Display Modal */}
            <MessageReadList
                open={showReadList}
                onOpenChange={setShowReadList}
                readStatuses={message.readStatuses || []}
                messageContent={message.content}
            />
        </div>
    );
}

function MessageActionsMenu({ onEdit, onDelete, onReply, onInfo, onPin, isPinned, onThread }: { onEdit: () => void, onDelete: () => void, onReply: () => void, onInfo: () => void, onPin: () => void, isPinned: boolean, onThread?: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500">
                    <MoreVertical size={14} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={onReply} className="gap-2 text-xs cursor-pointer">
                    <Reply size={12} /> Répondre
                </DropdownMenuItem>
                {onThread && (
                    <DropdownMenuItem onClick={onThread} className="gap-2 text-xs cursor-pointer">
                        <MessageSquare size={12} /> Ouvrir le fil
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onPin} className="gap-2 text-xs cursor-pointer">
                    <Pin size={12} className={isPinned ? "fill-current" : ""} /> {isPinned ? "Désépingler" : "Épingler"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onInfo} className="gap-2 text-xs cursor-pointer">
                    <Info size={12} /> Infos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit} className="gap-2 text-xs cursor-pointer">
                    <Pencil size={12} /> Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="gap-2 text-xs text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                    <Trash2 size={12} /> Supprimer
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

