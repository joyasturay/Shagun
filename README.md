# 💌 Shagun.ai

> **Ditch the diary. Digitize the Shagun.** > A high-integrity digital ledger for modern Indian weddings.

Live Demo: [https://shagun-e1ex.vercel.app](https://shagun-e1ex.vercel.app)

## 📖 The Problem
Weddings are chaotic. Families lose track of cash gifts (**Shagun**) because the reception line moves too fast for manual entry. The traditional "diary" method is prone to human error and data loss.

## ✨ The Solution: "Snap & Stash"
Shagun.ai implements a secure, two-step audit trail:
1. **Collector (Stage):** Snaps a photo of the envelope and drops it into a numbered physical bag (Batch).
2. **Admin (Post-Event):** Views the digitized photo and reconciles the amount.
3. **Result:** 100% data integrity with a permanent visual audit trail for every gift.

## 🛠️ Tech Stack
* **Framework:** Next.js 15 (App Router + Server Actions)
* **Database:** Neon (Serverless Postgres)
* **ORM:** Prisma
* **Auth:** Auth.js (NextAuth)
* **Storage:** AWS S3 (Direct-to-S3 via Pre-signed URLs)
* **AI:** Gemini API (OCR for automated name/amount extraction)
* **Styling:** Tailwind CSS (Premium Rose & Amber Palette)

## 🚀 Core Workflow
1. **Event Setup:** Admin creates an event (e.g., "Engagement") which initializes "Batch #1".
2. **The Snap:** Collector opens the camera → Photo is uploaded to S3 → A `Gift` record is created (Status: `UNPROCESSED`).
3. **The Seal:** When a physical bag is full, the collector "Seals" the batch. The system automatically increments to "Batch #2".
4. **Reconciliation:** Admin views unprocessed gifts, verifies the physical cash against the S3 photo, and enters the final amount (Status: `PROCESSED`).

## ⚙️ Installation & Setup
```bash
# 1. Clone & Install
git clone [https://github.com/joyasturay/Shagun.git](https://github.com/joyasturay/Shagun.git)
npm install

# 2. Database Sync
npx prisma generate --schema=./db/prisma/schema.prisma
npx prisma db push

# 3. Environment Variables (.env.local)
DATABASE_URL=
NEXTAUTH_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
NEXT_PUBLIC_AWS_BUCKET_NAME=
NEXT_PUBLIC_AWS_REGION=ap-south-1

Created By- Joyastu Ray