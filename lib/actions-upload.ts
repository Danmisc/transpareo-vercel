'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function uploadVideoFile(formData: FormData): Promise<{ url: string; duration: number } | { error: string }> {
    try {
        const file = formData.get('file') as File
        if (!file) {
            return { error: 'No file provided' }
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            return { error: 'Invalid file type. Please upload a video.' }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'pitch')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            console.error('Error creating upload dir', e)
        }

        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        // Return the public URL
        const url = `/uploads/pitch/${filename}`

        // Note: Duration extraction usually requires ffmpeg or client-side metadata reading. 
        // We will rely on the client to send duration or default to 0 for now if safe interaction is needed.
        // For this action, we just return URL.

        return { url, duration: 0 }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload video' }
    }
}
