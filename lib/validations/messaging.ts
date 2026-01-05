import { z } from "zod";

export const CreateConversationSchema = z.object({
    userIds: z.array(z.string().cuid()).min(1, "At least one participant is required").max(50, "Group size limit reached"),
    isGroup: z.boolean().optional(),
    name: z.string().max(50, "Group name too long").optional(),
});

export const SendMessageSchema = z.object({
    conversationId: z.string().cuid(),
    content: z.string().max(2000, "Message too long").optional(), // Optional because it could be image only
    type: z.enum(["TEXT", "IMAGE", "AUDIO", "VIDEO", "FILE", "SYSTEM"]),
    fileUrl: z.string().url().optional(),
    replyToId: z.string().cuid().optional(),
    attachments: z.array(z.object({
        url: z.string(), // Relative URL (from upload) might not pass .url() literal check if strict, but usually safe.
        type: z.string(), // Use string to match input, schema has specific enums but easier to handle here
        name: z.string().optional(),
        size: z.number().optional(),
        mimeType: z.string().optional()
    })).optional()
}).refine(data => data.content || data.fileUrl || (data.attachments && data.attachments.length > 0), {
    message: "Message must have content or a file",
    path: ["content"]
});

export const GetMessagesSchema = z.object({
    conversationId: z.string().cuid(),
    limit: z.number().min(1).max(100).optional(),
});

export const EditMessageSchema = z.object({
    messageId: z.string().cuid(),
    userId: z.string().cuid(),
    content: z.string().min(1, "Content cannot be empty").max(2000, "Message too long"),
});
