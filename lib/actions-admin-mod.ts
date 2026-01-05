"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function checkMod() {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "MODERATOR") {
        throw new Error("Unauthorized: Moderation access required.");
    }
    return session;
}

export async function getReportsQueue() {
    await checkMod();

    // Fetch reports that are PENDING
    const reports = await prisma.report.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" }, // Oldest first
        take: 10,
        include: {
            reporter: {
                select: { name: true, image: true, email: true }
            }
        }
    });

    // Hydrate with content
    const enrichedReports = await Promise.all(reports.map(async (report) => {
        let content: any = null;
        let targetAuthor: any = null;

        try {
            if (report.targetType === "POST") {
                const post = await prisma.post.findUnique({
                    where: { id: report.targetId },
                    include: { author: { select: { id: true, name: true, image: true, email: true } } }
                });
                if (post) {
                    content = post.content;
                    targetAuthor = post.author;
                } else {
                    content = "[Content Deleted]";
                }
            } else if (report.targetType === "COMMENT") {
                const comment = await prisma.comment.findUnique({
                    where: { id: report.targetId },
                    include: { user: { select: { id: true, name: true, image: true, email: true } } }
                });
                if (comment) {
                    content = comment.content;
                    targetAuthor = comment.user;
                } else {
                    content = "[Content Deleted]";
                }
            } else if (report.targetType === "USER") {
                const user = await prisma.user.findUnique({
                    where: { id: report.targetId },
                    select: { id: true, name: true, image: true, email: true, bio: true }
                });
                if (user) {
                    content = `Bio: ${user.bio || "No bio"}`;
                    targetAuthor = user;
                }
            }
        } catch (e) {
            console.error("Error hydrating report content", e);
            content = "[Error loading content]";
        }

        return {
            ...report,
            contentObject: content,
            targetAuthor
        };
    }));

    return enrichedReports;
}

export async function resolveReport(reportId: string, decision: "DISMISS" | "DELETE" | "BAN", reportData?: any) {
    await checkMod();

    // 1. Update Report Status
    const status = decision === "DISMISS" ? "DISMISSED" : "RESOLVED";
    await prisma.report.update({
        where: { id: reportId },
        data: {
            status,
            // details: `Resolved with decision: ${decision}` // Append to details if possible, or we need a new field. details is string?
        }
    });

    // 2. Perform Action
    if (decision === "DELETE") {
        if (reportData.targetType === "POST") {
            // Soft delete or hard delete? Let's assume hard delete for now or update 'published' to false
            await prisma.post.delete({ where: { id: reportData.targetId } }).catch(() => { });
        } else if (reportData.targetType === "COMMENT") {
            await prisma.comment.delete({ where: { id: reportData.targetId } }).catch(() => { });
        }
    } else if (decision === "BAN") {
        if (reportData.targetAuthor?.id) {
            await prisma.user.update({
                where: { id: reportData.targetAuthor.id },
                data: { role: "BANNED" }
            });
            // Also probably hide their content? 
        }
    }

    revalidatePath("/admin/moderation");
    return { success: true };
}
