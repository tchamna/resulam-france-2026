# Resulam France 2026 Landing Page

A small bilingual landing page for the Resulam France visit and the free August 9, 2026 conference.

## What it does

- Shows English or French copy from the visitor's browser language.
- Advertises the France dates: August 6-11, 2026.
- Highlights the free August 9 conference and limited places.
- Collects booking name, email, and optional phone number.
- Saves bookings to `data/bookings.jsonl` and sends an email notification when SMTP is configured.

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
BOOKING_CAPACITY=50
BOOKING_DATA_DIR=/home/data
BOOKING_NOTIFY_EMAILS=contact@resulam.com
BOOKING_STATS_KEY=change-me-in-production
AUTH_SMTP_HOST=your SMTP host
AUTH_SMTP_PORT=587
AUTH_SMTP_USERNAME=your SMTP username
AUTH_SMTP_PASSWORD=your SMTP password
AUTH_SMTP_FROM=Resulam France 2026 <contact@resulam.com>
```

For production, use SMTP so bookings are emailed immediately. The local JSONL file is useful as a fallback and for testing.
