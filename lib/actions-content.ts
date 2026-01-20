"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// ============================================
// SPRINT 6: CONTENT CREATION SERVER ACTIONS
// ============================================

// --- DRAFTS ---

export async function saveDraft(data: {
    content: string;
    type?: string;
    metadata?: string;
    tags?: string;
    location?: string;
    image?: string;
    attachments?: string[];
    contentFormat?: string;
    isCarousel?: boolean;
    codeBlocks?: Array<{ language: string; code: string; filename?: string }>;
    embedLinks?: Array<{ url: string; title?: string; description?: string; imageUrl?: string; siteName?: string }>;
    mapEmbeds?: Array<{ latitude: number; longitude: number; address?: string; zoomLevel?: number }>;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        const draft = await prisma.post.create({
            data: {
                authorId: session.user.id,
                content: data.content,
                type: data.type || "TEXT",
                metadata: data.metadata,
                tags: data.tags,
                location: data.location,
                image: data.image,
                isDraft: true,
                published: false,
                contentFormat: data.contentFormat || "TEXT",
                isCarousel: data.isCarousel || false,
                attachments: data.attachments ? {
                    create: data.attachments.map((url, i) => ({
                        url,
                        type: url.includes("video") ? "VIDEO" : "IMAGE",
                        order: i
                    }))
                } : undefined,
                codeBlocks: data.codeBlocks ? {
                    create: data.codeBlocks.map((cb, i) => ({
                        language: cb.language,
                        code: cb.code,
                        filename: cb.filename,
                        order: i
                    }))
                } : undefined,
                embedLinks: data.embedLinks ? {
                    create: data.embedLinks.map((el, i) => ({
                        url: el.url,
                        title: el.title,
                        description: el.description,
                        imageUrl: el.imageUrl,
                        siteName: el.siteName,
                        order: i
                    }))
                } : undefined,
                mapEmbeds: data.mapEmbeds ? {
                    create: data.mapEmbeds.map((me) => ({
                        latitude: me.latitude,
                        longitude: me.longitude,
                        address: me.address,
                        zoomLevel: me.zoomLevel || 15
                    }))
                } : undefined,
            },
            include: {
                attachments: true,
                codeBlocks: true,
                embedLinks: true,
                mapEmbeds: true,
            }
        });

        revalidatePath("/");
        return { success: true, draft };
    } catch (error) {
        console.error("Error saving draft:", error);
        return { success: false, error: "Échec de la sauvegarde du brouillon" };
    }
}

export async function getDrafts() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié", drafts: [] };
    }

    try {
        const drafts = await prisma.post.findMany({
            where: {
                authorId: session.user.id,
                isDraft: true,
            },
            include: {
                attachments: true,
                codeBlocks: true,
                embedLinks: true,
                mapEmbeds: true,
            },
            orderBy: { updatedAt: "desc" },
        });

        return { success: true, drafts };
    } catch (error) {
        console.error("Error fetching drafts:", error);
        return { success: false, error: "Échec du chargement des brouillons", drafts: [] };
    }
}

export async function updateDraft(draftId: string, data: {
    content?: string;
    type?: string;
    metadata?: string;
    tags?: string;
    location?: string;
    image?: string;
    contentFormat?: string;
    isCarousel?: boolean;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        const existing = await prisma.post.findFirst({
            where: { id: draftId, authorId: session.user.id, isDraft: true }
        });

        if (!existing) {
            return { success: false, error: "Brouillon non trouvé" };
        }

        const updated = await prisma.post.update({
            where: { id: draftId },
            data: {
                content: data.content ?? existing.content,
                type: data.type ?? existing.type,
                metadata: data.metadata ?? existing.metadata,
                tags: data.tags ?? existing.tags,
                location: data.location ?? existing.location,
                image: data.image ?? existing.image,
                contentFormat: data.contentFormat ?? existing.contentFormat,
                isCarousel: data.isCarousel ?? existing.isCarousel,
            }
        });

        return { success: true, draft: updated };
    } catch (error) {
        console.error("Error updating draft:", error);
        return { success: false, error: "Échec de la mise à jour" };
    }
}

export async function deleteDraft(draftId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        await prisma.post.delete({
            where: { id: draftId, authorId: session.user.id, isDraft: true }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting draft:", error);
        return { success: false, error: "Échec de la suppression" };
    }
}

export async function publishDraft(draftId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        const post = await prisma.post.update({
            where: { id: draftId, authorId: session.user.id },
            data: {
                isDraft: false,
                published: true,
                publishedAt: new Date(),
            }
        });

        revalidatePath("/");
        return { success: true, post };
    } catch (error) {
        console.error("Error publishing draft:", error);
        return { success: false, error: "Échec de la publication" };
    }
}

// --- SCHEDULED POSTS ---

export async function schedulePost(data: {
    content: string;
    scheduledAt: Date;
    type?: string;
    metadata?: string;
    tags?: string;
    location?: string;
    image?: string;
    attachments?: string[];
    contentFormat?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    if (new Date(data.scheduledAt) <= new Date()) {
        return { success: false, error: "La date doit être dans le futur" };
    }

    try {
        const post = await prisma.post.create({
            data: {
                authorId: session.user.id,
                content: data.content,
                type: data.type || "TEXT",
                metadata: data.metadata,
                tags: data.tags,
                location: data.location,
                image: data.image,
                scheduledAt: new Date(data.scheduledAt),
                isDraft: false,
                published: false, // Not published yet
                contentFormat: data.contentFormat || "TEXT",
                attachments: data.attachments ? {
                    create: data.attachments.map((url, i) => ({
                        url,
                        type: url.includes("video") ? "VIDEO" : "IMAGE",
                        order: i
                    }))
                } : undefined,
            }
        });

        revalidatePath("/");
        return { success: true, post };
    } catch (error) {
        console.error("Error scheduling post:", error);
        return { success: false, error: "Échec de la programmation" };
    }
}

export async function getScheduledPosts() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié", posts: [] };
    }

    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: session.user.id,
                scheduledAt: { not: null },
                published: false,
                isDraft: false,
            },
            include: {
                attachments: true,
            },
            orderBy: { scheduledAt: "asc" },
        });

        return { success: true, posts };
    } catch (error) {
        console.error("Error fetching scheduled posts:", error);
        return { success: false, error: "Échec du chargement", posts: [] };
    }
}

export async function cancelScheduledPost(postId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        // Convert to draft instead of deleting
        await prisma.post.update({
            where: { id: postId, authorId: session.user.id },
            data: {
                scheduledAt: null,
                isDraft: true,
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error canceling scheduled post:", error);
        return { success: false, error: "Échec de l'annulation" };
    }
}

// --- THREADS ---

export async function createThread(posts: Array<{
    content: string;
    type?: string;
    image?: string;
    attachments?: string[];
}>) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    if (posts.length < 2) {
        return { success: false, error: "Un thread nécessite au moins 2 posts" };
    }

    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        const createdPosts = await Promise.all(
            posts.map((post, index) =>
                prisma.post.create({
                    data: {
                        authorId: session.user.id,
                        content: post.content,
                        type: post.type || "TEXT",
                        image: post.image,
                        threadId,
                        threadOrder: index,
                        published: true,
                        publishedAt: new Date(),
                        attachments: post.attachments ? {
                            create: post.attachments.map((url, i) => ({
                                url,
                                type: url.includes("video") ? "VIDEO" : "IMAGE",
                                order: i
                            }))
                        } : undefined,
                    }
                })
            )
        );

        revalidatePath("/");
        return { success: true, threadId, posts: createdPosts };
    } catch (error) {
        console.error("Error creating thread:", error);
        return { success: false, error: "Échec de la création du thread" };
    }
}

export async function getThread(threadId: string) {
    try {
        const posts = await prisma.post.findMany({
            where: { threadId },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                attachments: true,
            },
            orderBy: { threadOrder: "asc" },
        });

        return { success: true, posts };
    } catch (error) {
        console.error("Error fetching thread:", error);
        return { success: false, error: "Thread non trouvé", posts: [] };
    }
}

// --- COLLABORATION ---

export async function inviteCollaborator(postId: string, userId: string, role: "CONTRIBUTOR" | "CO_AUTHOR" = "CONTRIBUTOR") {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        // Verify post ownership
        const post = await prisma.post.findFirst({
            where: { id: postId, authorId: session.user.id }
        });

        if (!post) {
            return { success: false, error: "Post non trouvé ou accès refusé" };
        }

        // Check if already invited
        const existing = await prisma.postCollaborator.findUnique({
            where: { postId_userId: { postId, userId } }
        });

        if (existing) {
            return { success: false, error: "Utilisateur déjà invité" };
        }

        const collaborator = await prisma.postCollaborator.create({
            data: {
                postId,
                userId,
                role,
                status: "PENDING",
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } }
            }
        });

        return { success: true, collaborator };
    } catch (error) {
        console.error("Error inviting collaborator:", error);
        return { success: false, error: "Échec de l'invitation" };
    }
}

export async function respondToCollaboration(postId: string, accept: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        const updated = await prisma.postCollaborator.update({
            where: { postId_userId: { postId, userId: session.user.id } },
            data: { status: accept ? "ACCEPTED" : "DECLINED" }
        });

        return { success: true, collaborator: updated };
    } catch (error) {
        console.error("Error responding to collaboration:", error);
        return { success: false, error: "Invitation non trouvée" };
    }
}

export async function getCollaborationInvites() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, invites: [] };
    }

    try {
        const invites = await prisma.postCollaborator.findMany({
            where: {
                userId: session.user.id,
                status: "PENDING",
            },
            include: {
                post: {
                    include: {
                        author: { select: { id: true, name: true, avatar: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, invites };
    } catch (error) {
        console.error("Error fetching collaboration invites:", error);
        return { success: false, invites: [] };
    }
}

// --- LINK PREVIEW ---

export async function fetchLinkPreview(url: string) {
    try {
        // Validate URL
        const urlObj = new URL(url);

        // Fetch the page
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Transpareo/1.0; +https://transpareo.com)"
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            return { success: false, error: "Impossible de récupérer le lien" };
        }

        const html = await response.text();

        // Extract Open Graph metadata
        const getMetaContent = (property: string) => {
            const match = html.match(new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"))
                || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`, "i"));
            return match ? match[1] : null;
        };

        // Get title
        const ogTitle = getMetaContent("og:title");
        const twitterTitle = getMetaContent("twitter:title");
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = ogTitle || twitterTitle || (titleMatch ? titleMatch[1] : urlObj.hostname);

        // Get description
        const ogDescription = getMetaContent("og:description");
        const twitterDescription = getMetaContent("twitter:description");
        const metaDescription = getMetaContent("description");
        const description = ogDescription || twitterDescription || metaDescription || null;

        // Get image
        const ogImage = getMetaContent("og:image");
        const twitterImage = getMetaContent("twitter:image");
        let imageUrl = ogImage || twitterImage || null;

        // Make image URL absolute if needed
        if (imageUrl && !imageUrl.startsWith("http")) {
            imageUrl = new URL(imageUrl, url).href;
        }

        // Get site name
        const siteName = getMetaContent("og:site_name") || urlObj.hostname;

        // Get favicon
        const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
        let faviconUrl = faviconMatch ? faviconMatch[1] : `//${urlObj.hostname}/favicon.ico`;
        if (faviconUrl && !faviconUrl.startsWith("http")) {
            faviconUrl = new URL(faviconUrl, url).href;
        }

        // Determine type
        const ogType = getMetaContent("og:type");
        const type = ogType?.includes("video") ? "VIDEO" : ogType?.includes("article") ? "LINK" : "LINK";

        return {
            success: true,
            preview: {
                url,
                title,
                description,
                imageUrl,
                siteName,
                faviconUrl,
                type,
            }
        };
    } catch (error) {
        console.error("Error fetching link preview:", error);
        return { success: false, error: "URL invalide ou inaccessible" };
    }
}

// --- CODE BLOCKS ---

export async function addCodeBlock(postId: string, codeBlock: {
    language: string;
    code: string;
    filename?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        // Verify ownership
        const post = await prisma.post.findFirst({
            where: { id: postId, authorId: session.user.id }
        });

        if (!post) {
            return { success: false, error: "Post non trouvé" };
        }

        // Get max order
        const maxOrder = await prisma.postCodeBlock.aggregate({
            where: { postId },
            _max: { order: true }
        });

        const block = await prisma.postCodeBlock.create({
            data: {
                postId,
                language: codeBlock.language,
                code: codeBlock.code,
                filename: codeBlock.filename,
                order: (maxOrder._max.order ?? -1) + 1,
            }
        });

        return { success: true, codeBlock: block };
    } catch (error) {
        console.error("Error adding code block:", error);
        return { success: false, error: "Échec de l'ajout" };
    }
}

// --- MAP EMBEDS ---

export async function addMapEmbed(postId: string, mapData: {
    latitude: number;
    longitude: number;
    address?: string;
    zoomLevel?: number;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        const post = await prisma.post.findFirst({
            where: { id: postId, authorId: session.user.id }
        });

        if (!post) {
            return { success: false, error: "Post non trouvé" };
        }

        const embed = await prisma.postMapEmbed.create({
            data: {
                postId,
                latitude: mapData.latitude,
                longitude: mapData.longitude,
                address: mapData.address,
                zoomLevel: mapData.zoomLevel || 15,
            }
        });

        return { success: true, mapEmbed: embed };
    } catch (error) {
        console.error("Error adding map embed:", error);
        return { success: false, error: "Échec de l'ajout" };
    }
}

// --- PUBLISH SCHEDULED POSTS (for CRON) ---

export async function publishScheduledPosts() {
    try {
        const now = new Date();

        const postsToPublish = await prisma.post.findMany({
            where: {
                scheduledAt: { lte: now },
                published: false,
                isDraft: false,
            }
        });

        const results = await Promise.all(
            postsToPublish.map(post =>
                prisma.post.update({
                    where: { id: post.id },
                    data: {
                        published: true,
                        publishedAt: now,
                        scheduledAt: null,
                    }
                })
            )
        );

        return { success: true, publishedCount: results.length };
    } catch (error) {
        console.error("Error publishing scheduled posts:", error);
        return { success: false, error: "Erreur CRON" };
    }
}
