// ═══════════════════════════════════════════════════════════════
//  INTEGRATION GUIDE
//  How to wire each screen to the backend
//  
//  Architecture:
//  
//  ┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────┐
//  │  UI Screen   │ →  │  React Hook  │ →  │  API Client   │ →  │  Express   │ →  Firestore
//  │  (JSX)       │    │  (useXxx)    │    │  (xxxApi)     │    │  Service   │
//  └─────────────┘     └─────────────┘     └──────────────┘     └───────────┘
//  
//  itqan-salah.jsx  →  useSalah()  →  salahApi.logPrayer()  →  salah.routes.ts → salah.service.ts → Firestore
//  itqan-quran.jsx  →  useQuran()  →  quranApi.logSession() →  quran.routes.ts → quran.service.ts → Firestore
//  etc.
// ═══════════════════════════════════════════════════════════════

// ─── EXAMPLE: Connecting the Salah Screen ─────────────────────
//
// Before (static data):
//   const PRAYERS_TODAY = [{ name: "الفجر", status: "done", ... }];
//
// After (live data from Firestore):

import { useSalah } from "../hooks";
import { useProfile } from "../hooks";

function SalahPageConnected() {
  const { profile } = useProfile();
  const {
    prayerLog,     // Today's prayer log from Firestore
    times,         // Prayer times from Aladhan API
    loading,       // Loading state
    fetchTimes,    // Fetch prayer times for user's location
    logPrayer,     // Log a prayer (saves to Firestore)
    logExtra,      // Log witr/qiyam/duha
    stats,         // Weekly/monthly stats
    qada,          // Qada counter
    updateQada,    // Update qada count
  } = useSalah();

  // Fetch prayer times when profile loads
  // useEffect(() => {
  //   if (profile?.location) {
  //     fetchTimes(profile.location.lat, profile.location.lng, profile.prayerMethod);
  //   }
  // }, [profile]);

  // ─── Connecting the UI ──────────────────────────────────────
  //
  // REPLACE static data with hook data:
  //
  // BEFORE: const PRAYERS = [{ name: "الفجر", time: "4:32", status: "done" }]
  // AFTER:  Build PRAYERS from prayerLog + times
  //
  const PRAYERS = times ? [
    {
      name: "الفجر", time: times.fajr,
      status: prayerLog?.prayers?.fajr?.status || "pending",
      jamaah: prayerLog?.prayers?.fajr?.jamaah || false,
    },
    {
      name: "الظهر", time: times.dhuhr,
      status: prayerLog?.prayers?.dhuhr?.status || "pending",
      jamaah: prayerLog?.prayers?.dhuhr?.jamaah || false,
    },
    // ... same for asr, maghrib, isha
  ] : [];

  // ─── Action Handlers ────────────────────────────────────────
  //
  // BEFORE: onClick does nothing
  // AFTER:  onClick calls the API

  const handlePrayerLog = async (prayer, status, options) => {
    const result = await logPrayer(prayer, status, options);
    // result.success → prayer saved to Firestore
    // Hook auto-refetches the updated data
  };

  const handleQadaDecrement = async () => {
    await updateQada(-1); // -1 = prayed one qada
    // Hook auto-refetches
  };

  // ─── The UI stays exactly the same! ─────────────────────────
  // Just replace static data references with hook data.
  // The visual design doesn't change at all.

  return null; // Replace with your actual JSX
}


// ═══════════════════════════════════════════════════════════════
//  WIRING GUIDE FOR EVERY SCREEN
// ═══════════════════════════════════════════════════════════════
//
//  Screen               Hook              API Module         Backend Service
//  ──────────────────────────────────────────────────────────────────────────
//  itqan-home.jsx       useScore()        scoreApi           score.service.ts
//                       useProfile()      profileApi         profile.service.ts
//                       useSalah()        salahApi           salah.service.ts
//
//  itqan-dashboard.jsx  useScore()        scoreApi           score.service.ts
//                       useSalah()        salahApi           salah.service.ts
//                       useQuran()        quranApi           quran.service.ts
//                       useAdhkar()       adhkarApi          adhkar.service.ts
//                       useWork()         workApi            work.service.ts
//                       useHalaqah()      halaqahApi         halaqah.service.ts
//                       useLifestyle()    lifestyleApi       lifestyle.service.ts
//                       useIntelligence() intelligenceApi    intelligence.service.ts
//
//  itqan-salah.jsx      useSalah()        salahApi           salah.service.ts
//
//  itqan-quran.jsx      useQuran()        quranApi           quran.service.ts
//
//  itqan-adhkar.jsx     useAdhkar()       adhkarApi          adhkar.service.ts
//
//  itqan-sibaq.jsx      useScore()        scoreApi           score.service.ts
//                       useHalaqah()      halaqahApi         halaqah.service.ts
//
//  itqan-focus.jsx      useFocus()        focusApi           focus.service.ts
//                       useSalah()        salahApi           (prayer time alerts)
//
//  itqan-coach.jsx      useAICoach()      aiApi              ai.service.ts → Gemini
//
//  itqan-calendar.jsx   useSalah()        salahApi           salah.service.ts
//                       useStudy()        studyApi           study.service.ts
//                       useWork()         workApi            work.service.ts
//                       useFasting()      fastingApi         fasting.service.ts
//
//  itqan-study.jsx      useStudy()        studyApi           study.service.ts
//
//  itqan-work.jsx       useWork()         workApi            work.service.ts
//
//  itqan-finance.jsx    useFinance()      financeApi         finance.service.ts
//
//  itqan-lifestyle.jsx  useLifestyle()    lifestyleApi       lifestyle.service.ts
//
// ═══════════════════════════════════════════════════════════════
//  STEP BY STEP: Adding a new module
// ═══════════════════════════════════════════════════════════════
//
//  1. Define types in        shared/types/index.ts
//  2. Add API endpoints in   src/lib/api.ts        (xxxApi object)
//  3. Create React hook in   src/hooks/index.ts     (useXxx function)
//  4. Create backend service  backend/src/modules/xxx/xxx.service.ts
//  5. Create backend routes   backend/src/modules/xxx/xxx.routes.ts
//  6. Mount routes in         backend/src/app.ts     (v1.use("/xxx", xxxRoutes))
//  7. Connect UI screen to hook (replace static data with hook data)
//
//  That's it. Every module follows the exact same pattern.
// ═══════════════════════════════════════════════════════════════

export {};
