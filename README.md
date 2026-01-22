# Project Shagun: Digital Wedding Asset Tracker

## The Problem
Weddings are chaotic. Families lose track of cash gifts (Shagun) because the reception line moves too fast for manual writing.

## The Solution
A "Snap & Stash" system.
1.  **Collector** (at stage) snaps a photo of the envelope and drops it in a numbered bag (Batch).
2.  **Admin** (later) views the photo and enters the amount/name.
3.  **Result:** Zero data loss, audit trail for every bag.

## Tech Stack
* Next.js (App Router)
* PostgreSQL + Prisma
* Supabase (Auth & Storage)

## Core Workflow (MVP)
1.  **Login:** User logs in as 'Collector'.
2.  **Select Event:** Chooses "Engagement" -> System assigns/creates "Batch #1".
3.  **Snap:** Camera opens -> Uploads to Supabase -> Creates 'Gift' record (Status: UNPROCESSED).
4.  **Seal:** When Batch #1 is full (30 items), User clicks "Seal Batch". System creates "Batch #2".
5.  **Reconcile:** Admin logs in -> Sees "Unprocessed Gifts" -> Enters Amount -> Status: PROCESSED.