import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users/search?q=query&limit=5
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 20);

    if (query.length < 2) {
        return NextResponse.json({ users: [] });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: session.user.id } }, // Exclude current user
                    {
                        OR: [
                            { name: { contains: query } },
                            { email: { contains: query } },
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
            },
            take: limit,
            orderBy: { name: "asc" }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json({ error: "Erreur de recherche" }, { status: 500 });
    }
}
