"use server";

import { prisma as basePrisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = basePrisma as any;
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// --- COLLECTIONS ---

export async function createCollection(name: string, description?: string, isPublic: boolean = false, type: "DEFAULT" | "READING_LIST" = "DEFAULT") {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // @ts-ignore
        const collection = await prisma.collection.create({
            data: {
                userId: session.user.id,
                name,
                description,
                isPublic,
                type
            }
        });
        revalidatePath("/bookmarks");
        return { success: true, data: collection };
    } catch (error) {
        return { success: false, error: "Failed to create collection" };
    }
}

export async function toggleReadStatus(savedPostId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const saved = await prisma.savedPost.findUnique({ where: { id: savedPostId } });
        if (!saved || saved.userId !== session.user.id) return { success: false, error: "Unauthorized" };

        // Toggle progress: 0.0 -> 1.0 (Read) or 1.0 -> 0.0 (Unread)
        // If it's partial, we just set to 1.0
        const newProgress = saved.progress >= 1.0 ? 0.0 : 1.0;

        await prisma.savedPost.update({
            where: { id: savedPostId },
            data: { progress: newProgress }
        });

        revalidatePath("/bookmarks");
        revalidatePath(`/bookmarks/${saved.collectionId}`); // Revalidate specific collection
        return { success: true, newProgress };
    } catch (error) {
        return { success: false, error: "Failed to update status" };
    }
}

export async function deleteCollection(collectionId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
        if (!collection || collection.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.collection.delete({ where: { id: collectionId } });
        revalidatePath("/bookmarks");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete collection" };
    }
}

export async function getUserCollections(userId: string) {
    const session = await auth();
    // Allow viewing if public or if owner
    const isOwner = session?.user?.id === userId;

    try {
        const collections = await prisma.collection.findMany({
            where: {
                userId,
                OR: [
                    { isPublic: true },
                    ...(isOwner ? [{ userId }] : []) // Redundant matching but logic is: if owner, get all. if not, only public.
                ]
            },
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { savedPosts: true } }
            }
        });

        // If owner, simplify logic
        if (isOwner) {
            const allCollections = await prisma.collection.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                include: { _count: { select: { savedPosts: true } } }
            });
            return { success: true, data: allCollections };
        }

        return { success: true, data: collections };
    } catch (error) {
        return { success: false, error: "Failed to fetch collections" };
    }
}

// --- SAVED POSTS ---

export async function savePost(postId: string, collectionId?: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // Check if already saved in this location
        // We use findFirst because findUnique compound with nulls can be tricky in some Prisma/DB combos
        const existing = await prisma.savedPost.findFirst({
            where: {
                userId: session.user.id,
                postId,
                collectionId: collectionId || null
            }
        });

        if (existing) {
            return { success: true, data: existing }; // Already saved
        }

        const saved = await prisma.savedPost.create({
            data: {
                userId: session.user.id,
                postId,
                collectionId
            }
        });

        revalidatePath("/");
        revalidatePath("/bookmarks");
        return { success: true, data: saved };
    } catch (error) {
        console.error("Save post error:", error);
        return { success: false, error: "Failed to save post" };
    }
}

export async function unsavePost(savedId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const saved = await prisma.savedPost.findUnique({ where: { id: savedId } });
        if (!saved || saved.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.savedPost.delete({ where: { id: savedId } });

        revalidatePath("/");
        revalidatePath("/bookmarks");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to unsave" };
    }
}

export async function unsavePostByPostId(postId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const saved = await prisma.savedPost.findUnique({
            where: {
                userId_postId_collectionId: {
                    userId: session.user.id,
                    postId,
                    collectionId: null // Assumption: Quick save is to General (null)
                    // If user saved to collection, this might fail to find it if we only look for null.
                    // We should findFirst where userId and postId match?
                } as any
            }
        });

        // Better: Find ANY save for this post by this user
        const anySaved = await prisma.savedPost.findFirst({
            where: { userId: session.user.id, postId }
        });

        if (!anySaved) return { success: true }; // Already unsaved effectively

        await prisma.savedPost.delete({ where: { id: anySaved.id } });

        revalidatePath("/");
        revalidatePath("/bookmarks");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to unsave" };
    }
}

export async function checkIsSaved(postId: string) {
    const session = await auth();
    if (!session?.user?.id) return { isSaved: false, savedId: null };

    // Check if saved ANYWHERE (first match)
    const saved = await prisma.savedPost.findFirst({
        where: {
            userId: session.user.id,
            postId
        }
    });

    return { isSaved: !!saved, savedId: saved?.id };
}

export async function getCollectionDetails(collectionId: string) {
    const session = await auth();
    try {
        const collection = await prisma.collection.findUnique({
            where: { id: collectionId },
            include: { user: true }
        });

        if (!collection) return { success: false, error: "Not found" };

        const isOwner = session?.user?.id === collection.userId;
        if (!collection.isPublic && !isOwner) {
            return { success: false, error: "Unauthorized" };
        }

        const posts = await prisma.savedPost.findMany({
            where: { collectionId },
            include: {
                post: {
                    include: {
                        author: true,
                        _count: { select: { interactions: true, comments: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: { collection, posts } };
    } catch (error) {
        return { success: false, error: "Failed to fetch details" };
    }
}

// Fetch saved posts that are NOT in a collection (General)
export async function getGeneralSavedPosts(userId: string) {
    const session = await auth();
    if (session?.user?.id !== userId) return { success: false, error: "Unauthorized" }; // Private by default unless we add logic

    try {
        const posts = await prisma.savedPost.findMany({
            where: {
                userId,
                collectionId: null
            },
            include: {
                post: {
                    include: {
                        author: true,
                        _count: { select: { interactions: true, comments: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: posts };
    } catch (error) {
        return { success: false, error: "Failed" };
    }
}
