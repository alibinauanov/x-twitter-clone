# Railway Deployment Guide

## Prerequisites
1. Railway account
2. PostgreSQL database added to your Railway project

## Step 1: Add PostgreSQL Database
1. Go to Railway dashboard
2. Click your project
3. Click "New Service" → "Database" → "Add PostgreSQL"
4. Wait for the database to be created

## Step 2: Configure Environment Variables
Go to your main application service → Variables tab and add:

### Required Environment Variables:
```
DATABASE_URL=<copy from PostgreSQL service variables>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YW1hemVkLW1hY2F3LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_QC5SXQoKo5xR56b7EPNsXkRsST5Pyqv3qqEZzfg6el
SIGNING_SECRET=whsec_dgSpMTaLMEm+zjUTznP8g5GLDw2YJgrx
NEXT_PUBLIC_PUBLIC_KEY=public_a0HAkVyFWe8ypRUQ3mFVTjKKfxw=
NEXT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/x6qkzrvnb/
PRIVATE_KEY=private_nidLUf8cWsBo0s8CGLc6iUp2wGY=
```

**IMPORTANT**: Replace the `DATABASE_URL` with the actual PostgreSQL connection string from your PostgreSQL service variables tab.

## Step 3: Deploy
1. Commit and push your changes to GitHub
2. Railway will automatically redeploy
3. Database migrations will run automatically during deployment

## Troubleshooting
- If you get "Can't reach database server" errors, check that DATABASE_URL is set correctly
- Make sure all environment variables are set in Railway dashboard
- Check Railway deployment logs for specific errors
