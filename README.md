# إتقان | Itqan Life OS

> نظام إدارة الحياة الإسلامي الذكي — للطلاب والموظفين والفريلانسرز

---

## ما هو إتقان؟

تطبيق ويب متكامل يجمع بين إدارة الحياة اليومية والجانب الروحاني في مكان واحد:

| الوحدة | الوصف |
|--------|-------|
| 🕌 الصلاة | تتبع الصلوات، أوقات الأذان، إحصائيات الجماعة |
| 📖 القرآن | خطة الختمة، تتبع الحفظ، جدول المراجعة |
| 📿 الأذكار | أذكار الصباح والمساء، عدادات التسبيح |
| 🌙 الصيام | تتبع الصيام، قضاء الفوائت، اقتراحات الأيام |
| 📚 الدراسة | War Room للامتحانات، تتبع المحاضرات |
| 💼 العمل | إدارة المهام والمشاريع والكورسات |
| 💰 الماليات | تتبع الدخل والمصروفات (محمية بـ PIN) |
| 🌿 أسلوب الحياة | العادات اليومية، النوم، الصحة |
| ⚔️ السباق | منافسة مع الأصحاب في الحلقة |
| 🤖 المدرب الذكي | AI Coach بالعربية (Gemini) |

---

## Setup

### Prerequisites
- Node.js 20+
- Firebase project (Firestore + Auth enabled)
- Gemini API key from [aistudio.google.com](https://aistudio.google.com/apikey)

### Frontend
```bash
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
# Opens at http://localhost:3000
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with Firebase service account + Gemini key
npm run dev
# Runs at http://localhost:5000
```

### Firebase Setup
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication → Email/Password**
3. Enable **Firestore Database** (start in test mode)
4. Deploy security rules: copy `firestore.rules` to Firebase Console
5. Deploy indexes: copy `firestore.indexes.json` to Firebase Console

---

## API Endpoints

```
GET  /health

# Auth
GET  /api/v1/auth/me

# Profile
GET  /api/v1/profile
PUT  /api/v1/profile

# Islamic Modules
GET/POST/PUT/DELETE  /api/v1/salah/...
GET/POST/PUT/DELETE  /api/v1/quran/...
GET/POST/PUT/DELETE  /api/v1/adhkar/...
GET/POST/PUT/DELETE  /api/v1/fasting/...
GET/POST/PUT/DELETE  /api/v1/score/...

# Life Modules
GET/POST/PUT/DELETE  /api/v1/subjects
GET/POST/PUT/DELETE  /api/v1/tasks
GET/POST/PUT/DELETE  /api/v1/projects
GET/POST/PUT/DELETE  /api/v1/courses
GET/POST/PUT/DELETE  /api/v1/finance/...
GET/POST/PUT/DELETE  /api/v1/habits
GET/POST             /api/v1/lifestyle

# Social
GET/POST/DELETE  /api/v1/halaqah/...

# AI
POST  /api/v1/ai/coach
POST  /api/v1/ai/plan-day
POST  /api/v1/ai/weekly-review

# Intelligence
GET  /api/v1/intelligence/dashboard
```

---

## Migration

```bash
node scripts/migrate-v2.mjs
```

---

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Recharts, Firebase SDK

**Backend:** Node.js 20, Express 4, TypeScript, Firebase Admin, Gemini AI

**Database:** Cloud Firestore (NoSQL)

**Auth:** Firebase Authentication

---

## Developer

**Fathy** — Egyptian Chinese University, Software Engineering
- GitHub: [@fathy20](https://github.com/fathy20)
