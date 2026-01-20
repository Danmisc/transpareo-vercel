
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function backup() {
    console.log('Starting backup...')

    // Get all model names from the Prisma client
    // Note: This relies on internal API or known models. 
    // For a robust generic solution we explicitly list or inspect dmmf
    // Here we explicitly list the robust models from schema.prisma

    const models = [
        'User', 'UserSearchCriteria', 'PortfolioItem', 'Endorsement', 'StoryHighlight',
        'Account', 'SecurityLog', 'LinkedAccount', 'Session', 'VerificationToken',
        'Post', 'PostAttachment', 'Interaction', 'PostView', 'Comment',
        'CommentInteraction', 'Follow', 'Block', 'Notification', 'Report',
        'NotificationSettings', 'Hashtag', 'SearchHistory', 'Community',
        'VibeReview', 'CommunityMember', 'Badge', 'UserBadge', 'Collection',
        'SavedPost', 'Video', 'LiveStream', 'Story', 'StoryView',
        'Conversation', 'ConversationParticipant', 'Message', 'MessageAttachment',
        'MessageReaction', 'MessageReadStatus', 'Listing', 'ListingImage',
        'PropertyReview'
    ]

    const data: Record<string, any[]> = {}

    for (const model of models) {
        try {
            // @ts-ignore
            const records = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].findMany()
            data[model] = records
            console.log(`Backed up ${records.length} records for ${model}`)
        } catch (e) {
            console.warn(`Could not backup model ${model}:`, e)
        }
    }

    const backupPath = path.join(process.cwd(), 'backup_data.json')
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2))
    console.log(`Backup completed to ${backupPath}`)
}

backup()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
