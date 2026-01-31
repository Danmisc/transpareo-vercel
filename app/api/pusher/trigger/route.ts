import { pusherServer } from "@/lib/pusher";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Allowed call events - security whitelist
const ALLOWED_EVENTS = [
    "incoming-call",
    "accepted-call",
    "call-rejected",
    "call-ended",
    "call-busy",
    "call-no-answer",
    "client-typing"
];

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { channel, event, data } = body;

        if (!channel || !event) {
            return new NextResponse("Missing channel or event", { status: 400 });
        }

        // Security: Allow private-user-* (calls) AND private-conversation-* (chat)
        if (!channel.startsWith("private-user-") && !channel.startsWith("private-conversation-")) {
            return new NextResponse("Invalid channel format", { status: 403 });
        }

        // Security: Only allow whitelisted events
        if (!ALLOWED_EVENTS.includes(event)) {
            return new NextResponse("Event not allowed", { status: 403 });
        }

        // Security: Add caller ID to all outgoing signals
        const secureData = {
            ...data,
            _senderId: session.user.id,
            _timestamp: Date.now()
        };

        await pusherServer.trigger(channel, event, secureData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Pusher trigger error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

