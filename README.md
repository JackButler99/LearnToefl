# ITP Practice Lab

A Next.js full-stack learning app for independent practice in the **TOEFL ITP Level 1 format**. Interface copy is in Indonesian; all 140 questions and explanations are original English practice content. This is an independent study tool, not an ETS test or certificate.

## Run locally

Requires Node.js **24** and npm, plus a PostgreSQL database. Neon works well for local development and serverless deployment.

```bash
npm install
cp .env.example .env.local
# Replace DATABASE_URL in .env.local with your PostgreSQL connection string.
npm run dev
```

Open http://localhost:3000, create an account, and choose a practice set or full simulation. The application creates its PostgreSQL tables and index idempotently on first database use. `npm run typecheck` and `npm run build` verify the project.

## Included

- Account registration/login with scrypt password hashes and HttpOnly session cookies.
- Three 10-question untimed practices: Listening, Structure & Written Expression, Reading.
- A 140-question simulation with separate 35-, 25-, and 55-minute sections. Deadlines are enforced on the server; previous sections cannot be reopened.
- PostgreSQL persistence for answers, attempts, progress, and review after completion.
- Section summaries, raw correct counts, percentages, transcript review, and explanations.
- Responsive interface, question navigation, and browser speech synthesis for listening scripts.

## Content and scoring boundaries

The question bank is original demonstration content. Listening uses the browser's synthesized English voice, so pronunciation and playback differ across devices; a production exam-like experience needs properly licensed, human-recorded audio, an expanded and reviewed question bank, and a secure delivery workflow. Some longer listening and reading stimuli have several questions, as in a test, but the bank has not been psychometrically calibrated.

The app intentionally does **not** calculate an official 310–677 TOEFL ITP score. ETS derives scaled section scores from correct answers using conversions for the test form; percentages from this original bank cannot be converted honestly into a certified score. The app also does not issue certificates. ETS publishes the Level 1 blueprint as Listening 50/35 minutes, Structure 40/25 minutes, and Reading 50/55 minutes: https://www.ets.org/toefl/itp/test-content.html ; scoring background: https://www.ets.org/toefl/itp/scoring.html .

## Deployment

The app is ready for a serverless Next.js deployment backed by PostgreSQL:

1. Create a Neon PostgreSQL project and copy its pooled connection string.
2. Import this repository into Vercel.
3. Add `DATABASE_URL` as a secret environment variable for Production and Preview.
4. Deploy with Node.js 24. The schema is initialized automatically on first database use.

For a broader public launch, also configure backups, email verification/password recovery, authentication rate limits, and a reviewed question/audio catalog. The code is a portfolio-ready learning application, not a production security assessment.

## Main files

- `src/lib/questions.ts`: original question bank and exam blueprint.
- `src/lib/db.ts`: Neon/PostgreSQL connection and idempotent schema initialization.
- `src/lib/auth.ts`: account and session handling.
- `src/lib/attempts.ts`: section timing, persistence, and raw result calculation.
- `src/app/api`: HTTP endpoints.
- `src/components`: interactive dashboard, exam, and review.
