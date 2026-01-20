/*
  Warnings:

  - You are about to drop the column `holder` on the `Beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Beneficiary` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `walletId` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "price" REAL,
    "location" TEXT,
    "link" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortfolioItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Endorsement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "message" TEXT,
    "relationship" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Endorsement_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Endorsement_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryHighlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverUrl" TEXT,
    "storyIds" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoryHighlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostAttachment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "watchTimeMs" INTEGER NOT NULL DEFAULT 0,
    "completionRate" REAL NOT NULL DEFAULT 0,
    "didLike" BOOLEAN NOT NULL DEFAULT false,
    "didComment" BOOLEAN NOT NULL DEFAULT false,
    "didShare" BOOLEAN NOT NULL DEFAULT false,
    "didSave" BOOLEAN NOT NULL DEFAULT false,
    "didSkip" BOOLEAN NOT NULL DEFAULT false,
    "didHide" BOOLEAN NOT NULL DEFAULT false,
    "didReport" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "deviceType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "design" TEXT DEFAULT 'TEAL',
    "label" TEXT,
    "panLast4" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,
    "cvv" TEXT,
    "pin" TEXT,
    "monthlyLimit" REAL NOT NULL DEFAULT 1000,
    "currentSpend" REAL NOT NULL DEFAULT 0,
    "contactless" BOOLEAN NOT NULL DEFAULT true,
    "onlinePayments" BOOLEAN NOT NULL DEFAULT true,
    "atmWithdrawals" BOOLEAN NOT NULL DEFAULT true,
    "locationSecurity" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankCard_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pocket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goalAmount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "emoji" TEXT,
    "image" TEXT,
    "balance" REAL NOT NULL DEFAULT 0,
    "autoSaveEnabled" BOOLEAN NOT NULL DEFAULT false,
    "roundUpMultiplier" REAL,
    "recurringAmount" REAL,
    "recurringFrequency" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pocket_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoanRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "declaredIncome" REAL,
    "creditScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LoanRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "interestRate" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "monthlyPayment" REAL NOT NULL,
    "totalRepaid" REAL NOT NULL DEFAULT 0,
    "remainingBalance" REAL NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "nextPaymentDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "LoanRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepaymentSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "principal" REAL NOT NULL,
    "interest" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepaymentSchedule_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 500,
    "history" TEXT,
    "factors" TEXT,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecurringTransfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "nextExecution" DATETIME NOT NULL,
    "lastExecution" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringTransfer_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecurringTransfer_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "amount" REAL,
    "reference" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sophistication" TEXT NOT NULL DEFAULT 'NON_SOPHISTICATED',
    "investmentExperience" TEXT NOT NULL DEFAULT 'NONE',
    "riskUnderstanding" BOOLEAN NOT NULL DEFAULT false,
    "canAffordLoss" BOOLEAN NOT NULL DEFAULT false,
    "investmentHorizon" TEXT,
    "investmentObjective" TEXT,
    "monthlyIncome" REAL,
    "totalPatrimony" REAL,
    "testCompletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskAcknowledgment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "acknowledgedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capitalLossRisk" BOOLEAN NOT NULL DEFAULT true,
    "liquidityRisk" BOOLEAN NOT NULL DEFAULT true,
    "defaultRisk" BOOLEAN NOT NULL DEFAULT true,
    "platformRisk" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "InvestmentLimitLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalInvested" REAL NOT NULL DEFAULT 0,
    "investmentCount" INTEGER NOT NULL DEFAULT 0,
    "limitType" TEXT NOT NULL DEFAULT 'ANNUAL_NO_KYC',
    "limitAmount" REAL NOT NULL DEFAULT 1000,
    "warningsShown" INTEGER NOT NULL DEFAULT 0,
    "blockersHit" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionIdx" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PollVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "viewerId" TEXT NOT NULL,
    "viewedId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileView_viewedId_fkey" FOREIGN KEY ("viewedId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL DEFAULT 'DAILY',
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "searchAppearances" INTEGER NOT NULL DEFAULT 0,
    "totalImpressions" INTEGER NOT NULL DEFAULT 0,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "totalSaves" INTEGER NOT NULL DEFAULT 0,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "newFollowers" INTEGER NOT NULL DEFAULT 0,
    "unfollowers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" REAL NOT NULL DEFAULT 0,
    "avgPostReach" REAL NOT NULL DEFAULT 0,
    "propertyViews" INTEGER NOT NULL DEFAULT 0,
    "investmentClicks" INTEGER NOT NULL DEFAULT 0,
    "contactRequests" INTEGER NOT NULL DEFAULT 0,
    "leadScore" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "AnalyticsSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostImpression" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'FEED',
    "deviceType" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostImpression_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostImpression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropertyAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "contactClicks" INTEGER NOT NULL DEFAULT 0,
    "phoneClicks" INTEGER NOT NULL DEFAULT 0,
    "emailClicks" INTEGER NOT NULL DEFAULT 0,
    "scheduleClicks" INTEGER NOT NULL DEFAULT 0,
    "investInterest" INTEGER NOT NULL DEFAULT 0,
    "simulationClicks" INTEGER NOT NULL DEFAULT 0,
    "documentViews" INTEGER NOT NULL DEFAULT 0,
    "investorViews" INTEGER NOT NULL DEFAULT 0,
    "buyerViews" INTEGER NOT NULL DEFAULT 0,
    "avgViewDuration" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "PropertyAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 100,
    "metadata" TEXT,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostCollaborator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostCollaborator_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostCodeBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'text',
    "code" TEXT NOT NULL,
    "filename" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PostCodeBlock_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostEmbedLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "siteName" TEXT,
    "faviconUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'LINK',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PostEmbedLink_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostMapEmbed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT,
    "zoomLevel" INTEGER NOT NULL DEFAULT 15,
    CONSTRAINT "PostMapEmbed_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL NOT NULL DEFAULT 0,
    "yearlyPrice" DECIMAL,
    "interval" TEXT NOT NULL DEFAULT 'month',
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "features" TEXT NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeatureUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeatureUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformFee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "grossAmount" DECIMAL NOT NULL,
    "feePercent" DECIMAL NOT NULL,
    "feeAmount" DECIMAL NOT NULL,
    "netAmount" DECIMAL NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "collectedAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Beneficiary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT,
    "avatar" TEXT,
    "lastTransferAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Beneficiary_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Beneficiary" ("bic", "createdAt", "iban", "id", "name") SELECT "bic", "createdAt", "iban", "id", "name" FROM "Beneficiary";
DROP TABLE "Beneficiary";
ALTER TABLE "new_Beneficiary" RENAME TO "Beneficiary";
CREATE INDEX "Beneficiary_walletId_idx" ON "Beneficiary"("walletId");
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "authorId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "metadata" TEXT,
    "tags" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "communityId" TEXT,
    "scheduledAt" DATETIME,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "allowDuets" BOOLEAN NOT NULL DEFAULT true,
    "allowDownload" BOOLEAN NOT NULL DEFAULT true,
    "contentRating" TEXT NOT NULL DEFAULT 'CLEAN',
    "videoCategory" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" DATETIME,
    "quotedPostId" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "threadId" TEXT,
    "threadOrder" INTEGER,
    "isCarousel" BOOLEAN NOT NULL DEFAULT false,
    "contentFormat" TEXT NOT NULL DEFAULT 'TEXT',
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Post_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_quotedPostId_fkey" FOREIGN KEY ("quotedPostId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("allowComments", "allowDownload", "allowDuets", "authorId", "communityId", "content", "contentRating", "createdAt", "id", "image", "location", "metadata", "published", "scheduledAt", "tags", "type", "updatedAt", "videoCategory", "visibility") SELECT "allowComments", "allowDownload", "allowDuets", "authorId", "communityId", "content", "contentRating", "createdAt", "id", "image", "location", "metadata", "published", "scheduledAt", "tags", "type", "updatedAt", "videoCategory", "visibility" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "externalId" TEXT,
    "balanceAfter" REAL,
    "counterpartyName" TEXT,
    "counterpartyIban" TEXT,
    "counterpartyLogo" TEXT,
    "linkedAccountId" TEXT,
    "cardId" TEXT,
    "pocketId" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "complianceNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "metadata" TEXT,
    "description" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "BankCard" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_pocketId_fkey" FOREIGN KEY ("pocketId") REFERENCES "Pocket" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "balanceAfter", "category", "complianceNotes", "counterpartyIban", "counterpartyLogo", "counterpartyName", "createdAt", "description", "externalId", "flagReason", "flagged", "id", "isRecurring", "linkedAccountId", "metadata", "recurringGroupId", "reference", "reviewedAt", "reviewedBy", "status", "type", "updatedAt", "walletId") SELECT "amount", "balanceAfter", "category", "complianceNotes", "counterpartyIban", "counterpartyLogo", "counterpartyName", "createdAt", "description", "externalId", "flagReason", "flagged", "id", "isRecurring", "linkedAccountId", "metadata", "recurringGroupId", "reference", "reviewedAt", "reviewedBy", "status", "type", "updatedAt", "walletId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_walletId_createdAt_idx" ON "Transaction"("walletId", "createdAt");
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");
CREATE INDEX "Transaction_linkedAccountId_idx" ON "Transaction"("linkedAccountId");
CREATE INDEX "Transaction_flagged_idx" ON "Transaction"("flagged");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'TENANT',
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "coverImage" TEXT,
    "links" TEXT,
    "lastActive" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "statusMessage" TEXT,
    "isInvisible" BOOLEAN NOT NULL DEFAULT false,
    "company" TEXT,
    "school" TEXT,
    "industry" TEXT,
    "headline" TEXT,
    "availability" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "pinnedPostId" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "phoneNumber" TEXT,
    "phoneVerified" DATETIME,
    "referralCode" TEXT,
    "referredById" TEXT,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "showActivityStatus" BOOLEAN NOT NULL DEFAULT true,
    "featuredPostIds" TEXT,
    "socialLinks" TEXT,
    "musicUrl" TEXT,
    "currentPlan" TEXT NOT NULL DEFAULT 'FREE',
    CONSTRAINT "User_pinnedPostId_fkey" FOREIGN KEY ("pinnedPostId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("availability", "avatar", "bio", "company", "coverImage", "createdAt", "email", "emailVerified", "headline", "id", "image", "industry", "isInvisible", "isVerified", "lastActive", "links", "location", "name", "password", "pinnedPostId", "referralCode", "referredById", "reputation", "role", "school", "statusMessage", "twoFactorEnabled", "twoFactorSecret", "updatedAt", "website") SELECT "availability", "avatar", "bio", "company", "coverImage", "createdAt", "email", "emailVerified", "headline", "id", "image", "industry", "isInvisible", "isVerified", "lastActive", "links", "location", "name", "password", "pinnedPostId", "referralCode", "referredById", "reputation", "role", "school", "statusMessage", "twoFactorEnabled", "twoFactorSecret", "updatedAt", "website" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE TABLE "new_Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0.0,
    "invested" REAL NOT NULL DEFAULT 0.0,
    "locked" REAL NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "iban" TEXT,
    "ledgerAccountId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tier" TEXT NOT NULL DEFAULT 'STANDARD',
    "bic" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Wallet_ledgerAccountId_fkey" FOREIGN KEY ("ledgerAccountId") REFERENCES "LedgerAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Wallet" ("balance", "createdAt", "currency", "iban", "id", "invested", "ledgerAccountId", "locked", "updatedAt", "userId") SELECT "balance", "createdAt", "currency", "iban", "id", "invested", "ledgerAccountId", "locked", "updatedAt", "userId" FROM "Wallet";
DROP TABLE "Wallet";
ALTER TABLE "new_Wallet" RENAME TO "Wallet";
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");
CREATE UNIQUE INDEX "Wallet_ledgerAccountId_key" ON "Wallet"("ledgerAccountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Endorsement_giverId_receiverId_skill_key" ON "Endorsement"("giverId", "receiverId", "skill");

-- CreateIndex
CREATE INDEX "PostView_postId_idx" ON "PostView"("postId");

-- CreateIndex
CREATE INDEX "PostView_postId_createdAt_idx" ON "PostView"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostView_userId_idx" ON "PostView"("userId");

-- CreateIndex
CREATE INDEX "LoanRequest_userId_idx" ON "LoanRequest"("userId");

-- CreateIndex
CREATE INDEX "LoanRequest_status_idx" ON "LoanRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_requestId_key" ON "Loan"("requestId");

-- CreateIndex
CREATE INDEX "Loan_borrowerId_idx" ON "Loan"("borrowerId");

-- CreateIndex
CREATE INDEX "RepaymentSchedule_loanId_idx" ON "RepaymentSchedule"("loanId");

-- CreateIndex
CREATE INDEX "RepaymentSchedule_dueDate_idx" ON "RepaymentSchedule"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "CreditScore_userId_key" ON "CreditScore"("userId");

-- CreateIndex
CREATE INDEX "RecurringTransfer_walletId_idx" ON "RecurringTransfer"("walletId");

-- CreateIndex
CREATE INDEX "RecurringTransfer_nextExecution_idx" ON "RecurringTransfer"("nextExecution");

-- CreateIndex
CREATE INDEX "RecurringTransfer_status_idx" ON "RecurringTransfer"("status");

-- CreateIndex
CREATE INDEX "WalletNotification_userId_idx" ON "WalletNotification"("userId");

-- CreateIndex
CREATE INDEX "WalletNotification_read_idx" ON "WalletNotification"("read");

-- CreateIndex
CREATE INDEX "WalletNotification_createdAt_idx" ON "WalletNotification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE INDEX "InvestorProfile_userId_idx" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE INDEX "InvestorProfile_sophistication_idx" ON "InvestorProfile"("sophistication");

-- CreateIndex
CREATE INDEX "RiskAcknowledgment_userId_idx" ON "RiskAcknowledgment"("userId");

-- CreateIndex
CREATE INDEX "RiskAcknowledgment_loanId_idx" ON "RiskAcknowledgment"("loanId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskAcknowledgment_userId_loanId_key" ON "RiskAcknowledgment"("userId", "loanId");

-- CreateIndex
CREATE INDEX "InvestmentLimitLog_userId_idx" ON "InvestmentLimitLog"("userId");

-- CreateIndex
CREATE INDEX "InvestmentLimitLog_year_idx" ON "InvestmentLimitLog"("year");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentLimitLog_userId_year_key" ON "InvestmentLimitLog"("userId", "year");

-- CreateIndex
CREATE INDEX "PollVote_postId_idx" ON "PollVote"("postId");

-- CreateIndex
CREATE INDEX "PollVote_userId_idx" ON "PollVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_postId_userId_key" ON "PollVote"("postId", "userId");

-- CreateIndex
CREATE INDEX "ProfileView_viewedId_createdAt_idx" ON "ProfileView"("viewedId", "createdAt");

-- CreateIndex
CREATE INDEX "ProfileView_viewerId_idx" ON "ProfileView"("viewerId");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_userId_date_idx" ON "AnalyticsSnapshot"("userId", "date");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_userId_period_idx" ON "AnalyticsSnapshot"("userId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSnapshot_userId_date_period_key" ON "AnalyticsSnapshot"("userId", "date", "period");

-- CreateIndex
CREATE INDEX "PostImpression_postId_createdAt_idx" ON "PostImpression"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostImpression_userId_idx" ON "PostImpression"("userId");

-- CreateIndex
CREATE INDEX "PostImpression_source_idx" ON "PostImpression"("source");

-- CreateIndex
CREATE INDEX "PropertyAnalytics_userId_date_idx" ON "PropertyAnalytics"("userId", "date");

-- CreateIndex
CREATE INDEX "PropertyAnalytics_propertyId_idx" ON "PropertyAnalytics"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAnalytics_propertyId_date_key" ON "PropertyAnalytics"("propertyId", "date");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_type_key" ON "UserAchievement"("userId", "type");

-- CreateIndex
CREATE INDEX "AnalyticsGoal_userId_period_idx" ON "AnalyticsGoal"("userId", "period");

-- CreateIndex
CREATE INDEX "AnalyticsGoal_userId_completed_idx" ON "AnalyticsGoal"("userId", "completed");

-- CreateIndex
CREATE INDEX "PostCollaborator_userId_status_idx" ON "PostCollaborator"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PostCollaborator_postId_userId_key" ON "PostCollaborator"("postId", "userId");

-- CreateIndex
CREATE INDEX "PostCodeBlock_postId_idx" ON "PostCodeBlock"("postId");

-- CreateIndex
CREATE INDEX "PostEmbedLink_postId_idx" ON "PostEmbedLink"("postId");

-- CreateIndex
CREATE INDEX "PostMapEmbed_postId_idx" ON "PostMapEmbed"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "UserSubscription"("userId");

-- CreateIndex
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");

-- CreateIndex
CREATE INDEX "UserSubscription_stripeSubscriptionId_idx" ON "UserSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "FeatureUsage_userId_feature_idx" ON "FeatureUsage"("userId", "feature");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureUsage_userId_feature_period_key" ON "FeatureUsage"("userId", "feature", "period");

-- CreateIndex
CREATE INDEX "PlatformFee_transactionId_idx" ON "PlatformFee"("transactionId");

-- CreateIndex
CREATE INDEX "PlatformFee_type_idx" ON "PlatformFee"("type");

-- CreateIndex
CREATE INDEX "PlatformFee_userId_idx" ON "PlatformFee"("userId");

-- CreateIndex
CREATE INDEX "Interaction_postId_type_idx" ON "Interaction"("postId", "type");

-- CreateIndex
CREATE INDEX "Interaction_postId_createdAt_idx" ON "Interaction"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Interaction_userId_idx" ON "Interaction"("userId");
