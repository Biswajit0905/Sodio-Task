# Sodio Enquiry Triage Console

An AI-assisted full-stack internal console to ingest, parse, score, and manage unstructured project enquiries. Built using **Next.js (App Router)**, **SQLite**, and **Prisma ORM**, styled with custom **Vanilla CSS Modules**, and integrated with the **Google Gemini API** (with secure local stubs).

---

## Run it

Follow these steps to run the application locally. We assume you have **Node.js (v18+)** installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"

# Optional: Add your Gemini API key for live LLM extraction.
# If omitted, the console automatically falls back to our deterministic, 
# high-fidelity local mock engine for the 20 sample enquiries and rule-based parsing.
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Run Database Migrations
Deploy the schema and seed/initialize the SQLite database:
```bash
npx prisma migrate dev --name init
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run the Unit Tests
To run our standalone test suite verifying parsing, scoring rules, and prompt injection defense:
```bash
npm test
```

---

## What works / what doesn't

### What Works:
- **File Ingest:** Uploading `sample-enquiries.txt` parses and triages all 20 entries concurrently and asynchronously.
- **Single Pasted Ingest:** Pasting raw text or email bodies into the text area instantly triages them.
- **AI Extraction & Fallbacks:** Seamlessly parses contact details, budget range, timeline, summary, multiple projects flag, and genuineness using the Gemini LLM. If the `GEMINI_API_KEY` is not provided, it falls back to a mock matching engine (returning high-fidelity matching data for the 20 enquiries) and keyword-based regex heuristics for custom messages.
- **Custom Priority Scoring:** Evaluates priority (High / Medium / Low) in-code using custom rules based on budget limits and urgency.
- **Fuzzy Search & Filters:** Instantly filters the list by Service Line, Priority, Workflow Status, and Genuineness, with live text searching.
- **Workflow Stepper:** Custom state stepper (`NEW` -> `CONTACTED` -> `QUALIFIED` -> `DROPPED`) in the side details drawer.
- **Inline Editing:** Form inputs let humans correct any field, updating the database columns and current metadata.
- **Thread Linking (Double Submissions):** Automatically groups duplicate or follow-up submissions received within a 7-day window under a primary "parent" thread.
- **Re-extraction & Merge Diff:** Re-running extraction opens aSide-by-Side comparison dialog highlighting what changed, preventing human edits from being silently overwritten.
- **Project Splitting:** Clicking "Split Project" duplicates an enquiry to manage two separate requests independently (cloning columns and metadata).
- **Concurrency & Progress:** Ingestion triggers a background Promise queue limited to `3` concurrent extractions. If one fails, the error is logged to that item, and the queue continues.
- **Unit Verification:** Standalone unit test suite runs 100% locally.

### What Doesn't:
- **Real-Time WebSockets/SSE:** We use 1.5s interval polling from the client while background queues are running. This works perfectly locally but lacks WebSocket-based push sockets.
- **User Authentication:** As explicitly declared out of scope, there is no auth or session token management. It runs in a single shared workspace.

---

## Decisions

Here is how we resolved the holes left in the client brief:

1. **Duplicate Enquiries (e.g. Rachel Whitfield and Rachel W):**
   - *Decision:* Group submissions by email address. If an email has sent an enquiry within a 7-day window, mark subsequent ones as `isFollowUp = true` and link them to the oldest active parent. The UI renders thread navigation links, letting the agent jump between follow-up notes.
2. **Flexible and Multi-Currency Budgets:**
   - *Decision:* The LLM extracts raw budget text (preserving currency like £ or lakhs) and currency code (INR, GBP, USD, EUR). It normalizes minimum and maximum limits into USD (`budgetMinUSD` and `budgetMaxUSD`). "35-40 lakhs" in India is converted to $42k-$48k USD, and "25.000 €" becomes $27k USD. This enables sorting and scoring.
3. **Non-enquiries / Spam / Bounces:**
   - *Decision:* The LLM classifies them as `isGenuine = false`. Non-genuine entries are automatically marked as `LOW` priority and `DROPPED` status, keeping them out of the primary active workflow.
4. **Prompt Injection / Model-Targeted Text (e.g. "system" message from contact@qa-test-mail.io):**
   - *Decision:* Configured strict system prompt isolation. The email body is passed as untrusted content, and the model is instructed to treat all input strictly as data, never as system instructions. Furthermore, prompt injection attempts are classified as `isGenuine = false` (malicious attack/non-genuine request), automatically routing them to Low priority.
5. **ASAP vs. Fixed Timelines:**
   - *Decision:* Normalizes timeline to months until start. "ASAP" = 0. "Q1 next year" (relative to current date mid-2026) = 6 months. Unspecified/flexible = -1.
6. **Multiple Projects in One Message (e.g. Priya Ramanathan):**
   - *Decision:* The LLM flags `hasMultipleProjects = true`. In the detail view, the agent can click **Split Project** to duplicate the enquiry. The original is renamed to `[Name] (Project 1)` and the duplicate to `[Name] (Project 2)`, allowing separate workflows.

---

## Re-extraction

- **Implementation:** To avoid silently destroying human edits during re-extraction, the `/api/enquiries/[id]/reextract` endpoint returns the newly parsed AI fields without saving them. The UI displays a **Merge Diff Modal** comparing Current Saved Data vs. New AI Extracted Data. Differences are highlighted. Overwriting checkmarks default to `false` (do not overwrite) so the user must explicitly opt-in to accept changes, protecting their edits.
- **With More Time:** I would implement a visual inline word-diff (green/red highlights) directly within the form fields, letting the user toggle between "AI Suggestion" and "Human Version" with a single click, rather than displaying a separate pop-up modal.

---

## Scoring rule

The priority score is calculated in our TypeScript logic (`lib/scoring.ts`) using these thresholds:
- **LOW:**
  - Any non-genuine message (`isGenuine = false` - SEO spam, hiring, bounces, prompt injection).
  - Any commercial project with an explicit budget of `$0` (student requests).
- **HIGH:**
  - Any genuine project with a maximum budget `>= $50,000 USD`.
  - Any genuine project with immediate start (`timelineNormalizedMonths === 0` or "ASAP") AND substantial budget (`>= $10,000 USD` or `flexible` / `TBD`).
- **MEDIUM:**
  - All other genuine projects (moderate budgets, flexible timelines, new project exploration).

*Reasoning:* Genuine commercial interest with high budgets represents our primary lead pipeline. Urgent requests with reasonable budgets represent immediate capture revenue, so they are elevated. Spam and non-commercial student requests are immediately deprioritized to save engineer triage time.

---

## Two more days

If we had two more days, we would:
1. **Interactive Email Client:** Add a native reply mail compose window inside the console, so when the status transitions to `CONTACTED`, it prompts the agent to send an auto-generated initial proposal template based on the extracted service line and summary.
2. **Elasticsearch / Full-text indexing:** Replace simple Javascript in-memory filtering with full-text search indexing on SQLite or Postgres using trigrams/FTS5 for advanced multi-word searches.
3. **Audit Log & History:** Track a detailed history of changes made to each enquiry (who changed the status, what fields were updated, when it was split), rendering an activity timeline inside the drawer.
