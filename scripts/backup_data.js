
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backup() {
    console.log('Starting backup...')

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

    const data = {}

    for (const model of models) {
        try {
            // access model property dynamically, handling casing if needed (usually prisma Client has lowercase keys)
            // Prisma Client instances usually lower-case the model name, e.g. prisma.user
            const modelKey = model.charAt(0).toLowerCase() + model.slice(1)
            if (!prisma[modelKey]) {
                console.warn(`Model ${modelKey} not found on prisma client`)
                continue
            }
            const records = await prisma[modelKey].findMany()
            data[model] = records
            console.log(`Backed up ${records.length} records for ${model}`)
        } catch (e) {
            console.warn(`Could not backup model ${model}:`, e.message)
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
