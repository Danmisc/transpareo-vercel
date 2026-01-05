"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
// Using web crypto API available in Node 19+ (Next.js 15+)

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique name
    const ext = file.name.split('.').pop() || 'png';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filename = `${(globalThis as any).crypto.randomUUID()}.${ext}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const path = join(uploadDir, filename);

    try {
        await writeFile(path, buffer);
        return { success: true, url: `/uploads/${filename}` };
    } catch (error) {
        console.error("Upload failed:", error);
        return { success: false, error: "Upload failed" };
    }
}

export async function uploadFiles(formData: FormData) {
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
        return { success: false, error: "No files provided" };
    }

    const uploadedUrls: string[] = [];
    const attachments: any[] = [];
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    const uploadDir = join(process.cwd(), "public", "uploads");

    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // ignore
    }

    for (const file of files) {
        if (file.size > MAX_SIZE) {
            return { success: false, error: `File ${file.name} exceeds 100MB limit` };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.name.split('.').pop() || 'bin';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filename = `${(globalThis as any).crypto.randomUUID()}.${ext}`;
        const path = join(uploadDir, filename);

        try {
            await writeFile(path, buffer);
            const url = `/uploads/${filename}`;
            uploadedUrls.push(url);
            attachments.push({
                url,
                name: file.name,
                type: file.type.startsWith("image/") ? "IMAGE" : file.type.startsWith("video/") ? "VIDEO" : file.type.startsWith("audio/") ? "AUDIO" : "FILE",
                size: file.size,
                mimeType: file.type
            });
        } catch (error) {
            console.error(`Failed to upload ${file.name}`, error);
        }
    }

    return { success: true, urls: uploadedUrls, attachments };
}
