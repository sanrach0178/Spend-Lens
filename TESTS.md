# TESTS.md — SpendLens Test Guide

## Overview

SpendLens has two test suites:

| Layer    | Framework             | Location                                              |
| -------- | --------------------- | ----------------------------------------------------- |
| Frontend | Jest + ts-jest        | `frontend/src/__tests__/audit-engine.test.ts`         |
| Backend  | JUnit 5 + Mockito     | `backend/src/test/java/com/spendlens/backend/`        |

---

## Running All Tests

### Frontend (Jest)

```bash
cd frontend && npm test
```

This runs the full Jest suite, including:
- Cursor Business downgrade recommendation
- Cursor Pro non-coding use case mismatch
- Copilot + Cursor redundancy detection
- ChatGPT Team vs 2× Plus comparison
- Claude Max → Team plan downgrade
- Optimal setup (zero savings) verification
- `showCredex` threshold (>$500 / <$500)
- Annual = 12× monthly savings invariant
- Over-provisioned seats flagging
- Edge cases (savings cap, empty tools, Cursor + Windsurf)

### Backend (Maven / JUnit 5)

```bash
cd backend && ./mvnw test
```

> On Windows, use `mvnw.cmd test` instead.

This runs:
- `AuditControllerTest` — 3 tests
  - `POST /api/audit/run` → 200 with valid body
  - `POST /api/audit/run` → 429 when rate limit exceeded (mocked Bucket4j)
  - `GET /api/audit/{publicId}` → 404 for unknown ID

---

## Test Coverage Summary

| Test Case                                        | File               | Status |
| ------------------------------------------------ | ------------------- | ------ |
| Cursor Business → downgrade to Pro               | audit-engine.test.ts | ✅     |
| Cursor Pro non-coding → cancel                   | audit-engine.test.ts | ✅     |
| Copilot + Cursor → redundant                     | audit-engine.test.ts | ✅     |
| ChatGPT Team 2 users → 2× Plus                   | audit-engine.test.ts | ✅     |
| Claude Max team → Team plan                      | audit-engine.test.ts | ✅     |
| Optimal setup → zero savings                     | audit-engine.test.ts | ✅     |
| showCredex true (>$500)                          | audit-engine.test.ts | ✅     |
| showCredex false (<$500)                         | audit-engine.test.ts | ✅     |
| Annual = 12× monthly                            | audit-engine.test.ts | ✅     |
| Over-provisioned seats flagging                  | audit-engine.test.ts | ✅     |
| Savings cap ≤ monthlySpend                       | audit-engine.test.ts | ✅     |
| Empty tools array                                | audit-engine.test.ts | ✅     |
| Cursor + Windsurf redundancy                     | audit-engine.test.ts | ✅     |
| POST /api/audit/run → 200                        | AuditControllerTest  | ✅     |
| POST /api/audit/run → 429                        | AuditControllerTest  | ✅     |
| GET /api/audit/{id} → 404                        | AuditControllerTest  | ✅     |
