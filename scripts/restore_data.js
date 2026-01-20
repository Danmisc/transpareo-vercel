
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function restore() {
    const backupPath = path.join(process.cwd(), 'backup_data.json')
    if (!fs.existsSync(backupPath)) {
        console.error('No backup file found at', backupPath)
        process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    console.log('Restoring data...')

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
        'StoryHighlight',
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

        let successCount = 0
        for (const record of records) {
            try {
                const cleanRecord = { ...record }

                for (const key in cleanRecord) {
                    if (typeof cleanRecord[key] === 'string' &&
                        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cleanRecord[key])) {
                        cleanRecord[key] = new Date(cleanRecord[key])
                    }
                }

                const modelKey = model.charAt(0).toLowerCase() + model.slice(1)
                if (!prisma[modelKey]) {
                    // models sometimes mismatch if schema changed
                    continue
                }

                await prisma[modelKey].upsert({
                    where: { id: cleanRecord.id },
                    update: {},
                    create: cleanRecord
                })
                successCount++
            } catch (e) {
                try {
                    const modelKey = model.charAt(0).toLowerCase() + model.slice(1)
                    await prisma[modelKey].create({ data: cleanRecord })
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
