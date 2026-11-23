# SSAT Report Examples — Redacted Executive vs. Internal Technical

All examples below use **synthetic fictional data** from *Example Scholarship Foundation (FICTIONAL)*.

## 1. Executive Risk Brief (Default: Redacted Summary)

> **Self-assessment notice:** This summary reflects an internal scholarship security self-assessment. It is not a compliance certification, legal opinion, or penetration test.

- **Organization:** Example Scholarship Foundation (FICTIONAL) · **Cycle:** Fall example cycle
- **Coverage:** 10 of 30 applicable controls assessed (33% — **Provisional readiness**)
- **Priority Attention Banner:** 4 Critical controls scoring 0 or 1 · 20 controls not yet assessed · 1 stale evidence item · 4 open Critical/High findings

### Sample Redacted Finding

> **Risk (F-001 — Critical):** Reviewers may retain local applicant exports after the review cycle.  
> **Why it matters:** Essays and transcripts may remain accessible outside the application platform.  
> **Control:** `DATA-01` — Score `1` (Partial / unverified) · **Evidence:** `EV-DATA-001` *(storage path omitted in redacted view)*  
> **Action:** Inventory reviewer downloads, define an approved secure review workflow, restrict bulk export, and test disposition.  
> **Owner role:** Program Director + IT Lead · **Target:** 30-day window  
> **Verification criterion:** Sampled reviewer account cannot export outside authorized limits and disposition is tested.

## 2. Detailed Technical Audit (Restricted / Internal)

Includes full control-by-control notes, storage references (e.g., `internal/evidence/EV-DATA-001`), reviewer metadata, simulation test transcripts (using synthetic records only), and explicit exceptions. Marked **CONFIDENTIAL — REVIEW AND REDACT BEFORE SHARING**.
