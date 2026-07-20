# Resulam France 2026 Landing Page

A small bilingual landing page for the Resulam France visit and the free August 9, 2026 conference.

## What it does

- Shows English or French copy from the visitor's browser language.
- Advertises the France dates: August 6-11, 2026.
- Highlights the free August 9 conference and limited places.
- Collects booking name, email, and optional phone number.
- Saves bookings to `data/bookings.jsonl` and sends an email notification when SMTP is configured.
- Sends automatic email reminders to participants: every 2 weeks from one month before the event, then daily for the final 3 days (plus event day).

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Azure App Service

This repo deploys to Azure App Service on push to `master` via GitHub Actions (`.github/workflows/azure-webapp.yml`).

Target:

- App: `resulam-france-2026`
- Resource group: `rag-ai-foundations-demo-rg`
- Plan: `ASP-ragaifoundationsdemorg-87d6` (existing)

Build command:

```bash
npm install && npm run build
```

Startup command:

```bash
node server.js
```

GitHub repository secrets required:

```text
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
```

Set these Azure App Service application settings:

```text
BOOKING_CAPACITY=100
BOOKING_GROUP1_CAPACITY=50
BOOKING_AVAILABILITY_SOURCE_URL=
BOOKING_DATA_DIR=/home/data
BOOKING_NOTIFY_EMAILS=contact@resulam.com
BOOKING_STATS_KEY=change-me-in-production
EVENT_DATE=2026-08-09
BOOKING_REMINDER_CRON_KEY=change-me-in-production
AUTH_SMTP_HOST=your SMTP host
AUTH_SMTP_PORT=587
AUTH_SMTP_USERNAME=your SMTP username
AUTH_SMTP_PASSWORD=your-gmail-app-password-without-spaces
AUTH_SMTP_FROM=Resulam France 2026 <contact@resulam.com>
AUTH_SMTP_USE_TLS=true
```

For production, use SMTP so bookings are emailed immediately. The local JSONL file is useful as a fallback and for testing.

SMTP notes:

- `BOOKING_NOTIFY_EMAILS` receives admin alerts; the guest receives confirmation at the email they enter in the form.
- Gmail app passwords are 16 characters. Store them without spaces in Azure (Google displays them as four groups, e.g. `abcd efgh ijkl mnop` → use `abcdefghijklmnop`).
- In `.env.local`, quote values that contain spaces: `AUTH_SMTP_PASSWORD="your value"`.
- After changing App Service settings, restart the app (`Overview` → `Restart`) so the container picks up new values.
- If a guest did not receive email but their booking exists, they can submit the form again with the same email to trigger a confirmation resend.

## Participant reminders

Reminders are sent to everyone in `bookings.jsonl` on this schedule (Paris time, event date `2026-08-09`):

- **Bi-weekly** from 9 July 2026 (one month before) until the daily phase starts
- **Daily** on 6, 7, and 8 August 2026 (the final 3 days before the conference)

A GitHub Actions workflow (`.github/workflows/booking-reminders.yml`) calls `POST /api/bookings/reminders` every day. Set repository secret `BOOKING_REMINDER_CRON_KEY` (or reuse `BOOKING_STATS_KEY`) and optional repository variable `APP_URL`.

Manual trigger:

```bash
curl -X POST "https://resulam-france-2026.azurewebsites.net/api/bookings/reminders" \
  -H "Authorization: Bearer YOUR_CRON_KEY"
```

Sent reminders are logged to `reminders.jsonl` in `BOOKING_DATA_DIR` so each participant receives at most one email per day.
