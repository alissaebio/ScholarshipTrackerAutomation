# Scholarship Tracker Automation

A multi-component automation system that captures scholarship opportunities
from email, parses structured data from email bodies, detects near-duplicate
entries using fuzzy matching, and flags upcoming deadlines. Built as a
portfolio project demonstrating workflow automation, data parsing, and
Python scripting.

## Contents

- [Problem](#problem)
- [Solution Architecture](#solution-architecture)
- [Features](#features)
- [Bugs Found and Fixed During Testing](#bugs-found-and-fixed-during-testing)
- [Tech Stack](#tech-stack)
- [Zapier Free Tier Limitation and Workaround](#zapier-free-tier-limitation-and-workaround)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Sample Output](#sample-output)
- [Screenshots](#screenshots)

## Problem

Scholarship emails from services like ScholarshipsCanada and yconic arrive
frequently, each containing multiple opportunities with different deadlines,
amounts, and eligibility criteria. Tracking these manually across a scattered
inbox is error-prone and easy to fall behind on.

## Solution Architecture

Gmail (label:Scholarships)

→ Zapier (single-step Zap: raw email → Google Sheets row)

→ Google Apps Script Webhook (email body parser + duplicate guard)

→ Google Sheets (structured scholarship tracker)

→ Python/Colab Script (fuzzy duplicate detection + deadline digest)

Three interconnected components, each handling a distinct layer:

| Component | Role |
|---|---|
| Zapier Zap | Watches Gmail label, writes raw email data to Sheets |
| Google Apps Script | Parses email body into structured scholarship records, prevents duplicate writes |
| Python (Colab) | Fuzzy duplicate detection across entries, deadline flagging, digest report |


## Features

- **Multi-record parsing** — one email containing multiple scholarships
  produces one row per scholarship, not one row per email
- **Fuzzy duplicate detection** — catches near-duplicates like
  "UCalgary Excellence Award" vs "U of Calgary Excellence Award" (93% match)
  using `rapidfuzz`, with case-insensitive comparison
- **Deadline flagging** — surfaces scholarships closing within 7 days,
  with a configurable `days_ahead` parameter
- **Idempotency** — the Apps Script webhook checks existing entries before
  writing, so running the same automation twice does not create duplicate rows
- **Date normalization** — converts "June 12, 2026" style dates from email
  bodies to ISO 8601 format (YYYY-MM-DD) for consistent sorting and comparison

## Bugs Found And Fixed During Testing

| Bug | Cause | Fix |
|---|---|---|
| Deadline flagging missed same-day deadlines | `datetime.now()` includes time, so a deadline of midnight "already passed" by afternoon | Switched to `datetime.now().date()` for date-only comparison |
| Case-sensitive fuzzy matching missed "Alberta STEM" vs "Alberta Stem" | `fuzz.ratio()` is case-sensitive by default | Applied `.lower()` before comparison |
| Duplicate rows created on repeated webhook calls | No existence check before writing | Added idempotency check against existing sheet entries |
| `google-auth` version conflict in Colab | `pip install --upgrade google-auth` overwrote Colab's pinned version | Pinned back to `2.47.0`, avoided upgrading `google-auth` in future sessions |

## Tech Stack

- **Python** (Google Colab): `gspread`, `rapidfuzz`, `datetime`, `requests`
- **Google Apps Script** (JavaScript): webhook receiver, email body parser,
  Google Sheets writer
- **Zapier**: Gmail trigger, single-step free-tier Zap
- **Google Sheets**: structured data store
- **Gmail**: source, filtered via label and search rules

## Zapier Free Tier Limitation And Workaround

Zapier's free plan only supports single-step Zaps. The Webhooks by Zapier
action (needed to call the Apps Script parser mid-workflow) requires a paid
plan. Rather than upgrading, the architecture was split:

- The Zap handles raw ingestion only (Gmail to Sheets, one step)
- The Apps Script webhook handles parsing and duplicate-checking independently,
  callable via HTTP POST from any source

This separation improves maintainability: the parsing logic can be updated
without modifying the Zap, and the webhook can be tested independently
using the Python requests library.

## Project Structure
scholarship-tracker-automation/

├── README.md

├── zap-config.md

├── notebook/

│   └── scholarship_tracker.ipynb

├── apps-script/

│   └── webhook.gs

└── screenshots/

│   └── zap-setup.png

│   └── digest-output.png

│   └──  sheet-sample.png

## Setup

### 1. Gmail
Create a Gmail label called `Scholarships` and set up a filter:
- Has the words: `subject:(scholarship OR bursary OR award)`
- Action: Apply label → Scholarships

### 2. Google Sheets
Create a spreadsheet called `Scholarship Tracker` with these headers:
- Date Received 
- Scholarship Name 
- Amount 
- Sender 
- Deadline 
- Status

### 3. Apps Script Webhook
- Open the Sheet → Extensions → Apps Script
- Paste the contents of `apps-script/webhook.gs`
- Deploy as a Web App (Execute as: Me, Who has access: Anyone)
- Copy the Web App URL for use in Zapier or direct POST requests

### 4. Zapier
- Create a single-step Zap: Gmail to Google Sheets
- See `zap-config.md` for full field mapping details

### 5. Python Script
- Open `notebook/scholarship_tracker.ipynb` in Google Colab
- Run cells in order (auth → install → load data → digest)

## Sample Output
SCHOLARSHIP TRACKER DIGEST
Checking 12 entries for duplicates!
Possible duplicate (93% similar):

- UCalgary Excellence Award

- U of Calgary Excellence Award
Possible duplicate (100% similar):

- Alberta STEM Bursary

- Alberta Stem Bursary
Checking for deadlines within 7 days
U of Calgary Excellence Award closes in 6 day(s) (deadline: 2026-06-25)

Schulich Leader Scholarship closes in 1 day(s) (deadline: 2026-06-20)
SUMMARY:

12 total entries
2 possible duplicate(s)
2 urgent deadline(s)


## Screenshots

**Zapier Zap setup**

<img width="836" height="644" alt="Image" src="https://github.com/user-attachments/assets/5217c570-81c6-4f6f-a4aa-825dc4f07cb1" />

**Digest output in Google Colab**

<img width="1520" height="838" alt="Image" src="https://github.com/user-attachments/assets/c8812163-0930-4d88-9ceb-e104f8f5eccc" />

**Google Sheet with parsed scholarship data**







*Built as a portfolio project demonstrating Zapier automation, webhook
integration, and Python scripting for a workflow automation internship
application.*
