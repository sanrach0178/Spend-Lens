# SpendLens — AI Spend Audit Tool

SpendLens helps teams audit their AI tool subscriptions (Cursor, ChatGPT, Claude, etc.) and find potential savings.

## Deployment

We recommend deploying SpendLens on [Railway](https://railway.app/).

### Backend (Spring Boot)

1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the `backend/Dockerfile`.
3. Set the following Environment Variables in Railway:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `RESEND_API_KEY`: Your Resend API Key for emails.
   - `DATABASE_URL`: Automatically provided by Railway Postgres.
4. Expose port `8080`.

### Frontend (Next.js)

1. Connect the repository to Railway.
2. Set the Root Directory to `frontend`.
3. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://api.spendlens.com`).
4. Railway will build and deploy the Next.js app automatically.

---

## Local Development

Refer to `TESTS.md` for running test suites.
