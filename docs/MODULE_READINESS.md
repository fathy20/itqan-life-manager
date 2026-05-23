# Itqan Module Readiness

Last updated: 2026-05-22

## Goal

Prepare the web app modules so the same data and business rules can be reused safely in a future React Native app.

## Shared Foundation

Status: In progress, first pass complete.

- `src/lib/app-state.ts` sanitizes persisted app state from localStorage and Firestore.
- `src/lib/__tests__/app-state.test.ts` covers corrupted payloads, missing collections, invalid salary values, and stale remote onboarding state.
- `AppContext` now reads persisted state through the sanitizer instead of trusting raw storage.

## Modules

| Module | Data source today | Readiness | Notes |
| --- | --- | --- | --- |
| Auth | Firebase Auth | Partial | Login/register UI improved. Needs auth error coverage and password reset flow. |
| Onboarding | AppContext + Firestore/localStorage | Improved | Rewritten with clear steps and safer persistence. Needs component interaction tests. |
| Home | Hooks + store + AppContext | Partial | UI improved. Needs reliable loading/error states for every data source. |
| Study | AppContext | Tested | Progress, daily lecture load, risk, difficulty, and lecture clamp rules extracted to `src/lib/modules/study.ts` with unit tests. |
| Work | AppContext | Tested | Task split/done state, project progress, and course progress rules extracted to `src/lib/modules/work.ts` with unit tests. |
| Finance | AppContext | Tested | Summary and wishlist rules extracted to `src/lib/modules/finance.ts` with unit tests. |
| Salah | New API hooks | Needs audit | Must decide API-first vs AppContext/offline-first before React Native. |
| Quran | New API hooks | Needs audit | Same decision needed as Salah. |
| Adhkar | New API hooks | Needs audit | Existing hook tests exist, but screen behavior needs coverage. |
| Fasting | New API hooks | Needs audit | Needs CRUD/action tests. |
| Health | AppContext | Needs audit | Needs data validation and UI action test pass. |
| Focus | AppContext | Needs audit | Needs timer behavior tests and persistence tests. |
| Calendar | UI/local date logic | Needs audit | Needs date logic tests. |
| Coach/AI | AI API | Needs audit | Needs graceful fallback, quota/error states, and prompt contract tests. |
| Intelligence | Aggregated APIs | Needs audit | Needs deterministic business rules and empty-state coverage. |
| Sibaq | Store/API hybrid | Needs audit | Needs data model decision before mobile. |

## React Native Preparation Rules

- Keep business logic in `src/lib/modules/*`.
- Keep storage normalization in `src/lib/app-state.ts` until a backend schema is finalized.
- Avoid screen-only calculations for money, progress, streaks, scores, or dates.
- Every module should get:
  - a pure utility file,
  - unit tests for calculations and data guards,
  - UI interaction tests for main buttons,
  - a clear storage contract.

## Next Module Order

1. Onboarding: add interaction tests around next/back/finish.
2. Focus: extract timer/session rules and test them.
3. Health: extract habit/lifestyle calculations and test them.
4. Salah/Quran/Adhkar/Fasting: decide offline-first AppContext vs API-first contract.
5. AI/Coach: add fallback states and prompt/response contract.
