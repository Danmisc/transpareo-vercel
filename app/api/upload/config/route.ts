import { auth } from "@/lib/auth";
import { getUploadConfig } from "@/lib/services/storage.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { contentType, folder } = await req.json();

        // Rate limit check could go here

        const config = await getUploadConfig(contentType, folder);

        if (!config.success) {
            return new NextResponse(config.error, { status: 500 });
        }

        return NextResponse.json(config.data);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
