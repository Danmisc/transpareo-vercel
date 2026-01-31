"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfDay, subDays, format, eachDayOfInterval, isSameDay } from "date-fns";

// --- MIDDLEWARE / PERMISSION CHECK ---
async function checkModeratorPermission(communityId: string, userId: string) {
    const membership = await prisma.communityMember.findUnique({
        where: {
            communityId_userId: {
                communityId,
                userId
            }
        }
    });

    if (!membership || (membership.role !== "ADMIN" && membership.role !== "MODERATOR")) {
        throw new Error("Unauthorized");
    }
    return membership;
}

// --- FETCH DATA FOR DASHBOARD ---

export async function getCommunityDetailsForManagement(slug: string, userId: string) {
    try {
        const community = await prisma.community.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        members: true,
                        posts: true,
                        reports: { where: { status: "PENDING" } },
                        joinRequests: { where: { status: "PENDING" } },
                        invitations: { where: { status: "PENDING" } }
                    }
                }
            }
        });

        if (!community) throw new Error("Community not found");

        await checkModeratorPermission(community.id, userId);

        return { success: true, data: community };
    } catch (error) {
        return { success: false, error: "Access denied or not found" };
    }
}

export async function getCommunityMembers(
    communityId: string,
    userId: string,
    query: string = "",
    page: number = 1
) {
    try {
        await checkModeratorPermission(communityId, userId);

        const take = 20;
        const skip = (page - 1) * take;

        const members = await prisma.communityMember.findMany({
            where: {
                communityId,
                user: {
                    name: { contains: query, mode: "insensitive" }
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        email: true // Maybe restricted?
                    }
                }
            },
            take,
            skip,
            orderBy: { joinedAt: "desc" }
        });

        const total = await prisma.communityMember.count({
            where: {
                communityId,
                user: { name: { contains: query, mode: "insensitive" } }
            }
        });

        return { success: true, data: members, total, pages: Math.ceil(total / take) };
    } catch (error) {
        return { success: false, error: "Failed to fetch members" };
    }
}

export async function getModerationLogs(communityId: string, userId: string) {
    try {
        await checkModeratorPermission(communityId, userId);

        const logs = await prisma.communityModerationLog.findMany({
            where: { communityId },
            include: {
                moderator: { select: { name: true, avatar: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return { success: true, data: logs };
    } catch (error) {
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function getCommunityReports(communityId: string, userId: string) {
    try {
        await checkModeratorPermission(communityId, userId);

        const reports = await prisma.report.findMany({
            where: { communityId, status: "PENDING" },
            include: {
                reporter: { select: { name: true, avatar: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: reports };
    } catch (error) {
        return { success: false, error: "Failed to fetch reports" };
    }
}

// --- ACTIONS ---

export async function updateCommunitySettings(
    communityId: string,
    userId: string,
    settings: any,
    theme: any,
    details?: {
        name: string;
        description: string;
        privacy: "PUBLIC" | "PRIVATE" | "RESTRICTED";
        category?: string;
        image?: string;
        coverImage?: string;
        joinRequestsEnabled?: boolean;
    }
) {
    try {
        await checkModeratorPermission(communityId, userId);

        const dataToUpdate: any = {
            settings: JSON.stringify(settings),
            theme: JSON.stringify(theme)
        };

        if (details) {
            dataToUpdate.name = details.name;
            dataToUpdate.description = details.description;
            dataToUpdate.type = details.privacy;
            if (details.category !== undefined) dataToUpdate.category = details.category;
            if (details.image !== undefined) dataToUpdate.image = details.image;
            if (details.coverImage !== undefined) dataToUpdate.coverImage = details.coverImage;
            if (details.joinRequestsEnabled !== undefined) dataToUpdate.joinRequestsEnabled = details.joinRequestsEnabled;
        }

        await prisma.community.update({
            where: { id: communityId },
            data: dataToUpdate
        });

        await prisma.communityModerationLog.create({
            data: {
                communityId,
                moderatorId: userId,
                action: "UPDATE_SETTINGS",
                reason: "Updated community settings, theme, or basic info" // Update details to be more accurate
            }
        });

        revalidatePath(`/communities`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update settings" };
    }
}

export async function banUser(
    communityId: string,
    moderatorId: string,
    targetUserId: string,
    reason: string
) {
    try {
        await checkModeratorPermission(communityId, moderatorId);

        // 1. Create Ban Record
        await prisma.communityBannedUser.create({
            data: {
                communityId,
                userId: targetUserId,
                bannedBy: moderatorId,
                reason
            }
        });

        // 2. Kick from community (delete membership)
        await prisma.communityMember.delete({
            where: {
                communityId_userId: {
                    communityId,
                    userId: targetUserId
                }
            }
        });

        // 3. Log it
        await prisma.communityModerationLog.create({
            data: {
                communityId,
                moderatorId,
                action: "BAN_USER",
                targetId: targetUserId,
                reason
            }
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to ban user" };
    }
}

export async function kickUser(
    communityId: string,
    moderatorId: string,
    targetUserId: string
) {
    try {
        await checkModeratorPermission(communityId, moderatorId);

        // Delete membership
        await prisma.communityMember.delete({
            where: {
                communityId_userId: {
                    communityId,
                    userId: targetUserId
                }
            }
        });

        // Log it
        await prisma.communityModerationLog.create({
            data: {
                communityId,
                moderatorId,
                action: "KICK_USER",
                targetId: targetUserId
            }
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to kick user" };
    }
}

export async function resolveReport(
    communityId: string,
    moderatorId: string,
    reportId: string,
    action: "DISMISS" | "BAN_USER" | "DELETE_CONTENT"
) {
    try {
        await checkModeratorPermission(communityId, moderatorId);

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) throw new Error("Report not found");

        await prisma.report.update({
            where: { id: reportId },
            data: { status: "RESOLVED" } // Or store the resolution details
        });

        // Perform action if needed
        if (action === "BAN_USER") {
            // We need targetUserId. Report has targetId. 
            // If targetType is USER, use targetId.
            // If targetType is POST, fetch Post -> authorId.
            let targetUserId = report.targetType === "USER" ? report.targetId : null;

            if (report.targetType === "POST") {
                const post = await prisma.post.findUnique({ where: { id: report.targetId } });
                if (post) targetUserId = post.authorId;
            }

            if (targetUserId) {
                await banUser(communityId, moderatorId, targetUserId, `Report Resolved: ${report.reason}`);
            }
        } else if (action === "DELETE_CONTENT") {
            if (report.targetType === "POST") {
                await prisma.post.delete({ where: { id: report.targetId } });
            } else if (report.targetType === "COMMENT") {
                await prisma.comment.delete({ where: { id: report.targetId } });
            }
        }

        // Log the resolution
        await prisma.communityModerationLog.create({
            data: {
                communityId,
                moderatorId,
                action: `RESOLVE_REPORT_${action}`,
                targetId: reportId,
                reason: `Resolved report for ${report.targetType}`
            }
        });

        revalidatePath(`/communities`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to resolve report" };
    }
}


// --- ANALYTICS ---

interface AnalyticsDataPoint {
    date: string; // YYYY-MM-DD
    members: number;
    posts: number;
    comments: number;
    interactions: number;
    activeUsers: number;
}

interface AnalyticsSummary {
    totalMembers: number;
    memberGrowth: number; // Percent
    totalPosts: number;
    postGrowth: number;   // Percent
    engagementRate: number; // (Interactions + Comments) / Members / Days * 100
    topContributors: {
        id: string;
        name: string;
        avatar: string | null;
        score: number; // Weighted: 5*Post + 2*Comment + 1*Like
    }[];
    topPosts: {
        id: string;
        content: string;
        authorName: string;
        authorAvatar: string | null;
        views: number;
        likes: number;
        comments: number;
        score: number;
        date: string;
    }[];
    trafficSources: {
        name: string;
        value: number;
        percent: number;
    }[];
}

export async function getAdvancedCommunityAnalytics(
    communityId: string,
    userId: string,
    period: "7d" | "30d" | "90d" | "custom" = "30d",
    customFrom?: string,
    customTo?: string
) {
    try {
        await checkModeratorPermission(communityId, userId);

        // 1. Determine Date Range
        let endDate = new Date();
        let startDate = subDays(endDate, 30); // Default

        if (period === "custom" && customFrom && customTo) {
            startDate = new Date(customFrom);
            endDate = new Date(customTo);
        } else {
            const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
            startDate = subDays(endDate, days);
        }

        // Ensure startDate is start of day, endDate is end of day
        startDate = startOfDay(startDate);
        endDate = new Date(endDate.setHours(23, 59, 59, 999));

        const durationInMs = endDate.getTime() - startDate.getTime();
        const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
        const previousStartDate = subDays(startDate, durationInDays); // For comparison

        // 2. Fetch Data (Optimized with Promise.all)
        const [
            allMembersRaw,
            postsRaw,
            commentsRaw,
            interactionsRaw,
            previousPostsCount,
            previousMembersCount,
            postViewsRaw
        ] = await Promise.all([
            // Members (joinedAt)
            prisma.communityMember.findMany({
                where: { communityId },
                select: { userId: true, joinedAt: true }
            }),
            // Posts (createdAt) within range
            prisma.post.findMany({
                where: { communityId, createdAt: { gte: startDate } },
                select: {
                    id: true,
                    authorId: true,
                    createdAt: true,
                    content: true,
                    author: { select: { name: true, avatar: true } },
                    _count: { select: { comments: true, interactions: true, views: true } }
                }
            }),
            // Comments on community posts within range
            prisma.comment.findMany({
                where: {
                    post: { communityId },
                    createdAt: { gte: startDate }
                },
                select: { id: true, userId: true, createdAt: true }
            }),
            // Interactions on community posts within range
            prisma.interaction.findMany({
                where: {
                    post: { communityId },
                    createdAt: { gte: startDate }
                },
                select: { id: true, userId: true, createdAt: true }
            }),
            // Comparison Data (Counts only)
            prisma.post.count({
                where: {
                    communityId,
                    createdAt: { gte: previousStartDate, lt: startDate }
                }
            }),
            prisma.communityMember.count({
                where: {
                    communityId,
                    joinedAt: { lt: startDate }
                }
            }),
            // Views for Traffic Source
            prisma.postView.findMany({
                where: {
                    post: { communityId },
                    createdAt: { gte: startDate }
                },
                select: { source: true }
            })
        ]);

        // 3. Process Time Series Data
        const interval = eachDayOfInterval({ start: startDate, end: endDate });

        const series: AnalyticsDataPoint[] = interval.map(date => {
            const dateStr = format(date, "yyyy-MM-dd");

            // Calculate Cumulative Members
            // Filter members joined ON or BEFORE this day
            const membersCount = allMembersRaw.filter(m => m.joinedAt <= date).length;

            // Daily Activity
            const dayPosts = postsRaw.filter(p => isSameDay(p.createdAt, date));
            const dayComments = commentsRaw.filter(c => isSameDay(c.createdAt, date));
            const dayInteractions = interactionsRaw.filter(i => isSameDay(i.createdAt, date));

            // Active Users (Unique users who posted, commented, or interacted)
            const activeUserIds = new Set([
                ...dayPosts.map(p => p.authorId),
                ...dayComments.map(c => c.userId),
                ...dayInteractions.map(i => i.userId)
            ]);

            return {
                date: dateStr,
                members: membersCount,
                posts: dayPosts.length,
                comments: dayComments.length,
                interactions: dayInteractions.length,
                activeUsers: activeUserIds.size
            };
        });

        // 4. Calculate Summary & Growth
        const currentTotalMembers = allMembersRaw.length;
        const currentTotalPosts = postsRaw.length; // In this period

        // Growth Calculation
        // Member Growth: (Current Total - Previous Total) / Previous Total
        const memberGrowth = previousMembersCount > 0
            ? ((currentTotalMembers - previousMembersCount) / previousMembersCount) * 100
            : 0;

        // Post Growth: (Current Period Count - Previous Period Count) / Previous Period Count
        const postGrowth = previousPostsCount > 0
            ? ((currentTotalPosts - previousPostsCount) / previousPostsCount) * 100
            : 0;

        // Engagement Rate: (Interactions + Comments) / Total Members / Days * 100
        // Average daily engagement per member
        const totalEngagements = commentsRaw.length + interactionsRaw.length;
        const avgMembers = currentTotalMembers; // Simplify with current total
        const engagementRate = avgMembers > 0
            ? (totalEngagements / avgMembers) * 100 // Just raw interactions/member ratio
            : 0;

        // 5. Top Contributors
        const userScores = new Map<string, number>();

        // Points: Post=5, Comment=2, Interaction=1
        postsRaw.forEach(p => {
            userScores.set(p.authorId, (userScores.get(p.authorId) || 0) + 5);
        });
        commentsRaw.forEach(c => {
            userScores.set(c.userId, (userScores.get(c.userId) || 0) + 2);
        });
        interactionsRaw.forEach(i => {
            userScores.set(i.userId, (userScores.get(i.userId) || 0) + 1);
        });

        // Get Top 5 User IDs
        const sortedUserIds = Array.from(userScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => id);

        // Fetch User Details for Top Contributors
        const topUsers = await prisma.user.findMany({
            where: { id: { in: sortedUserIds } },
            select: { id: true, name: true, avatar: true }
        });

        const topContributors = topUsers.map(u => ({
            id: u.id,
            name: u.name || "Unknown",
            avatar: u.avatar,
            score: userScores.get(u.id) || 0
        })).sort((a, b) => b.score - a.score);

        // 6. Top Content (Calculated from postsRaw)
        const topPosts = postsRaw
            .map(p => ({
                id: p.id,
                content: p.content || "Média",
                authorName: p.author?.name || "Unknown",
                authorAvatar: p.author?.avatar,
                views: p._count.views,
                likes: p._count.interactions,
                comments: p._count.comments,
                score: (p._count.interactions * 2) + (p._count.comments * 3) + (p._count.views * 0.1),
                date: p.createdAt.toISOString()
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // 7. Traffic Sources
        const sourceCounts = new Map<string, number>();
        postViewsRaw.forEach(v => {
            const rawSource = v.source || "DIRECT";
            // Normalize source names if needed
            const source = rawSource.toUpperCase().replace("_", " ");
            sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
        });

        const totalViews = postViewsRaw.length;
        const trafficSources = Array.from(sourceCounts.entries())
            .map(([name, value]) => ({
                name,
                value,
                percent: totalViews > 0 ? (value / totalViews) * 100 : 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 sources

        return {
            success: true,
            data: {
                series,
                summary: {
                    totalMembers: currentTotalMembers,
                    memberGrowth,
                    totalPosts: currentTotalPosts,
                    postGrowth,
                    engagementRate,
                    topContributors,
                    topPosts,
                    trafficSources
                }
            }
        };

    } catch (error) {
        console.error("Analytics Error:", error);
        return { success: false, error: "Failed to fetch advanced analytics" };
    }
}
// --- ROLES MANAGEMENT ---

export async function getCommunityRoles(communityId: string, userId: string) {
    try {
        await checkModeratorPermission(communityId, userId);
        const roles = await prisma.communityRole.findMany({
            where: { communityId },
            orderBy: { position: "asc" }
        });
        return { success: true, data: roles };
    } catch (error) {
        return { success: false, error: "Failed to fetch roles" };
    }
}

export async function createCommunityRole(communityId: string, userId: string, data: { name: string, color: string, permissions: string }) {
    try {
        await checkModeratorPermission(communityId, userId);
        const role = await prisma.communityRole.create({
            data: {
                communityId,
                ...data
            }
        });
        revalidatePath(`/communities`);
        return { success: true, data: role };
    } catch (error) {
        return { success: false, error: "Failed to create role" };
    }
}

export async function updateCommunityRole(communityId: string, userId: string, roleId: string, data: { name?: string, color?: string, permissions?: string, position?: number }) {
    try {
        await checkModeratorPermission(communityId, userId);
        const role = await prisma.communityRole.update({
            where: { id: roleId },
            data
        });
        revalidatePath(`/communities`);
        return { success: true, data: role };
    } catch (error) {
        return { success: false, error: "Failed to update role" };
    }
}

export async function deleteCommunityRole(communityId: string, userId: string, roleId: string) {
    try {
        await checkModeratorPermission(communityId, userId);
        await prisma.communityRole.delete({ where: { id: roleId } });
        revalidatePath(`/communities`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete role" };
    }
}

// --- INVITES & REQUESTS ---

export async function getCommunityJoinRequests(communityId: string, userId: string) {
    try {
        await checkModeratorPermission(communityId, userId);
        const requests = await prisma.communityJoinRequest.findMany({
            where: { communityId, status: "PENDING" },
            include: {
                user: { select: { id: true, name: true, avatar: true, email: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: requests };
    } catch (error) {
        return { success: false, error: "Failed to fetch requests" };
    }
}

export async function handleJoinRequest(communityId: string, adminId: string, requestId: string, action: "APPROVE" | "REJECT") {
    try {
        await checkModeratorPermission(communityId, adminId);

        const request = await prisma.communityJoinRequest.findUnique({ where: { id: requestId } });
        if (!request) throw new Error("Request not found");

        if (action === "APPROVE") {
            // Create member
            await prisma.communityMember.create({
                data: {
                    communityId,
                    userId: request.userId,
                    role: "MEMBER"
                }
            });

            // Delete request (approved)
            await prisma.communityJoinRequest.delete({ where: { id: requestId } });
        } else {
            // Just update status or delete? Usually delete or mark rejected.
            await prisma.communityJoinRequest.delete({ where: { id: requestId } });
        }

        revalidatePath(`/communities`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to handle request" };
    }
}

export async function getCommunityInvites(communityId: string, userId: string) {
    try {
        await checkModeratorPermission(communityId, userId);
        const invites = await prisma.communityInvitation.findMany({
            where: { communityId, status: "PENDING" },
            include: {
                role: true,
                inviter: { select: { name: true } }
            }
        });
        return { success: true, data: invites };
    } catch (error) {
        return { success: false, error: "Failed to fetch invites" };
    }
}

export async function createInvitation(communityId: string, userId: string, data: { maxUses?: number, expiresAt?: Date, roleId?: string }) {
    try {
        await checkModeratorPermission(communityId, userId);
        // Generate token
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const invite = await prisma.communityInvitation.create({
            data: {
                communityId,
                inviterId: userId,
                token,
                expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
                maxUses: data.maxUses || 1,
                roleId: data.roleId
            }
        });

        return { success: true, data: invite };
    } catch (error) {
        return { success: false, error: "Failed to create invite" };
    }
}
