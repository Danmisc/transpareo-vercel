
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function restore() {
    const backupPath = path.join(process.cwd(), 'backup_data.json')
    if (!fs.existsSync(backupPath)) {
        console.error('No backup file found at', backupPath)
        process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    console.log('Restoring data...')

    // Order matters for Foreign Keys!
    // This list must be topologically sorted based on dependencies in schema.prisma
    const models = [
        'User',
        'UserSearchCriteria',
        'Collection',
        'Post',
        'PostAttachment',
        'Video',
        'LiveStream',
        'Comment',
        'Interaction',
        'CommentInteraction',
        'Follow',
        'Block',
        'Notification',
        'Report',
        'NotificationSettings',
        'Hashtag',
        'SearchHistory',
        'Community',
        'VibeReview',
        'CommunityMember',
        'Badge',
        'UserBadge',
        'SavedPost',
        'Story',
        'StoryHighlight', // Highlight depends on User, but stores storyIds as string?? Check schema.
        'StoryView',
        'Conversation',
        'ConversationParticipant',
        'Message',
        'MessageAttachment',
        'MessageReaction',
        'MessageReadStatus',
        'Listing',
        'ListingImage',
        'PropertyReview',
        'Account',
        'Session',
        'VerificationToken',
        'SecurityLog',
        'LinkedAccount',
        'PortfolioItem',
        'Endorsement'
    ]

    for (const model of models) {
        const records = data[model]
        if (!records || records.length === 0) {
            console.log(`Skipping ${model} (no data)`)
            continue
        }

        console.log(`Restoring ${records.length} records for ${model}...`)

        // We insert in batches or one by one. One by one allows better error handling for duplicates.
        let successCount = 0
        for (const record of records) {
            try {
                // Remove any Foreign Keys that might be null if Prisma exported them weirdly,
                // but usually Prisma export is clean.
                // Also handling dates: JSON has strings, Prisma needs Date objects.
                const cleanRecord = { ...record }

                // Convert date strings to Date objects
                for (const key in cleanRecord) {
                    if (typeof cleanRecord[key] === 'string' &&
                        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cleanRecord[key])) {
                        cleanRecord[key] = new Date(cleanRecord[key])
                    }
                }

                // @ts-ignore
                await prisma[model.charAt(0).toLowerCase() + model.slice(1)].upsert({
                    where: { id: cleanRecord.id }, // Assuming all models have 'id'
                    update: {}, // Don't overwrite if exists
                    create: cleanRecord
                })
                successCount++
            } catch (e) {
                // Try simple create if upsert fails (e.g. no ID on VerificationToken)
                try {
                    // @ts-ignore
                    await prisma[model.charAt(0).toLowerCase() + model.slice(1)].create({ data: cleanRecord })
                    successCount++
                } catch (e2) {
                    // console.warn(`Failed to restore ${model} record:`, e2.message)
                }
            }
        }
        console.log(`- Restored ${successCount}/${records.length} for ${model}`)
    }

    console.log('Restore completed.')
}

restore()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
