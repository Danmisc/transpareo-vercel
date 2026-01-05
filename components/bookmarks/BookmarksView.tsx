"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Search, BookOpen } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/feed/PostCard";
import { CreateCollectionDialog } from "@/components/bookmarks/CreateCollectionDialog";

interface BookmarksViewProps {
    collections: any[];
    savedPosts: any[];
    currentUser: any;
}

export function BookmarksView({ collections, savedPosts, currentUser }: BookmarksViewProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const readingLists = collections.filter(c => c.type === "READING_LIST");
    const standardCollections = collections.filter(c => c.type !== "READING_LIST");

    const filteredReadingLists = readingLists.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredStandardCollections = standardCollections.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredSavedPosts = savedPosts.filter(item =>
        item.post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bibliothèque</h1>
                    <p className="text-muted-foreground">Gérez vos collections et listes de lecture.</p>
                </div>
                <CreateCollectionDialog />
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher une collection ou une sauvegarde..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Reading Lists */}
            {filteredReadingLists.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Listes de Lecture
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredReadingLists.map((col: any) => (
                            <Link key={col.id} href={`/bookmarks/${col.id}`}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full border-l-4 border-l-primary/50">
                                    <CardHeader className="p-6 pb-4">
                                        <BookOpen className="h-8 w-8 text-primary mb-2" />
                                        <CardTitle className="text-base truncate" title={col.name}>{col.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0 text-xs text-muted-foreground">
                                        {col._count?.savedPosts || 0} éléments
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Standard Collections */}
            {(filteredStandardCollections.length > 0 || (standardCollections.length > 0 && searchQuery === "")) && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Folder className="h-5 w-5" />
                        Collections
                    </h2>
                    {filteredStandardCollections.length === 0 && searchQuery !== "" ? (
                        <p className="text-muted-foreground text-sm">Aucune collection trouvée.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {filteredStandardCollections.map((col: any) => (
                                <Link key={col.id} href={`/bookmarks/${col.id}`}>
                                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                        <CardHeader className="p-6 pb-4">
                                            <Folder className="h-8 w-8 text-muted-foreground mb-2" />
                                            <CardTitle className="text-base truncate" title={col.name}>{col.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-0 text-xs text-muted-foreground">
                                            {col._count?.savedPosts || 0} éléments
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                            {standardCollections.length === 0 && readingLists.length === 0 && !searchQuery && (
                                <div className="col-span-full text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    Créez votre première collection.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Recent Saves */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                    {searchQuery ? "Sauvegardes trouvées" : "Sauvegardes Récentes"}
                </h2>
                <div className="space-y-4">
                    {filteredSavedPosts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {searchQuery ? "Aucune publication ne correspond à votre recherche." : "Aucune publication sauvegardée."}
                        </div>
                    ) : (
                        filteredSavedPosts.map((item: any) => (
                            <div key={item.id} className="relative">
                                <PostCard
                                    id={item.post.id}
                                    authorId={item.post.authorId}
                                    currentUser={currentUser}
                                    author={{
                                        name: item.post.author.name || "User",
                                        avatar: item.post.author.avatar || "/avatars/default.png",
                                        role: item.post.author.role || "Membre"
                                    }}
                                    content={item.post.content}
                                    published={new Date(item.post.createdAt).toLocaleDateString()}
                                    isSaved={true}
                                    type={item.post.type}
                                    image={item.post.image}
                                    metrics={{
                                        likes: 0,
                                        comments: item.post._count?.comments || 0,
                                        shares: 0
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
