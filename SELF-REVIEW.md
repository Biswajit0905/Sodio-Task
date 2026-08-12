# Code Review Self-Review

If a senior engineer handed me this code, I would flag the following three architectural issues:

## 1. Severless Background Job Execution
- **Issue:** The API route `app/api/enquiries/ingest/route.ts` fires the queue worker `processPendingQueue(prisma)` asynchronously without awaiting it, returning the response immediately to the client.
- **Why it's bad:** This runs fine in local development because the Node process persists. In a serverless environment (e.g. Vercel or AWS Lambda), the execution environment is frozen immediately after the HTTP response is returned. The background LLM processing will be cut off mid-execution, leaving jobs stuck in `PENDING` or `PROCESSING` state.
- **Fix:** Move background queue execution to a dedicated message broker (like BullMQ on Redis), a serverless job scheduler (like Inngest or Upstash), or use an asynchronous worker process.

## 2. Lack of Input Sanitization and Rate Limits
- **Issue:** The `/api/enquiries/ingest` endpoint accepts raw uploads and file contents without checking file size, characters, or schema structures.
- **Why it's bad:** Malicious users can upload a 100MB text file, causing the server to run out of memory during the `.split()` operation or blocking the event loop (DoS attack). Furthermore, we make direct API calls to the Gemini LLM for every block without rate limiting the intake.
- **Fix:** Integrate Zod to strictly validate uploaded payload structures, enforce a maximum file size limit (e.g. 2MB) on the API route, and throttle ingestion using an API rate-limiter.

## 3. Concurrency Write Race Conditions (No Locking)
- **Issue:** The `PUT /api/enquiries/[id]` endpoint parses and merges JSON fields (`currentFields`) using the current state fetched from the database, then overwrites it.
- **Why it's bad:** There are no database transactions or locks. If an agent is manually editing fields in the UI at the exact same moment another agent clicks "Re-run Extraction" or splits the project, one update will silently overwrite the other.
- **Fix:** Implement optimistic concurrency control using a version field in the `Enquiry` model (incrementing on every update) and matching it before executing writes, or use row-level database locks.
