-- CreateTable
CREATE TABLE "MailingState" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailingState_pkey" PRIMARY KEY ("id")
);
