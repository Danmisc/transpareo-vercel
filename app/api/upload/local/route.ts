import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) return new NextResponse("No file", { status: 400 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // In a real scenario, we might want to respect the 'key' generated in config,
        // but for simplicity here we just generate a name or use provided one.
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

        const uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        await writeFile(join(uploadDir, filename), buffer);

        // Return the final public URL
        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error("Local upload failed", error);
        return new NextResponse("Upload failed", { status: 500 });
    }
}
