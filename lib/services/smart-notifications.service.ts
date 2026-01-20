import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/actions";
import { pusherServer } from "@/lib/pusher";

// ========================================
// SMART NOTIFICATIONS SERVICE
// LinkedIn-style engagement notifications
// ========================================

const MILESTONES = {
    PROFILE_VIEWS: [10, 25, 50, 100, 250, 500, 1000],
    POST_LIKES: [10, 25, 50, 100, 250, 500, 1000],
    FOLLOWERS: [10, 25, 50, 100, 250, 500, 1000, 5000],
};

export const smartNotificationsService = {
    /**
     * Check and send profile view milestone notification
     */
    checkProfileViewsMilestone: async (userId: string): Promise<void> => {
        try {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const viewCount = await prisma.profileView.count({
                where: {
                    viewedId: userId,
                    createdAt: { gte: weekAgo }
                }
            });

            // Check if we hit a milestone
            const milestone = MILESTONES.PROFILE_VIEWS.find(m => viewCount === m);

            if (milestone) {
                await createNotification(
                    userId,
                    "PROFILE_VIEWS",
                    undefined,
                    undefined,
                    undefined,
                    `👁️ Votre profil a été vu ${milestone} fois cette semaine!`
                );

                // Real-time push
                await pusherServer.trigger(`user-${userId}`, "smart-notification", {
                    type: "PROFILE_VIEWS",
                    message: `👁️ Votre profil a été vu ${milestone} fois cette semaine!`,
                    milestone
                });
            }
        } catch (error) {
            console.error("[Smart Notifications] Profile views error:", error);
        }
    },

    /**
     * Check if post is trending (10+ reactions in 1 hour)
     */
    checkPostTrending: async (postId: string, authorId: string): Promise<void> => {
        try {
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

            const recentReactions = await prisma.interaction.count({
                where: {
                    postId,
                    type: { in: ["LIKE", "REACTION"] },
                    createdAt: { gte: hourAgo }
                }
            });

            if (recentReactions >= 10) {
                // Check if we already sent this notification today
                const existingNotif = await prisma.notification.findFirst({
                    where: {
                        recipientId: authorId,
                        type: "POST_TRENDING",
                        postId,
                        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    }
                });

                if (!existingNotif) {
                    await createNotification(
                        authorId,
                        "POST_TRENDING",
                        undefined,
                        postId,
                        undefined,
                        `🔥 Votre post est populaire! ${recentReactions} réactions dans la dernière heure`
                    );

                    await pusherServer.trigger(`user-${authorId}`, "smart-notification", {
                        type: "POST_TRENDING",
                        message: "🔥 Votre post est populaire!",
                        postId,
                        reactions: recentReactions
                    });
                }
            }
        } catch (error) {
            console.error("[Smart Notifications] Post trending error:", error);
        }
    },

    /**
     * Check post likes milestone
     */
    checkPostLikesMilestone: async (postId: string, authorId: string): Promise<void> => {
        try {
            const likeCount = await prisma.interaction.count({
                where: {
                    postId,
                    type: { in: ["LIKE", "REACTION"] }
                }
            });

            const milestone = MILESTONES.POST_LIKES.find(m => likeCount === m);

            if (milestone) {
                await createNotification(
                    authorId,
                    "MILESTONE",
                    undefined,
                    postId,
                    undefined,
                    `🎉 Félicitations! ${milestone} personnes ont aimé votre post`
                );

                await pusherServer.trigger(`user-${authorId}`, "smart-notification", {
                    type: "MILESTONE",
                    message: `🎉 ${milestone} personnes ont aimé votre post!`,
                    postId,
                    milestone
                });
            }
        } catch (error) {
            console.error("[Smart Notifications] Post milestone error:", error);
        }
    },

    /**
     * Check follower milestones
     */
    checkFollowerMilestone: async (userId: string): Promise<void> => {
        try {
            const followerCount = await prisma.follow.count({
                where: { followingId: userId }
            });

            const milestone = MILESTONES.FOLLOWERS.find(m => followerCount === m);

            if (milestone) {
                await createNotification(
                    userId,
                    "MILESTONE",
                    undefined,
                    undefined,
                    undefined,
                    `🎯 Vous avez atteint ${milestone} abonnés! Continuez comme ça!`
                );

                await pusherServer.trigger(`user-${userId}`, "smart-notification", {
                    type: "FOLLOWER_MILESTONE",
                    message: `🎯 Vous avez atteint ${milestone} abonnés!`,
                    milestone
                });
            }
        } catch (error) {
            console.error("[Smart Notifications] Follower milestone error:", error);
        }
    },

    /**
     * Generate weekly summary notification (call from cron)
     */
    generateWeeklySummary: async (userId: string): Promise<void> => {
        try {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            // Get weekly stats
            const [profileViews, newFollowers, totalLikes, totalComments] = await Promise.all([
                prisma.profileView.count({
                    where: { viewedId: userId, createdAt: { gte: weekAgo } }
                }),
                prisma.follow.count({
                    where: { followingId: userId, createdAt: { gte: weekAgo } }
                }),
                prisma.interaction.count({
                    where: {
                        post: { authorId: userId },
                        type: { in: ["LIKE", "REACTION"] },
                        createdAt: { gte: weekAgo }
                    }
                }),
                prisma.comment.count({
                    where: {
                        post: { authorId: userId },
                        createdAt: { gte: weekAgo }
                    }
                })
            ]);

            // Only send if there's meaningful activity
            if (profileViews > 0 || newFollowers > 0 || totalLikes > 0) {
                const parts = [];
                if (profileViews > 0) parts.push(`${profileViews} vues profil`);
                if (newFollowers > 0) parts.push(`+${newFollowers} abonnés`);
                if (totalLikes > 0) parts.push(`${totalLikes} j'aime`);
                if (totalComments > 0) parts.push(`${totalComments} commentaires`);

                await createNotification(
                    userId,
                    "WEEKLY_SUMMARY",
                    undefined,
                    undefined,
                    undefined,
                    `📊 Résumé de la semaine: ${parts.join(", ")}`
                );
            }
        } catch (error) {
            console.error("[Smart Notifications] Weekly summary error:", error);
        }
    },

    /**
     * Detect engagement spike (3x normal engagement)
     */
    checkEngagementSpike: async (userId: string): Promise<void> => {
        try {
            const now = new Date();
            const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Get average daily engagement last week
            const weeklyEngagement = await prisma.interaction.count({
                where: {
                    post: { authorId: userId },
                    createdAt: { gte: weekAgo, lt: dayAgo }
                }
            });
            const avgDailyEngagement = weeklyEngagement / 6;

            // Get today's engagement
            const todayEngagement = await prisma.interaction.count({
                where: {
                    post: { authorId: userId },
                    createdAt: { gte: dayAgo }
                }
            });

            // If 3x or more than average
            if (avgDailyEngagement > 0 && todayEngagement >= avgDailyEngagement * 3) {
                const increase = Math.round((todayEngagement / avgDailyEngagement - 1) * 100);

                await createNotification(
                    userId,
                    "ENGAGEMENT_SPIKE",
                    undefined,
                    undefined,
                    undefined,
                    `📈 Votre engagement est en hausse de ${increase}% aujourd'hui!`
                );
            }
        } catch (error) {
            console.error("[Smart Notifications] Engagement spike error:", error);
        }
    },

    /**
     * Profile completion reminder
     */
    checkProfileCompletion: async (userId: string): Promise<void> => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, bio: true, avatar: true, location: true }
            });

            if (!user) return;

            const missing = [];
            if (!user.bio) missing.push("bio");
            if (!user.avatar || user.avatar.includes("default")) missing.push("photo");
            if (!user.location) missing.push("localisation");

            if (missing.length > 0) {
                // Check if we sent this recently (last 7 days)
                const recentTip = await prisma.notification.findFirst({
                    where: {
                        recipientId: userId,
                        type: "SYSTEM_TIP",
                        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                    }
                });

                if (!recentTip) {
                    await createNotification(
                        userId,
                        "SYSTEM_TIP",
                        undefined,
                        undefined,
                        undefined,
                        `💡 Ajoutez votre ${missing[0]} pour augmenter votre visibilité de 30%`
                    );
                }
            }
        } catch (error) {
            console.error("[Smart Notifications] Profile completion error:", error);
        }
    },

    /**
     * Best time to post suggestion
     */
    suggestBestTimeToPost: async (userId: string): Promise<{ hour: number; day: string } | null> => {
        try {
            // Analyze when the user's posts get most engagement
            const posts = await prisma.post.findMany({
                where: { authorId: userId },
                include: {
                    interactions: true,
                    _count: { select: { interactions: true } }
                },
                take: 20,
                orderBy: { createdAt: "desc" }
            });

            if (posts.length < 5) return null;

            // Find posts with most engagement and their creation time
            const sortedByEngagement = posts.sort(
                (a, b) => b._count.interactions - a._count.interactions
            );
            const topPosts = sortedByEngagement.slice(0, 5);

            // Get most common hour
            const hours = topPosts.map(p => new Date(p.createdAt).getHours());
            const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length);

            const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
            const dayIndices = topPosts.map(p => new Date(p.createdAt).getDay());
            const mostCommonDay = days[dayIndices.sort((a, b) =>
                dayIndices.filter(v => v === a).length - dayIndices.filter(v => v === b).length
            ).pop()!];

            return { hour: avgHour, day: mostCommonDay };
        } catch (error) {
            console.error("[Smart Notifications] Best time error:", error);
            return null;
        }
    },

    /**
     * Network growth alert (5+ new followers in 24h)
     */
    checkNetworkGrowth: async (userId: string): Promise<void> => {
        try {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const newFollowers = await prisma.follow.count({
                where: {
                    followingId: userId,
                    createdAt: { gte: dayAgo }
                }
            });

            if (newFollowers >= 5) {
                // Check if already notified today
                const recentNotif = await prisma.notification.findFirst({
                    where: {
                        recipientId: userId,
                        type: "NETWORK_GROWTH",
                        createdAt: { gte: dayAgo }
                    }
                });

                if (!recentNotif) {
                    await createNotification(
                        userId,
                        "NETWORK_GROWTH",
                        undefined,
                        undefined,
                        undefined,
                        `🚀 Votre réseau grandit! +${newFollowers} nouveaux abonnés aujourd'hui`
                    );
                }
            }
        } catch (error) {
            console.error("[Smart Notifications] Network growth error:", error);
        }
    },

    /**
     * Generate daily digest notification
     */
    generateDailyDigest: async (userId: string): Promise<void> => {
        try {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const [views, likes, comments, followers] = await Promise.all([
                prisma.profileView.count({
                    where: { viewedId: userId, createdAt: { gte: dayAgo } }
                }),
                prisma.interaction.count({
                    where: {
                        post: { authorId: userId },
                        type: { in: ["LIKE", "REACTION"] },
                        createdAt: { gte: dayAgo }
                    }
                }),
                prisma.comment.count({
                    where: {
                        post: { authorId: userId },
                        createdAt: { gte: dayAgo }
                    }
                }),
                prisma.follow.count({
                    where: { followingId: userId, createdAt: { gte: dayAgo } }
                })
            ]);

            // Only send if there's activity
            if (views > 0 || likes > 0 || comments > 0 || followers > 0) {
                const parts: string[] = [];
                if (views > 0) parts.push(`${views} vue${views > 1 ? 's' : ''} profil`);
                if (likes > 0) parts.push(`${likes} j'aime`);
                if (comments > 0) parts.push(`${comments} commentaire${comments > 1 ? 's' : ''}`);
                if (followers > 0) parts.push(`+${followers} abonné${followers > 1 ? 's' : ''}`);

                await createNotification(
                    userId,
                    "DAILY_DIGEST",
                    undefined,
                    undefined,
                    undefined,
                    `📊 Hier: ${parts.join(", ")}`
                );

                await pusherServer.trigger(`user-${userId}`, "smart-notification", {
                    type: "DAILY_DIGEST",
                    message: `📊 Hier: ${parts.join(", ")}`,
                    data: { views, likes, comments, followers }
                });
            }
        } catch (error) {
            console.error("[Smart Notifications] Daily digest error:", error);
        }
    },

    /**
     * Property interest alert (for real estate)
     */
    checkPropertyInterest: async (propertyId: string, ownerId: string): Promise<void> => {
        try {
            // Check if property has significant interest
            const analytics = await prisma.propertyAnalytics.findFirst({
                where: { propertyId },
                orderBy: { date: "desc" }
            }).catch(() => null);

            if (!analytics) return;

            // Alert thresholds
            if (analytics.totalViews >= 50 && analytics.totalViews % 50 === 0) {
                await createNotification(
                    ownerId,
                    "PROPERTY_INTEREST",
                    undefined,
                    undefined,
                    undefined,
                    `🏠 Votre bien a été vu ${analytics.totalViews} fois!`
                );
            }

            if (analytics.contactClicks >= 5 && analytics.contactClicks % 5 === 0) {
                await createNotification(
                    ownerId,
                    "PROPERTY_LEADS",
                    undefined,
                    undefined,
                    undefined,
                    `📞 ${analytics.contactClicks} personnes ont cliqué pour vous contacter!`
                );
            }
        } catch (error) {
            console.error("[Smart Notifications] Property interest error:", error);
        }
    },

    /**
     * Best time to post suggestion
     */
    sendBestTimeAlert: async (userId: string): Promise<void> => {
        try {
            // Get recent interactions to find peak hours
            const recentInteractions = await prisma.interaction.findMany({
                where: {
                    post: { authorId: userId },
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                },
                select: { createdAt: true }
            });

            if (recentInteractions.length < 10) return;

            // Find peak hour
            const hourCounts = new Array(24).fill(0);
            recentInteractions.forEach(i => {
                hourCounts[new Date(i.createdAt).getHours()]++;
            });

            const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
            const currentHour = new Date().getHours();

            // If we're within 1 hour of peak time, send alert
            if (Math.abs(currentHour - peakHour) <= 1) {
                // Check if we already sent this today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const alreadySent = await prisma.notification.findFirst({
                    where: {
                        recipientId: userId,
                        type: "BEST_TIME",
                        createdAt: { gte: today }
                    }
                }).catch(() => null);

                if (!alreadySent) {
                    await createNotification(
                        userId,
                        "BEST_TIME",
                        undefined,
                        undefined,
                        undefined,
                        `⏰ C'est le meilleur moment pour poster! Vos abonnés sont actifs.`
                    );
                }
            }
        } catch (error) {
            console.error("[Smart Notifications] Best time error:", error);
        }
    },

    /**
     * Unlock achievement notification
     */
    checkAndUnlockAchievement: async (userId: string, achievementType: string): Promise<void> => {
        try {
            // Check if already unlocked
            const existing = await prisma.userAchievement.findUnique({
                where: { userId_type: { userId, type: achievementType } }
            }).catch(() => null);

            if (existing) return;

            // Achievement definitions
            const achievements: Record<string, { condition: () => Promise<boolean>; message: string }> = {
                FIRST_POST: {
                    condition: async () => {
                        const count = await prisma.post.count({ where: { authorId: userId } });
                        return count >= 1;
                    },
                    message: "🎉 Premier post publié!"
                },
                CONTENT_CREATOR: {
                    condition: async () => {
                        const count = await prisma.post.count({ where: { authorId: userId } });
                        return count >= 10;
                    },
                    message: "✍️ Créateur de contenu! 10 posts publiés"
                },
                RISING_STAR: {
                    condition: async () => {
                        const count = await prisma.follow.count({ where: { followingId: userId } });
                        return count >= 100;
                    },
                    message: "⭐ Rising Star! 100 abonnés atteints"
                },
                ENGAGEMENT_MASTER: {
                    condition: async () => {
                        const count = await prisma.interaction.count({
                            where: { post: { authorId: userId } }
                        });
                        return count >= 500;
                    },
                    message: "🔥 Engagement Master! 500 réactions reçues"
                },
                PROPERTY_EXPERT: {
                    condition: async () => {
                        const count = await prisma.listing.count({ where: { userId } }).catch(() => 0);
                        return count >= 5;
                    },
                    message: "🏠 Expert Immobilier! 5 biens publiés"
                }
            };

            const achievement = achievements[achievementType];
            if (!achievement) return;

            const unlocked = await achievement.condition();
            if (!unlocked) return;

            // Create achievement
            await prisma.userAchievement.create({
                data: {
                    userId,
                    type: achievementType,
                    progress: 100
                }
            }).catch(() => null);

            // Send notification
            await createNotification(
                userId,
                "ACHIEVEMENT",
                undefined,
                undefined,
                undefined,
                achievement.message
            );

            await pusherServer.trigger(`user-${userId}`, "smart-notification", {
                type: "ACHIEVEMENT",
                message: achievement.message,
                achievement: achievementType
            });
        } catch (error) {
            console.error("[Smart Notifications] Achievement error:", error);
        }
    },

    /**
     * Check all achievements for a user
     */
    checkAllAchievements: async (userId: string): Promise<void> => {
        const types = ["FIRST_POST", "CONTENT_CREATOR", "RISING_STAR", "ENGAGEMENT_MASTER", "PROPERTY_EXPERT"];

        for (const type of types) {
            await smartNotificationsService.checkAndUnlockAchievement(userId, type);
        }
    },

    /**
     * Inactive user reminder
     */
    sendInactiveReminder: async (userId: string): Promise<void> => {
        try {
            // Check last post date
            const lastPost = await prisma.post.findFirst({
                where: { authorId: userId },
                orderBy: { createdAt: "desc" },
                select: { createdAt: true }
            });

            if (!lastPost) return;

            const daysSincePost = Math.floor(
                (Date.now() - new Date(lastPost.createdAt).getTime()) / (24 * 60 * 60 * 1000)
            );

            // Remind after 7 days of inactivity
            if (daysSincePost >= 7 && daysSincePost % 7 === 0) {
                // Check if we sent reminder recently
                const recentReminder = await prisma.notification.findFirst({
                    where: {
                        recipientId: userId,
                        type: "INACTIVE_REMINDER",
                        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                    }
                }).catch(() => null);

                if (!recentReminder) {
                    await createNotification(
                        userId,
                        "INACTIVE_REMINDER",
                        undefined,
                        undefined,
                        undefined,
                        `👋 Vos abonnés vous attendent! Ça fait ${daysSincePost} jours sans publication.`
                    );
                }
            }
        } catch (error) {
            console.error("[Smart Notifications] Inactive reminder error:", error);
        }
    }
};
