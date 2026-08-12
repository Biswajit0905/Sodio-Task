-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Enquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalText" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT 'Unknown',
    "receivedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" TEXT NOT NULL DEFAULT 'LOW',
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isGenuine" BOOLEAN NOT NULL DEFAULT true,
    "serviceLine" TEXT NOT NULL DEFAULT 'OTHER',
    "summary" TEXT NOT NULL DEFAULT '',
    "timeline" TEXT NOT NULL DEFAULT '',
    "budget" TEXT NOT NULL DEFAULT '',
    "normalizedBudgetMin" REAL,
    "normalizedBudgetMax" REAL,
    "normalizedBudgetCurrency" TEXT,
    "normalizedTimelineStart" DATETIME,
    "originalFields" TEXT NOT NULL DEFAULT '{}',
    "currentFields" TEXT NOT NULL DEFAULT '{}',
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Enquiry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Enquiry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Enquiry" ("budget", "createdAt", "currentFields", "errorMessage", "fromEmail", "fromName", "id", "isFollowUp", "isGenuine", "normalizedBudgetCurrency", "normalizedBudgetMax", "normalizedBudgetMin", "normalizedTimelineStart", "originalFields", "originalText", "parentId", "priority", "processingStatus", "receivedAt", "serviceLine", "status", "summary", "timeline", "updatedAt") SELECT "budget", "createdAt", "currentFields", "errorMessage", "fromEmail", "fromName", "id", "isFollowUp", "isGenuine", "normalizedBudgetCurrency", "normalizedBudgetMax", "normalizedBudgetMin", "normalizedTimelineStart", "originalFields", "originalText", "parentId", "priority", "processingStatus", "receivedAt", "serviceLine", "status", "summary", "timeline", "updatedAt" FROM "Enquiry";
DROP TABLE "Enquiry";
ALTER TABLE "new_Enquiry" RENAME TO "Enquiry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
