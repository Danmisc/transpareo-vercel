"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { handleAction } from "@/lib/gamification";
import { moderationService } from "@/lib/services/moderation.service";
import { pusherServer } from "@/lib/pusher";

export async function createNotification(
    recipientId: string,
    type: string, // LIKE, COMMENT, REPLY, MENTION, FOLLOW, SYSTEM
    senderId?: string,
    postId?: string,
    commentId?: string,
    message?: string
) {
    if (recipientId === senderId) return; // Don't notify self

    try {
        const notification = await prisma.notification.create({
            data: {
                userId: recipientId,
                type,
                senderId,
                postId,
                commentId,
                message
            },
            include: {
                sender: { select: { name: true, avatar: true } }
            }
        });

        // Trigger Real-time Event
        await pusherServer.trigger(`user-${recipientId}`, "new-notification", notification);

    } catch (error) {
        console.error("Failed to create notification", error);
    }
}

export async function getNotifications(userId: string) {
    try {
        const notifs = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
                sender: { select: { name: true, avatar: true } },
                post: { select: { content: true } },
                comment: { select: { content: true } }
            }
        });
        return { success: true, data: notifs };
    } catch (error) {
        return { success: false, error: "Failed to fetch notifications" };
    }
}

export async function markNotificationRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to mark read" };
    }
}

export async function markAllNotificationsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to mark all read" };
    }
}

export async function createReport(
    reporterId: string | undefined, // undefined for anonymous (if logic allows)
    targetType: "POST" | "COMMENT" | "USER",
    targetId: string,
    reason: string,
    details?: string
) {
    try {
        await prisma.report.create({
            data: {
                reporterId,
                targetType,
                targetId,
                reason,
                details
            }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to report" };
    }
}

export async function updateProfile(userId: string, data: {
    name: string;
    bio: string;
    location: string;
    website?: string;
    coverImage?: string;
    avatar?: string;
    links?: string;
}) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                bio: data.bio,
                location: data.location,
                website: data.website,
                coverImage: data.coverImage,
                avatar: data.avatar,
                links: data.links ? JSON.stringify(data.links) : undefined
            }
        });
        revalidatePath(`/profile/${userId}`);
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update profile" };
    }
}


// --- COMMENTS MODERATION ---

export async function deleteComment(commentId: string, userId: string) {
    try {
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return { success: false, error: "Not found" };

        // Allow author of comment OR author of post to delete? 
        // For now: Only author of comment 
        // (Real app: Moderator role too)
        if (comment.userId !== userId) return { success: false, error: "Unauthorized" };

        await prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() }
        });

        revalidatePath("/");
        revalidatePath(`/profile/${userId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete" };
    }
}

export async function pinComment(commentId: string, userId: string) {
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { post: true }
        });
        if (!comment) return { success: false, error: "Not found" };

        // Only Post Author can pin
        if (comment.post.authorId !== userId) return { success: false, error: "Unauthorized" };

        await prisma.comment.update({
            where: { id: commentId },
            data: { isPinned: !comment.isPinned }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to pin" };
    }
}

export async function flagComment(commentId: string, userId: string, reason: string) {
    // For MVP: Log to console or create a 'FLAG' interaction
    // We'll create a CommentInteraction
    try {
        await prisma.commentInteraction.create({
            data: {
                userId,
                commentId,
                type: "FLAG",
                value: reason
            }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to flag" };
    }
}


// --- COMMENTS ---

// --- POSTS ---

// --- REELS ALGORITHM INTEGRATION ---
import { rankingService } from "@/lib/ranking";
import { auth } from "@/lib/auth";

export async function getReels(page: number = 1, limit: number = 10) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        // Fetch User Profile for Location Context
        let userLocation = null;
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { location: true }
            });
            userLocation = user?.location;
        }

        // Use Unified Engine with VIDEO type filter
        const posts = await rankingService.getRankedFeed(userId || "anonymous", {
            type: "VIDEO",
            limit,
            userLocation
        });

        return { success: true, data: posts };
    } catch (error) {
        console.error("Failed to fetch reels:", error);
        return { success: false, error: "Failed to fetch reels" };
    }
}

export async function createPost(
    userId: string,
    content: string,
    type: string = "TEXT",
    image?: string,
    metadata?: any,
    tags?: string[],
    location?: string,
    formData?: FormData
) {
    try {
        const extractedTags = (content.match(/#\w+/g) || []).map(t => t.substring(1).toLowerCase());
        const uniqueTags = [...new Set([...extractedTags, ...(tags || [])])];


        const validTypes = ["TEXT", "IMAGE", "VIDEO", "POLL", "EVENT", "PROPERTY", "LIVESTREAM"];
        if (!validTypes.includes(type)) {
            return { success: false, error: "Invalid post type" };
        }

        // --- MODERATION CHECK ---
        const moderation = await moderationService.analyzeText(content);
        if (moderation.flagged) {
            return {
                success: false,
                error: `Contenu refusé par la modération (${moderation.categories.join(", ")})`
            };
        }

        // --- VIDEO / REEL METADATA ---
        let videoData = undefined;
        let videoCategory = undefined;
        let visibility = "PUBLIC";

        if (type === "VIDEO" && formData?.get('videoUrl')) {
            videoData = {
                create: {
                    url: formData.get('videoUrl') as string,
                    thumbnail: formData.get('thumbnail') as string,
                    duration: formData.get('duration') ? parseFloat(formData.get('duration') as string) : 0,
                    resolution: formData.get('resolution') as string,
                    aspectRatio: formData.get('aspectRatio') as string,
                }
            };
            videoCategory = formData.get('videoCategory') as string;
            visibility = formData.get('visibility') as string || "PUBLIC";
        }

        const post = await prisma.post.create({
            data: {
                content,
                image,
                type,
                authorId: userId,
                metadata: metadata ? JSON.stringify(metadata) : undefined,
                hashtags: {
                    connectOrCreate: uniqueTags.map(tag => ({
                        where: { tag },
                        create: { tag }
                    }))
                },
                location, // Add location support

                // Enhanced Video Fields
                video: videoData,
                videoCategory,
                visibility,
                // Add default publish options if provided
                allowComments: formData?.get('allowComments') !== 'false',
                published: true, // Keep published true by default as in original

                // Link Community if present
                communityId: formData?.get('communityId') as string || undefined,
            },
            include: {
                author: true,
                video: true
            }
        });

        // Notify followers (Async in prod)
        const followers = await prisma.follow.findMany({
            where: { followingId: userId, isMuted: false },
            select: { followerId: true }
        });

        // Gamification
        await handleAction(userId, "POST_CREATED");

        // --- REAL-TIME FEED UPDATE ---
        // Trigger generic "new-post" event for the global feed
        // In a real app, strict following feeds would require fan-out or client-side filtering
        // For this MVP, we broadcast to 'feed-global' and let clients decide or just show "New Content"
        await pusherServer.trigger("feed-global", "new-post", post);

        if (followers.length > 0) {
            // ...
            await Promise.all(followers.map(f =>
                createNotification(
                    f.followerId,
                    "POST",
                    userId,
                    post.id,
                    undefined,
                    "a publié un nouveau post."
                )
            ));
        }

        revalidatePath("/");
        revalidatePath(`/profile/${userId}`);
        return { success: true, data: post };
    } catch (error) {
        console.error("Error creating post:", error);
        return { success: false, error: "Failed to create post" };
    }
}

export async function createLiveStream(userId: string, title: string) {
    try {
        const post = await prisma.post.create({
            data: {
                content: title, // Title acts as content
                type: "LIVESTREAM",
                authorId: userId,
                published: true,
                liveStream: {
                    create: {
                        status: "LIVE",
                        startedAt: new Date(),
                    }
                }
            }
        });

        // Notify followers
        // (Similar logic to createPost, maybe specific "LIVE" notification)

        revalidatePath("/");
        return { success: true, id: post.id };
    } catch (error) {
        console.error("Failed to go live:", error);
        return { success: false, error: "Failed to start live" };
    }
}

export async function stopLiveStream(liveStreamId: string) {
    try {
        await prisma.liveStream.update({
            where: { id: liveStreamId }, // Wait, liveStreamId might be the ID of the LiveStream record, accessing by it is fine if we have it. Or by postId.
            // Let's assume we pass the LiveStream ID or the Post ID. 
            // Better by Post ID usually. but page has Post ID? 
            // The table has `id`.
            data: {
                status: "ENDED",
                endedAt: new Date()
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to stop stream" };
    }
}

// ... (unchanged)

// --- COMMENTS ---

export async function addComment(postId: string, userId: string, content: string, parentId?: string, media?: string) {
    try {
        // ... (moderation check unchanged)
        const moderation = await moderationService.analyzeText(content);
        if (moderation.flagged) {
            return {
                success: false,
                error: `Commentaire refusé par la modération (${moderation.categories.join(", ")})`
            };
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                media,
                postId,
                userId,
                parentId
            },
            include: {
                post: { select: { authorId: true } },
                parent: { select: { userId: true } }
            }
        });

        // --- REAL-TIME UPDATE ---
        const commentCount = await prisma.comment.count({ where: { postId } });
        await pusherServer.trigger(`post-${postId}`, "comment-update", {
            postId,
            count: commentCount,
            latestComment: { ...comment }
        });

        // Notify Post Author
        if (comment.post.authorId !== userId) {
            await createNotification(comment.post.authorId, "COMMENT", userId, postId, comment.id, content.substring(0, 50));
            // Gamification: "Recevoir un commentaire" (+ points for post author)
            await handleAction(comment.post.authorId, "COMMENT_CREATED");
        }

        // Notify Parent Comment Author (if reply)
        if (parentId && comment.parent && comment.parent.userId !== userId) {
            // If parent author is same as post author, maybe don't double notify? Or strictly separate types?
            // Let's notify separatedly as "REPLY"
            if (comment.parent.userId !== comment.post.authorId) {
                await createNotification(comment.parent.userId, "REPLY", userId, postId, comment.id, content.substring(0, 50));
            }
        }

        revalidatePath("/"); // Revalidate feed
        return { success: true, data: comment };
    } catch (error) {
        console.error("Error adding comment:", error);
        return { success: false, error: "Failed to add comment" };
    }
}

export async function getComments(postId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { postId, parentId: null }, // Fetch top-level comments
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                _count: { select: { interactions: true, children: true } },
                interactions: true, // needed to check if user liked? simpler:
                // actually we need to check if current user liked. 
                // For MVP, just returning count. Enhancing later for "isLiked".
                children: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } },
                        _count: { select: { interactions: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const session = await auth();
        const userId = session?.user?.id;

        const enhancedComments = comments.map(c => ({
            ...c,
            userHasLiked: userId ? c.interactions.some(i => i.userId === userId && i.type === "REACTION") : false,
            replies: c.children.map(child => ({
                ...child,
                // simplified for children
            }))
        }));

        return { success: true, data: enhancedComments };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { success: false, error: "Failed to fetch comments" };
    }
}

// --- REACTIONS (Emoji) ---

export async function toggleReaction(targetId: string, userId: string, targetType: "POST" | "COMMENT", reactionType: "REACTION", value?: string) {
    try {
        if (targetType === "POST") {
            const existing = await prisma.interaction.findFirst({
                where: { userId, postId: targetId, type: "REACTION" }
            });

            if (existing) {
                if (existing.value === value) {
                    await prisma.interaction.delete({ where: { id: existing.id } });
                } else {
                    await prisma.interaction.update({ where: { id: existing.id }, data: { value } });
                }
            } else {
                await prisma.interaction.create({
                    data: { userId, postId: targetId, type: "REACTION", value }
                });

                // Notify
                const post = await prisma.post.findUnique({ where: { id: targetId }, select: { authorId: true } });
                if (post && post.authorId !== userId) {
                    await createNotification(post.authorId, "LIKE", userId, targetId, undefined, value);
                    // Gamification: "Recevoir un Like"
                    await handleAction(post.authorId, "LIKE_RECEIVED");
                }
            }

            // --- REAL-TIME UPDATE ---
            // Recalculate generic "likes" (or strictly counting reactions)
            const count = await prisma.interaction.count({
                where: { postId: targetId, type: "REACTION" }
            });

            await pusherServer.trigger(`post-${targetId}`, "reaction-update", {
                postId: targetId,
                count,
                triggerUserId: userId,
                reaction: value // '❤️', '👍', etc.
            });

        } else {
            // COMMENT
            const existing = await prisma.commentInteraction.findFirst({
                where: { userId, commentId: targetId, type: "REACTION" }
            });

            if (existing) {
                if (existing.value === value) {
                    await prisma.commentInteraction.delete({ where: { id: existing.id } });
                } else {
                    await prisma.commentInteraction.update({ where: { id: existing.id }, data: { value } });
                }
            } else {
                await prisma.commentInteraction.create({
                    data: { userId, commentId: targetId, type: "REACTION", value }
                });

                // Notify (optional for comment likes)
            }

            // --- REAL-TIME UPDATE (Optional for comments for now, keeping generic)
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error toggling reaction:", error);
        return { success: false, error: "Failed to react" };
    }
}



// --- AUTH ---
export async function registerUser(name: string, email: string, password?: string, role: string = "TENANT") {
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { success: false, error: "Cet email est déjà utilisé." };
        }

        await prisma.user.create({
            data: {
                name,
                email,
                password,
                role, // Save the selected role
                image: "/avatars/default.svg"
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Echec de l'inscription." };
    }
}

// --- NOTIFICATION SETTINGS ---
export async function getNotificationSettings(userId: string) {
    try {
        const settings = await prisma.notificationSettings.findUnique({
            where: { userId }
        });

        // Return default if not found
        if (!settings) {
            return {
                userId,
                emailNotifications: true,
                pushNotifications: true,
                notifyOnLike: true,
                notifyOnComment: true,
                notifyOnMention: true,
                notifyOnFollow: true
            };
        }

        return settings;
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return null;
    }
}

export async function updateNotificationSettings(
    userId: string,
    data: {
        emailNotifications?: boolean;
        pushNotifications?: boolean;
        notifyOnLike?: boolean;
        notifyOnComment?: boolean;
        notifyOnMention?: boolean;
        notifyOnFollow?: boolean;
    }
) {
    try {
        const settings = await prisma.notificationSettings.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data
            }
        });

        revalidatePath("/notifications/settings");
        return { success: true, data: settings };
    } catch (error) {
        console.error("Failed to update settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

export async function togglePinPost(userId: string, postId: string) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: "User not found" };

        if (user.pinnedPostId === postId) {
            // Unpin
            await prisma.user.update({
                where: { id: userId },
                data: { pinnedPostId: null }
            });
        } else {
            // Pin (overwrite existing)
            await prisma.user.update({
                where: { id: userId },
                data: { pinnedPostId: postId }
            });
        }
        revalidatePath(`/profile/${userId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to toggle pin" };
    }
}

export async function getFollowers(userId: string) {
    try {
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: { follower: { select: { id: true, name: true, avatar: true, bio: true } } }
        });
        return { success: true, data: followers.map(f => f.follower) };
    } catch (error) {
        return { success: false, error: "Failed to fetch followers" };
    }
}

export async function getFollowing(userId: string) {
    try {
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: { select: { id: true, name: true, avatar: true, bio: true } } }
        });
        return { success: true, data: following.map(f => f.following) };
    } catch (error) {
        return { success: false, error: "Failed to fetch following" };
    }
}

// --- SAVES / BOOKMARKS ---

export async function toggleSave(userId: string, postId: string) {
    try {
        const existing = await prisma.savedPost.findFirst({
            where: { userId, postId }
        });

        if (existing) {
            await prisma.savedPost.deleteMany({
                where: { userId, postId }
            });
            revalidatePath("/");
            return { success: true, saved: false };
        } else {
            await prisma.savedPost.create({
                data: {
                    userId,
                    postId
                }
            });
            revalidatePath("/");
            return { success: true, saved: true };
        }
    } catch (error) {
        console.error("Error toggling save:", error);
        return { success: false, error: "Failed to save" };
    }
}


// --- FOLLOW SYSTEM ---

export async function toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) return { success: false, error: "Cannot follow self" };

    try {
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });

        if (existing) {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId
                    }
                }
            });
            revalidatePath("/profile");
            return { success: true, following: false };
        } else {
            await prisma.follow.create({
                data: {
                    followerId,
                    followingId
                }
            });

            await createNotification(followingId, "FOLLOW", followerId, undefined, undefined, "a commencé à vous suivre.");
            await handleAction(followerId, "FOLLOW_USER");

            revalidatePath("/profile");
            return { success: true, following: true };
        }
    } catch (error) {
        console.error("Error toggling follow:", error);
        return { success: false, error: "Failed to follow" };
    }
}
