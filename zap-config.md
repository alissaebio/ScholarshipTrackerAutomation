# Zapier Configuration

## Zap: Gmail → Google Sheets

**Trigger**
- App: Gmail
- Event: New Email Matching Search
- Search string: `label:Scholarships`

**Action**
- App: Google Sheets
- Event: Create Spreadsheet Row
- Fields mapped:
  - Date Received → Gmail Date
  - Scholarship Name → Gmail Subject
  - Sender → Gmail From
  - Deadline → (blank — filled manually or via Apps Script webhook)
  - Status → hardcoded "New"

## Free Tier Limitation & Workaround

Zapier's free plan only supports single-step Zaps, which means the
Webhooks by Zapier action (needed to call the Apps Script cleaner
mid-workflow) is unavailable without a paid plan.

**Workaround:** 

The Zap handles raw data ingestion (Gmail → Sheets).
A separate Google Apps Script webhook handles parsing and cleaning,
deployed as a Web App and callable independently via HTTP POST.
This separation also improves maintainability — the parsing logic
can be updated without touching the Zap.
