"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, ArrowDownUp, Check, Image as ImageIcon } from "lucide-react";
import { addComment, deleteComment, pinComment, flagComment } from "@/lib/actions";
import { Comment, UserProfile } from "@/lib/types";
import { CommentItem } from "./CommentItem";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { GifPicker } from "@/components/ui/GifPicker";

interface CommentSectionProps {
    postId: string;
    postAuthorId: string;
    initialComments?: Comment[];
    currentUser?: UserProfile;
}

type SortOption = "best" | "newest" | "oldest";

export function CommentSection({ postId, postAuthorId, initialComments = [], currentUser }: CommentSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
    const [showMediaUpload, setShowMediaUpload] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("best");

    // Sorting Logic
    const sortedComments = [...comments].sort((a, b) => {
        // Pinned always first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === "best") return (b.children?.length || 0) - (a.children?.length || 0);
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return 0;
    });

    const handleReply = async (parentId: string, content: string) => {
        await handleAddComment(content, parentId);
    };

    const handleAddComment = async (content: string, parentId?: string) => {
        if (!currentUser || (!content.trim() && !mediaUrl)) return;

        // Optimistic Update
        const tempId = Math.random().toString(36).substr(2, 9);
        const optimisticComment: Comment = {
            id: tempId,
            content,
            media: mediaUrl,
            createdAt: new Date(),
            userId: currentUser.id,
            postId: postId,
            parentId: parentId || null,
            user: currentUser,
            children: []
        };

        if (parentId) {
            // Deep update for nested reply
            setComments(prev => {
                const addReplyToNode = (nodes: Comment[]): Comment[] => {
                    return nodes.map(node => {
                        if (node.id === parentId) {
                            return { ...node, children: [optimisticComment, ...(node.children || [])] };
                        }
                        if (node.children) {
                            return { ...node, children: addReplyToNode(node.children) };
                        }
                        return node;
                    });
                };
                return addReplyToNode(prev);
            });
        } else {
            setComments(prev => [optimisticComment, ...prev]);
        }

        // Reset inputs
        setNewComment("");
        setMediaUrl(undefined);
        setShowMediaUpload(false);

        // Server Call
        await addComment(postId, currentUser.id, content, parentId, mediaUrl);
    };

    const handleEdit = (commentId: string, content: string) => {
        // Implement server action call here later
        console.log("Editing comment", commentId, content);
    };

    const handleDelete = async (commentId: string) => {
        // Optimistic delete
        setComments(prev => {
            const deleteFromNode = (nodes: Comment[]): Comment[] => {
                return nodes.map(node => {
                    if (node.id === commentId) {
                        return { ...node, deletedAt: new Date() }; // Soft delete visual
                    }
                    if (node.children) {
                        return { ...node, children: deleteFromNode(node.children) };
                    }
                    return node;
                }).filter(n => n.id !== commentId || n.children?.length !== 0); // Keep tree integrity
            };
            return deleteFromNode(prev);
        });

        if (currentUser) {
            await deleteComment(commentId, currentUser.id);
        }
    };

    const handlePin = async (commentId: string) => {
        // Optimistic Pin
        setComments(prev => {
            const pinInNode = (nodes: Comment[]): Comment[] => {
                return nodes.map(node => {
                    if (node.id === commentId) {
                        return { ...node, isPinned: !node.isPinned };
                    }
                    if (node.children) {
                        return { ...node, children: pinInNode(node.children) };
                    }
                    return node;
                });
            };
            return pinInNode(prev);
        });

        if (currentUser) {
            await pinComment(commentId, currentUser.id);
        }
    };

    const handleFlag = async (commentId: string) => {
        alert("Commentaire signalé aux modérateurs.");
        if (currentUser) {
            await flagComment(commentId, currentUser.id, "User Flag");
        }
    };

    const handleReact = (commentId: string, emoji: string) => {
        console.log("Reacting to comment", commentId, emoji);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary gap-2 h-8 px-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{comments.length} commentaires</span>
                </Button>
            </div>

            {isOpen && (
                <div className="mt-4 border-t pt-4 animate-in slide-in-from-top-2 fade-in duration-200">

                    {/* Controls Header */}
                    <div className="flex justify-between items-center mb-4 px-1">
                        <span className="text-sm font-semibold">Discussion</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
                                    <ArrowDownUp className="h-3 w-3" />
                                    {sortBy === "best" ? "Meilleurs" : sortBy === "newest" ? "Récents" : "Anciens"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-40 p-1">
                                <div className="space-y-1">
                                    {(["best", "newest", "oldest"] as SortOption[]).map(option => (
                                        <Button
                                            key={option}
                                            variant="ghost"
                                            size="sm"
                                            className={cn("w-full justify-start text-xs", sortBy === option && "bg-accent")}
                                            onClick={() => setSortBy(option)}
                                        >
                                            {option === "best" && "Meilleurs (Populaires)"}
                                            {option === "newest" && "Plus récents"}
                                            {option === "oldest" && "Plus anciens"}
                                            {sortBy === option && <Check className="ml-auto h-3 w-3" />}
                                        </Button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* New Comment Input (Top) */}
                    <div className="flex gap-3 items-start mb-6">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {currentUser?.avatar ? <img src={currentUser.avatar} /> : <span className="text-xs font-bold">MOI</span>}
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="relative">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Ajouter un commentaire..."
                                    className="min-h-[40px] h-auto py-2 pr-10 resize-none text-sm"
                                    rows={1}
                                />
                                <div className="absolute right-1 top-1 flex items-center gap-1">
                                    <GifPicker
                                        onSelect={(gifUrl) => setMediaUrl(gifUrl)}
                                        trigger={
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            >
                                                <span className="text-xs font-bold">GIF</span>
                                            </Button>
                                        }
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={cn("h-8 w-8 text-muted-foreground hover:text-primary", showMediaUpload && "text-primary bg-accent")}
                                        onClick={() => setShowMediaUpload(!showMediaUpload)}
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        className="h-8 w-8"
                                        variant="ghost"
                                        onClick={() => handleAddComment(newComment)}
                                        disabled={!newComment.trim() && !mediaUrl}
                                    >
                                        <Send className="h-4 w-4 text-primary" />
                                    </Button>
                                </div>
                            </div>

                            {showMediaUpload && (
                                <div className="border rounded-md p-2 bg-muted/30 animate-in fade-in zoom-in-95">
                                    <ImageUpload
                                        value={mediaUrl}
                                        onChange={setMediaUrl}
                                        onRemove={() => setMediaUrl(undefined)}
                                        className="h-32 w-full"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                        {sortedComments.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">Soyez le premier à commenter !</p>}
                        {sortedComments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUser={currentUser}
                                postAuthorId={postAuthorId}
                                onReply={handleReply}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onPin={handlePin}
                                onFlag={handleFlag}
                                onReact={handleReact}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

