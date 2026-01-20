"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { logSecurityEvent } from "@/lib/security";

// ========================================
// GDPR COMPLIANCE ACTIONS
// ========================================

/**
 * Export all user data in GDPR-compliant format
 * Right to Access (Article 15)
 */
export async function exportUserData() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        // Fetch all user data
        const [
            profile,
            posts,
            comments,
            interactions,
            messages,
            notifications,
            follows,
            savedPosts,
            searchHistory,
            securityLogs,
            wallet,
            investments
        ] = await Promise.all([
            // Core profile
            prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    bio: true,
                    location: true,
                    website: true,
                    role: true,
                    company: true,
                    school: true,
                    industry: true,
                    headline: true,
                    createdAt: true,
                    updatedAt: true,
                    phoneNumber: true,
                    isVerified: true
                }
            }),

            // Posts
            prisma.post.findMany({
                where: { authorId: user.id },
                select: {
                    id: true,
                    content: true,
                    type: true,
                    image: true,
                    location: true,
                    createdAt: true,
                    published: true
                }
            }),

            // Comments
            prisma.comment.findMany({
                where: { userId: user.id },
                select: {
                    id: true,
                    content: true,
                    postId: true,
                    createdAt: true
                }
            }),

            // Interactions (likes, etc.)
            prisma.interaction.findMany({
                where: { userId: user.id },
                select: {
                    type: true,
                    postId: true,
                    createdAt: true
                }
            }),

            // Messages sent
            prisma.message.findMany({
                where: { senderId: user.id },
                select: {
                    content: true,
                    conversationId: true,
                    createdAt: true
                }
            }),

            // Notifications received
            prisma.notification.findMany({
                where: { userId: user.id },
                select: {
                    type: true,
                    message: true,
                    createdAt: true
                },
                take: 100
            }),

            // Follow relationships
            prisma.follow.findMany({
                where: { OR: [{ followerId: user.id }, { followingId: user.id }] },
                select: {
                    followerId: true,
                    followingId: true,
                    createdAt: true
                }
            }),

            // Saved posts
            prisma.savedPost.findMany({
                where: { userId: user.id },
                select: {
                    postId: true,
                    createdAt: true
                }
            }),

            // Search history
            prisma.searchHistory.findMany({
                where: { userId: user.id },
                select: {
                    query: true,
                    createdAt: true
                }
            }),

            // Security logs (last 50)
            prisma.securityLog.findMany({
                where: { userId: user.id },
                select: {
                    action: true,
                    status: true,
                    ipAddress: true,
                    createdAt: true
                },
                take: 50,
                orderBy: { createdAt: "desc" }
            }),

            // Wallet
            prisma.wallet.findUnique({
                where: { userId: user.id },
                select: {
                    balance: true,
                    invested: true,
                    createdAt: true
                }
            }),

            // Investments
            prisma.investment.findMany({
                where: { wallet: { userId: user.id } },
                select: {
                    amount: true,
                    status: true,
                    createdAt: true,
                    loan: { select: { title: true } }
                }
            })
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            exportFormat: "GDPR_ARTICLE_15",
            user: {
                profile,
                content: {
                    posts,
                    comments
                },
                activity: {
                    interactions,
                    savedPosts,
                    searchHistory
                },
                social: {
                    follows: {
                        following: follows.filter(f => f.followerId === user.id).length,
                        followers: follows.filter(f => f.followingId === user.id).length,
                        details: follows
                    }
                },
                communications: {
                    messages: messages.length,
                    notifications: notifications.length
                },
                financial: {
                    wallet,
                    investments
                },
                security: {
                    recentLogs: securityLogs
                }
            }
        };

        // Log export
        await logSecurityEvent(user.id, "GDPR_DATA_EXPORT", "SUCCESS", {
            exportSize: JSON.stringify(exportData).length
        });

        return { success: true, data: exportData };

    } catch (error) {
        console.error("[GDPR] Export failed:", error);
        await logSecurityEvent(user.id, "GDPR_DATA_EXPORT", "FAILURE", {
            error: String(error)
        });
        return { success: false, error: "Échec de l'export des données" };
    }
}

/**
 * Delete user account and anonymize data
 * Right to Erasure (Article 17) - "Right to be Forgotten"
 */
export async function requestAccountDeletion(password: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        // Verify password for security
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { password: true }
        });

        if (dbUser?.password) {
            const bcrypt = await import("bcryptjs");
            const valid = await bcrypt.compare(password, dbUser.password);
            if (!valid) {
                return { success: false, error: "Mot de passe incorrect" };
            }
        }

        // Log deletion request
        await logSecurityEvent(user.id, "ACCOUNT_DELETION_REQUESTED", "SUCCESS", {});

        // Use transaction for atomic deletion
        await prisma.$transaction(async (tx) => {
            // 1. Anonymize posts (keep content for community, remove author link)
            await tx.post.updateMany({
                where: { authorId: user.id },
                data: {
                    content: "[Contenu supprimé]",
                    image: null,
                    metadata: null,
                    authorId: "DELETED_USER" // Point to anonymous user
                }
            });

            // 2. Delete comments
            await tx.comment.deleteMany({
                where: { userId: user.id }
            });

            // 3. Delete interactions
            await tx.interaction.deleteMany({
                where: { userId: user.id }
            });

            // 4. Delete messages (or anonymize)
            await tx.message.updateMany({
                where: { senderId: user.id },
                data: {
                    content: "[Message supprimé]",
                    isDeleted: true
                }
            });

            // 5. Delete notifications
            await tx.notification.deleteMany({
                where: { OR: [{ userId: user.id }, { senderId: user.id }] }
            });

            // 6. Delete follows
            await tx.follow.deleteMany({
                where: { OR: [{ followerId: user.id }, { followingId: user.id }] }
            });

            // 7. Delete saved posts
            await tx.savedPost.deleteMany({
                where: { userId: user.id }
            });

            // 8. Delete search history
            await tx.searchHistory.deleteMany({
                where: { userId: user.id }
            });

            // 9. Delete stories
            await tx.story.deleteMany({
                where: { userId: user.id }
            });

            // 10. Anonymize user profile
            await tx.user.update({
                where: { id: user.id },
                data: {
                    email: `deleted_${user.id}@anonymized.local`,
                    name: "Utilisateur supprimé",
                    password: null,
                    avatar: null,
                    bio: null,
                    location: null,
                    website: null,
                    coverImage: null,
                    phoneNumber: null,
                    links: null
                }
            });
        });

        // Final log
        await logSecurityEvent(user.id, "ACCOUNT_DELETED", "SUCCESS", {});

        return {
            success: true,
            message: "Votre compte a été supprimé. Vous serez déconnecté."
        };

    } catch (error) {
        console.error("[GDPR] Deletion failed:", error);
        await logSecurityEvent(user.id, "ACCOUNT_DELETION_FAILED", "FAILURE", {
            error: String(error)
        });
        return { success: false, error: "Échec de la suppression du compte" };
    }
}

/**
 * Get consent status for data processing
 */
export async function getConsentStatus() {
    const user = await getCurrentUser();
    if (!user) return null;

    const settings = await prisma.notificationSettings.findUnique({
        where: { userId: user.id },
        select: {
            emailNotifications: true,
            pushNotifications: true
        }
    });

    // Check for marketing consent (could be stored separately)
    // For MVP, using notification settings as proxy
    return {
        essential: true, // Always true (required for service)
        analytics: true, // For MVP, assumed
        marketing: settings?.emailNotifications ?? false,
        pushNotifications: settings?.pushNotifications ?? false
    };
}

/**
 * Update consent preferences
 */
export async function updateConsentPreferences(preferences: {
    marketing?: boolean;
    pushNotifications?: boolean;
    analytics?: boolean;
}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await prisma.notificationSettings.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                emailNotifications: preferences.marketing ?? true,
                pushNotifications: preferences.pushNotifications ?? true
            },
            update: {
                emailNotifications: preferences.marketing,
                pushNotifications: preferences.pushNotifications
            }
        });

        await logSecurityEvent(user.id, "CONSENT_UPDATED", "SUCCESS", preferences);

        return { success: true };
    } catch (error) {
        return { success: false, error: "Échec de la mise à jour" };
    }
}
