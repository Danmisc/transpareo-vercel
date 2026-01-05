import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// S3 Configuration
const S3_REGION = process.env.S3_REGION || "auto";
const S3_ENDPOINT = process.env.S3_ENDPOINT; // Needed for R2/MinIO
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Initialize S3 Client if keys are present
const s3Client = (S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY && S3_BUCKET_NAME)
    ? new S3Client({
        region: S3_REGION,
        endpoint: S3_ENDPOINT,
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true, // often needed for self-hosted/MinIO
    })
    : null;

export type UploadConfig = {
    key: string;
    url: string;
    uploadUrl?: string; // For S3 presigned PUT
    isLocal?: boolean;
};

/**
 * Generates a Presigned URL for direct client-side upload to S3,
 * OR returns a config to upload to our local API if S3 is not configured.
 */
export async function getUploadConfig(contentType: string, folder: string = "uploads"): Promise<{ success: boolean, data?: UploadConfig, error?: string }> {
    const ext = contentType.split("/")[1] || "bin";
    const key = `${folder}/${randomUUID()}.${ext}`;

    // S3 Strategy
    if (s3Client && S3_BUCKET_NAME) {
        try {
            const command = new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: key,
                ContentType: contentType,
            });

            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            // Public URL (assuming public bucket or CloudFront)
            const publicUrl = S3_ENDPOINT
                ? `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${key}`
                : `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${key}`;

            return {
                success: true,
                data: {
                    key,
                    url: publicUrl,
                    uploadUrl,
                    isLocal: false
                }
            };
        } catch (error) {
            console.error("S3 Presign Error:", error);
            // Fallback to local? Or error? Let's error (Enterprise usually demands strictness)
            // But for dev experience, falling back to local might be confusing if unexpected.
            // Let's return error to be explicit.
            return { success: false, error: "Failed to generate upload URL" };
        }
    }

    // Local Strategy (Fallback)
    // We will tell the client to POST to /api/upload
    // The "uploadUrl" will be our own API.
    return {
        success: true,
        data: {
            key,
            url: `/uploads/${key.split('/').pop()}`, // Naive local URL
            uploadUrl: `/api/upload/local`, // Special local endpoint
            isLocal: true
        }
    };
}

export async function deleteFile(key: string) {
    if (s3Client && S3_BUCKET_NAME) {
        try {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: key,
            }));
            return true;
        } catch (e) {
            console.error("S3 Delete Error", e);
            return false;
        }
    }
    // Local delete not implemented for safety in this demo
    return true;
}
