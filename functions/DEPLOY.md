# Cloud Functions — A0 Deployment Guide

This is a one-time setup. Once done, `npm run deploy` from `functions/` handles everything.

---

## Prerequisites (your machine)

```bash
npm install -g firebase-tools
firebase login
```

Verify:
```bash
firebase projects:list
# You should see: add-project-3a441
```

---

## Step 1 — Enable required APIs

In Firebase Console → **Project settings → Your project**:

1. **Cloud Messaging API (V1)** — should already be enabled if you use Firebase Auth.
   - Verify at: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=add-project-3a441
2. **Cloud Functions API** — enable on first deploy.
3. **Cloud Scheduler API** — enable on first deploy.
4. **Cloud Build API** — required to build functions.
5. **Artifact Registry API** — required for Gen 2 functions.

The CLI will prompt you to enable these automatically. Click "y" to each.

---

## Step 2 — Set the test-FCM secret

```bash
firebase functions:secrets:set TEST_FCM_SECRET
# Paste any long random string, e.g. output of: openssl rand -hex 32
```

Confirm it's stored:
```bash
firebase functions:secrets:access TEST_FCM_SECRET
```

---

## Step 3 — Deploy

From repo root:
```bash
firebase deploy --only functions,firestore:indexes
```

First deploy takes 3-5 minutes. You'll see output like:
```
✔ functions[healthcheck(us-central1)]: Successful create operation.
✔ functions[testFcm(us-central1)]: Successful create operation.
✔ functions[plannerDaily(us-central1)]: Successful create operation.
✔ functions[dispatcher(us-central1)]: Successful create operation.

Function URL (healthcheck): https://us-central1-add-project-3a441.cloudfunctions.net/healthcheck
Function URL (testFcm):     https://us-central1-add-project-3a441.cloudfunctions.net/testFcm
```

Save the healthcheck URL.

---

## Step 4 — Verify A0 Definition of Done

### ✅ Check 1 — Healthcheck passes

```bash
curl https://us-central1-add-project-3a441.cloudfunctions.net/healthcheck
```

Expected:
```json
{
  "ok": true,
  "checks": {
    "firestore": { "ok": true },
    "fcm": { "ok": true }
  },
  "projectId": "add-project-3a441",
  "ts": "2026-04-05T..."
}
```

If `fcm.ok: false` → IAM scope missing. See troubleshooting below.
If `firestore.ok: false` → Firestore rules are blocking the function's service account.

### ✅ Check 2 — Schedulers are registered

```bash
gcloud scheduler jobs list --project=add-project-3a441 --location=us-central1
```

You should see:
- `firebase-schedule-plannerDaily-us-central1` (cron: `0 2 * * *`)
- `firebase-schedule-dispatcher-us-central1` (cron: `*/5 * * * *`)

### ✅ Check 3 — Dispatcher runs on schedule

Wait 5 minutes, then:
```bash
firebase functions:log --only dispatcher --lines 20
```

You should see `dispatcher.start` and `dispatcher.done` logs.

### ✅ Check 4 — Manual FCM test (optional, needs a real token)

Get a token from your frontend later. For now, skip — this check is for A3.

---

## Troubleshooting

### `PERMISSION_DENIED: Cloud Functions needs Cloud Messaging permission`
The runtime service account needs `roles/firebase.messaging.admin` or `firebasemcm.admin`.

```bash
PROJECT_ID=add-project-3a441
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/firebasemessaging.admin"
```

### `firestore.ok: false` in healthcheck
Firestore rules blocking server-side writes. Check `firestore.rules` allows server access
(rules don't apply to Admin SDK by default, so this usually means the doc path is wrong).

### Functions redeploy fails with "Build failed"
```bash
cd functions
rm -rf lib node_modules
npm install
npm run build
cd ..
firebase deploy --only functions
```

---

## Cost awareness (A0)

At A0 scale:
- Dispatcher: 288 invocations/day × 30 days = **8,640/month** (free tier: 2M)
- Planner: 30/month
- Each invocation currently does ~0 work → well within free tier

When B4 (real dispatcher) lands, cost model changes — E2 task covers this.

---

## Next step

Once all 4 checks pass, tell Claude **"A0 done"** and we move to **A1 (data model)**.
