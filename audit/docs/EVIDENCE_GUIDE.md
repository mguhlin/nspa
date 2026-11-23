# SSAT Evidence Guide — What Good Evidence Looks Like

## Evidence Quality Ladder

1. **Level 1 — Unverified claim (Insufficient for Score 2):** Verbal assurance or marketing copy such as “our vendor encrypts everything.”
2. **Level 2 — Written assertion (Score 1 baseline):** A signed policy, vendor security webpage, or staff interview. Proves intent or policy existence, not live operation.
3. **Level 3 — Relevant dated artifact:** A scoped permission export, contract clause, audit log, configuration screen, or reconciliation sheet showing scope and date.
4. **Level 4 — Observed controlled test with result (Strongest):** An authorized admin demonstrates enforced MFA, checks a sampled former reviewer's deprovisioning, restores a backup, tests a bank-change callback, or runs a synthetic AI prompt-injection check.

## Score Rubric & Proof Rule

- **0 — Not in place / verified failure:** Safeguard is absent or testing shows it fails.
- **1 — Partial, self-attested, or unverified:** Safeguard exists partially or lacks current reviewed proof.
- **2 — Verified and tested:** Requires at least one linked evidence artifact marked `reviewed` or `verified`, a recorded verification method, and a review date.
- **Not assessed:** No conclusion yet; prominently shown as a coverage gap.
- **Not applicable (N/A):** Requires written rationale, scope, reviewer role, and date; never used merely to inflate scores.

## Ten-Domain Quick Reference

1. **DATA (Critical):** Lifecycle data inventory (`DATA-01`), field minimization (`DATA-02`), tested retention/deletion (`DATA-03`).
2. **IAM (Critical):** Enforced MFA coverage (`IAM-01`), reviewer least privilege (`IAM-02`), prompt offboarding/revocation (`IAM-03`).
3. **VEND (Critical):** Accountable vendor/subprocessor register (`VEND-01`), OAuth/API grant audit (`VEND-02`), exit/deletion/incident terms (`VEND-03`).
4. **CONT (Critical):** No-fail scholarship calendar & RTO/RPO (`CONT-01`), tested backup restore (`CONT-02`), deadline-day tabletop (`CONT-03`).
5. **FIN (Critical):** Independent bank-change verification (`FIN-01`), separation of financial duties (`FIN-02`), award-to-disbursement reconciliation (`FIN-03`).
6. **AWARD (High):** Documented eligibility & rubric versions (`AWARD-01`), conflict-of-interest recusals (`AWARD-02`), score change/approval audit trail (`AWARD-03`).
7. **AI (High):** AI inventory & data exposure rules (`AI-01`), agent action & prompt-injection boundaries (`AI-02`), human oversight, bias checks & dispute path (`AI-03`).
8. **RESP (High):** High-consequence event monitoring (`RESP-01`), incident contacts & decision authority (`RESP-02`), verified-fact communications (`RESP-03`).
9. **TECH (High):** Supported device/service patching (`TECH-01`), encryption & key custody (`TECH-02`), cloud/email SPF/DKIM/DMARC & recovery (`TECH-03`).
10. **SUST (High):** Tested data portability & exit (`SUST-01`), ownership/support/full cost (`SUST-02`), manual accessibility & workable user journeys (`SUST-03`).

## Redaction Rule

Never store Social Security numbers, bank account numbers, applicant essays, donor financial details, credentials, or live tokens in SSAT. Record stable evidence IDs (e.g., `EV-DATA-001`) and safe internal reference descriptions instead.
