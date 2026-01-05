import { pusherServer } from "@/lib/pusher";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { statusMessage: true, isInvisible: true, name: true, email: true, image: true, avatar: true }
    });

    if (!user) {
        return new NextResponse("User not found", { status: 404 });
    }

    const formData = await req.formData();
    const socketId = formData.get("socket_id") as string;
    const channelName = formData.get("channel_name") as string;

    const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
        user_id: session.user.id,
        user_info: {
            name: user.name,
            email: user.email,
            image: user.image || user.avatar,
            status_message: user.statusMessage,
            is_invisible: user.isInvisible
        },
    });

    return NextResponse.json(authResponse);
}
