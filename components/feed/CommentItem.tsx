"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Reply, MoreHorizontal, Pen, Trash2, ShieldAlert, Pin, MinusSquare, PlusSquare, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Comment, UserProfile } from "@/lib/types";
import { ReactionPicker } from "./ReactionPicker";
import { cn } from "@/lib/utils";

interface CommentItemProps {
    comment: Comment;
    currentUser?: UserProfile;
    postAuthorId: string;
    onReply: (parentId: string, content: string) => void;
    onEdit?: (commentId: string, content: string) => void;
    onDelete?: (commentId: string) => void;
    onPin?: (commentId: string) => void;
    onFlag?: (commentId: string) => void;
    onReact?: (commentId: string, emoji: string) => void;
    isChild?: boolean;
}

export function CommentItem({ comment, currentUser, postAuthorId, onReply, onEdit, onDelete, onPin, onFlag, onReact, isChild = false }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [editContent, setEditContent] = useState(comment.content);

    // Derived state
    const isAuthor = currentUser?.id === comment.userId;
    const isPostAuthor = currentUser?.id === postAuthorId;
    const isDeleted = !!comment.deletedAt;

    if (isCollapsed) {
        return (
            <div className={`mt-2 ${isChild ? "ml-8" : ""}`}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-muted-foreground text-xs"
                    onClick={() => setIsCollapsed(false)}
                >
                    <PlusSquare className="h-3 w-3 mr-2" />
                    Déplier le commentaire de {comment.user.name} ({comment.children?.length || 0} réponses)
                </Button>
            </div>
        );
    }

    if (isDeleted) {
        return (
            <div className={`mt-2 p-3 bg-muted/50 rounded-lg italic text-muted-foreground text-sm ${isChild ? "ml-8" : ""}`}>
                [Ce commentaire a été supprimé]
                {comment.children && comment.children.length > 0 && (
                    <div className="space-y-2 mt-2 not-italic">
                        {comment.children.map(child => (
                            <CommentItem
                                key={child.id}
                                comment={child}
                                currentUser={currentUser}
                                postAuthorId={postAuthorId}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onPin={onPin}
                                onFlag={onFlag}
                                onReact={onReact}
                                isChild
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`flex gap-3 ${isChild ? "ml-8 mt-2" : "mt-4"} group`}>
            <div className="flex flex-col items-center gap-1">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar || "/avatars/01.png"} />
                    <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
                </Avatar>
                {comment.children && comment.children.length > 0 && (
                    <div
                        className="w-0.5 grow bg-border/50 hover:bg-primary/50 cursor-pointer transition-colors mt-1 mb-1"
                        onClick={() => setIsCollapsed(true)}
                        title="Plier le thread"
                    />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className={cn("rounded-lg p-3 text-sm transition-colors", comment.isPinned ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900" : "bg-muted/50")}>
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">{comment.user.name}</span>
                            {comment.isPinned && <Pin className="h-3 w-3 text-amber-600 fill-amber-600" />}
                            <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {comment.isEdited && <span className="text-[10px] text-muted-foreground">(modifié)</span>}
                        </div>

                        {/* Actions Menu */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-40 p-1">
                                {isPostAuthor && (
                                    <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2 text-xs" onClick={() => onPin?.(comment.id)}>
                                        <Pin className="h-3 w-3 mr-2" /> {comment.isPinned ? "Désépingler" : "Épingler"}
                                    </Button>
                                )}
                                {isAuthor && (
                                    <>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2 text-xs" onClick={() => setIsEditing(true)}>
                                            <Pen className="h-3 w-3 mr-2" /> Éditer
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2 text-xs text-destructive hover:text-destructive" onClick={() => onDelete?.(comment.id)}>
                                            <Trash2 className="h-3 w-3 mr-2" /> Supprimer
                                        </Button>
                                    </>
                                )}
                                <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2 text-xs text-orange-600" onClick={() => onFlag?.(comment.id)}>
                                    <ShieldAlert className="h-3 w-3 mr-2" /> Signaler
                                </Button>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Annuler</Button>
                                <Button size="sm" onClick={() => { onEdit?.(comment.id, editContent); setIsEditing(false); }}>Enregistrer</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
                            <ReactMarkdown
                                components={{
                                    a: ({ node, ...props }) => <a {...props} className="text-primary font-semibold hover:underline" />
                                }}
                            >
                                {comment.content.replace(/(?<=^|\s)@(\w+)/g, '[@$1](/profile/$1)')}
                            </ReactMarkdown>
                            {comment.media && (
                                <img
                                    src={comment.media}
                                    alt="Attachment"
                                    className="mt-2 rounded-md max-h-48 object-cover border border-border/50"
                                    onClick={() => window.open(comment.media!, '_blank')}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-4 mt-1 ml-1 text-xs text-muted-foreground">
                    <RelationActions
                        comment={comment}
                        currentUser={currentUser}
                        onReact={onReact}
                        isReplying={isReplying}
                        setIsReplying={setIsReplying}
                    />
                </div>

                {/* Reply Input */}
                {isReplying && (
                    <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                        <div className="relative flex-1">
                            <input
                                className="w-full bg-transparent border-b border-muted-foreground/30 focus:border-primary px-1 py-1 text-sm outline-none pr-8"
                                placeholder={`Répondre à ${comment.user.name}...`}
                                autoFocus
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (replyContent.trim()) {
                                            onReply(comment.id, replyContent);
                                            setReplyContent("");
                                            setIsReplying(false);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                            if (replyContent.trim()) {
                                onReply(comment.id, replyContent);
                                setReplyContent("");
                                setIsReplying(false);
                            }
                        }}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Nested Replies */}
                {comment.children && comment.children.length > 0 && !isCollapsed && (
                    <div className="space-y-2">
                        {comment.children.map(child => (
                            <CommentItem
                                key={child.id}
                                comment={child}
                                currentUser={currentUser}
                                postAuthorId={postAuthorId}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onPin={onPin}
                                onFlag={onFlag}
                                onReact={onReact}
                                isChild
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RelationActions({ comment, currentUser, onReact, isReplying, setIsReplying }: any) {
    return (
        <>
            <div className="flex items-center">
                <ReactionPicker
                    targetId={comment.id}
                    targetType="COMMENT"
                    count={0}
                    currentUserId={currentUser?.id}
                />
                {/* Note: ReactionPicker UI needs tweak to show current reaction if any */}
            </div>
            <button
                className={cn("font-medium hover:text-primary flex items-center gap-1 transition-colors", isReplying && "text-primary")}
                onClick={() => setIsReplying(!isReplying)}
            >
                <Reply className="h-3 w-3" /> Répondre
            </button>
            {comment.children && comment.children.length > 0 && (
                <button
                    className="hover:text-foreground"
                    onClick={() => document.getElementById(`collapse-${comment.id}`)?.click()}
                >
                    {comment.children.length} réponses
                </button>
            )}
        </>
    )
}

