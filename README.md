# إتقان | Itqan Life Manager

> نظام إدارة الحياة الذكي لطلاب الجامعة والموظفين والفريلانسرز

---

## ما هو إتقان؟

إتقان هو تطبيق ويب متكامل يساعدك على إدارة حياتك كلها في مكان واحد:
- مواد الجامعة ومواعيد الامتحانات
- مهام العمل والفريلانس
- الماليات والمصروفات
- العادات اليومية والصحة
- التقويم والتركيز

---

## Architecture الكاملة

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENTS                              │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ Web (React) │    │ Flutter App │    │ Future Apps │  │
│  │  Port 3000  │    │  (قريباً)   │    │             │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │ HTTPS + Firebase ID Token
                    ┌───────▼────────┐
                    │   API Gateway  │
                    │  Express v1    │
                    │  Port 5000     │
                    │  Rate Limited  │
                    └───────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
   ┌──────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐
   │  Firestore  │  │ Firebase Auth│  │  Firebase   │
   │  Database   │  │  (Auth)      │  │  Storage    │
   │  (NoSQL)    │  │              │  │  (قريباً)   │
   └─────────────┘  └──────────────┘  └─────────────┘
```

---

## Project Structure

```
itqan/
│
├── src/                          # React Web App (Frontend)
│   ├── pages/
│   │   ├── AuthScreen.tsx        # شاشة تسجيل الدخول/إنشاء حساب
│   │   ├── Onboarding.tsx        # شاشة الإعداد الأولي (4 خطوات)
│   │   ├── Dashboard.tsx         # الصفحة الرئيسية والإحصائيات
│   │   ├── StudySystem.tsx       # نظام الدراسة والامتحانات
│   │   ├── WorkSystem.tsx        # إدارة المهام والمشاريع
│   │   ├── FinanceSystem.tsx     # الإدارة المالية
│   │   ├── LifestyleSystem.tsx   # العادات وأسلوب الحياة
│   │   ├── CalendarView.tsx      # التقويم الشامل
│   │   ├── FocusTimer.tsx        # مؤقت البومودورو
│   │   ├── TelegramCoach.tsx     # المدرب الذكي (Gemini AI)
│   │   └── PlanBuilder.tsx       # استيراد البيانات
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       # القائمة الجانبية (Desktop)
│   │   │   ├── BottomNav.tsx     # القائمة السفلية (Mobile)
│   │   │   └── CommandBar.tsx    # شريط الأوامر السريع (Ctrl+K)
│   │   └── FinanceLock.tsx       # حماية الماليات بباسورد
│   │
│   ├── context/
│   │   └── AppContext.tsx        # State Management + Firebase Sync
│   │
│   ├── lib/
│   │   ├── firebase.ts           # Firebase Client SDK
│   │   ├── api.ts                # API Client Layer
│   │   └── utils.ts              # Utility functions (cn)
│   │
│   └── types/
│       └── index.ts              # TypeScript Types
│
├── backend/                      # Express API Server
│   └── src/
│       ├── routes/
│       │   ├── auth.ts           # /api/v1/auth
│       │   ├── profile.ts        # /api/v1/profile
│       │   ├── subjects.ts       # /api/v1/subjects
│       │   ├── tasks.ts          # /api/v1/tasks
│       │   ├── projects.ts       # /api/v1/projects
│       │   ├── courses.ts        # /api/v1/courses
│       │   ├── finance.ts        # /api/v1/finance/*
│       │   ├── habits.ts         # /api/v1/habits
│       │   └── lifestyle.ts      # /api/v1/lifestyle
│       ├── middleware/
│       │   └── auth.ts           # Firebase Token Verification
│       └── lib/
│           └── firebase-admin.ts # Firebase Admin SDK
│
├── shared/                       # مشترك بين Web + Flutter + Backend
│   ├── types/index.ts            # TypeScript/Dart Types
│   └── constants/index.ts        # API Routes, Colors, Labels
│
├── scripts/
│   └── seed-fathy.mjs            # رفع بيانات فتحي لـ Firestore
│
├── docker-compose.yml            # تشغيل كل حاجة بـ Docker
├── Dockerfile.frontend           # React + Nginx Container
├── backend/Dockerfile            # Express API Container
└── nginx.conf                    # Nginx Config (Proxy + Cache)
```

---

## Firestore Database Structure

```
users/
└── {uid}/                        # كل user عنده document منفصل
    ├── profile (document)        # بيانات المستخدم
    ├── subjects/
    │   └── {subjectId}           # مادة دراسية
    ├── tasks/
    │   └── {taskId}              # مهمة
    ├── projects/
    │   └── {projectId}           # مشروع
    ├── courses/
    │   └── {courseId}            # كورس
    ├── transactions/
    │   └── {txId}                # معاملة مالية
    ├── wishlist/
    │   └── {itemId}              # منتج في الأمنيات
    ├── commitments/
    │   └── {commitId}            # التزام مالي (قسط/جمعية)
    ├── habits/
    │   └── {habitId}             # عادة يومية
    ├── lifestyle_logs/
    │   └── {date}                # سجل يومي (نوم/هاتف/ماء)
    └── focus_sessions/
        └── {sessionId}           # جلسة تركيز
```

---

## API Endpoints (v1)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/me` | بيانات المستخدم الحالي |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/profile` | جلب البروفايل |
| PUT | `/api/v1/profile` | تحديث البروفايل |

### Study System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subjects` | كل المواد |
| POST | `/api/v1/subjects` | إضافة مادة |
| PUT | `/api/v1/subjects/:id` | تعديل مادة |
| DELETE | `/api/v1/subjects/:id` | حذف مادة |

### Work System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | كل المهام |
| POST | `/api/v1/tasks` | إضافة مهمة |
| PUT | `/api/v1/tasks/:id` | تعديل/إنجاز مهمة |
| DELETE | `/api/v1/tasks/:id` | حذف مهمة |
| GET | `/api/v1/projects` | كل المشاريع |
| POST | `/api/v1/projects` | إضافة مشروع |
| PUT | `/api/v1/projects/:id` | تعديل مشروع |
| DELETE | `/api/v1/projects/:id` | حذف مشروع |
| GET | `/api/v1/courses` | كل الكورسات |
| POST | `/api/v1/courses` | إضافة كورس |
| PUT | `/api/v1/courses/:id` | تعديل كورس |
| DELETE | `/api/v1/courses/:id` | حذف كورس |

### Finance System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/finance/transactions` | كل المعاملات |
| POST | `/api/v1/finance/transactions` | إضافة معاملة |
| DELETE | `/api/v1/finance/transactions/:id` | حذف معاملة |
| GET | `/api/v1/finance/wishlist` | قائمة الأمنيات |
| POST | `/api/v1/finance/wishlist` | إضافة منتج |
| PUT | `/api/v1/finance/wishlist/:id` | تعديل منتج |
| DELETE | `/api/v1/finance/wishlist/:id` | حذف منتج |
| GET | `/api/v1/finance/commitments` | الالتزامات |
| POST | `/api/v1/finance/commitments` | إضافة التزام |
| PUT | `/api/v1/finance/commitments/:id` | تعديل التزام |
| DELETE | `/api/v1/finance/commitments/:id` | حذف التزام |

### Lifestyle & Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/habits` | كل العادات |
| POST | `/api/v1/habits` | إضافة عادة |
| PUT | `/api/v1/habits/:id` | تعديل/تسجيل إنجاز |
| DELETE | `/api/v1/habits/:id` | حذف عادة |
| GET | `/api/v1/lifestyle` | سجلات الحياة |
| POST | `/api/v1/lifestyle` | تسجيل يوم جديد |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | فحص حالة السيرفر |

---

## Authentication Flow

```
1. User opens app
       ↓
2. Firebase Auth check
       ↓
   ┌───┴───┐
   │       │
Not     Logged in
logged       ↓
in      Has profile?
   ↓    ┌───┴───┐
AuthScreen │       │
(Login/ No      Yes
Register)  ↓       ↓
       Onboarding Dashboard
       (4 steps)
           ↓
       Data saved to
       Firestore/{uid}
```

---

## Pages شرح كل صفحة

### 1. AuthScreen - تسجيل الدخول
- إنشاء حساب جديد بـ Email + Password
- تسجيل دخول لحساب موجود
- Firebase Authentication
- Error messages بالعربي

### 2. Onboarding - الإعداد الأولي (4 خطوات)
- **Step 1**: اسمك + جامعة + دور (طالب/موظف/فريلانسر)
- **Step 2**: مواد الامتحانات + تواريخها + صعوبتها
- **Step 3**: مشاريع العمل + كورسات التطوير
- **Step 4**: العادات اليومية
- لو كتبت "فتحي" → بياناتك بتتملى أوتوماتيك

### 3. Dashboard - الرئيسية
- إحصائيات سريعة (إنجاز، ضغط، ميزانية، نوم)
- مؤشر الضغط الأسبوعي (Chart)
- أهم الأولويات اليوم
- War Room (الامتحان القادم)
- عقل المشروع (FlightAssist)
- توصية الذكاء الاصطناعي

### 4. StudySystem - نظام الدراسة
- War Room للامتحانات (timeline)
- تتبع تقدم كل مادة (محاضرات)
- حساب المحاضرات المطلوبة يومياً
- مواد في منطقة الخطر
- إضافة/تعديل/حذف مواد

### 5. WorkSystem - إدارة العمل
- قائمة مهام مع فلتر (وظيفة/فريلانس/دراسة)
- إضافة مهام مع نوع التركيز (عميق/متوسط/خفيف)
- إنجاز/إلغاء إنجاز المهام
- حذف المهام
- المشاريع النشطة
- كورسات التطوير مع progress bar

### 6. FinanceSystem - الماليات (محمية بباسورد)
- رصيد كلي + مرتب + دخل + مصروفات
- مخطط الميزانية
- إضافة معاملات (مصروف/دخل)
- الالتزامات (أقساط/جمعيات)
- قائمة الأمنيات مع progress توفير
- رسم بياني توزيع المصروفات
- نصيحة مالية ذكية
- **حماية بـ PIN** - blur حتى تدخل الباسورد

### 7. LifestyleSystem - أسلوب الحياة
- العادات اليومية مع toggle إنجاز
- إضافة/حذف عادات
- تسجيل اليوم (نوم/هاتف/ماء/خطوات)
- رسم بياني ساعات النوم
- إحصائيات استخدام الهاتف
- الجانب الروحاني (صلوات/ورد)

### 8. CalendarView - التقويم
- تقويم شهري كامل
- عرض الامتحانات والمهام على التقويم
- أجندة اليوم المحدد (dynamic)
- الامتحانات القادمة مع عداد الأيام
- أيام الأسبوع تبدأ من السبت (عربي)

### 9. FocusTimer - مؤقت التركيز
- Pomodoro Timer (25 دقيقة)
- راحة قصيرة (5 دقائق)
- راحة طويلة (15 دقيقة)
- دائرة progress متحركة
- عداد الجلسات المنجزة

### 10. TelegramCoach - المدرب الذكي
- Chat مع Gemini AI
- المدرب يعرف بياناتك (مواد/مهام/ماليات)
- نصائح مخصصة بناءً على وضعك
- Insights سريعة في الـ sidebar
- تذكيرات قادمة

### 11. CommandBar - شريط الأوامر (Ctrl+K)
- إضافة مهمة سريعة
- تسجيل مصروف/دخل سريع
- اختصارات لوحة المفاتيح

---

## Tech Stack

### Frontend
| Technology | Version | الاستخدام |
|-----------|---------|-----------|
| React | 19 | UI Framework |
| TypeScript | 5.8 | Type Safety |
| Vite | 6 | Build Tool |
| Tailwind CSS | 4 | Styling |
| Motion (Framer) | 12 | Animations |
| Recharts | 3 | Charts |
| Lucide React | 0.5 | Icons |
| date-fns | 4 | Date Utils |
| Firebase SDK | 11 | Auth + Firestore |

### Backend
| Technology | Version | الاستخدام |
|-----------|---------|-----------|
| Node.js | 20 | Runtime |
| Express | 4 | HTTP Server |
| TypeScript | 5.8 | Type Safety |
| Firebase Admin | 13 | Firestore + Auth |
| express-rate-limit | - | Rate Limiting |
| tsx | 4 | Dev Runner |

### Infrastructure
| Technology | الاستخدام |
|-----------|-----------|
| Firebase Auth | Authentication |
| Cloud Firestore | Database |
| Docker | Containerization |
| Nginx | Reverse Proxy + Static Files |
| GitHub | Version Control |

---

## Run Locally

### Prerequisites
- Node.js 20+
- Firebase Project (مع Firestore + Auth مفعّلين)

### Frontend
```bash
npm install
npm run dev
# يفتح على http://localhost:3000
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# أضف Firebase credentials في .env
npm run dev
# يشتغل على http://localhost:5000
```

### Docker (Full Stack)
```bash
# أضف .env في الـ root
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_key
```

### Backend (.env)
```env
PORT=5000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## Security

- **Firebase Auth** - كل request بيتحقق منه بـ ID Token
- **Firestore Rules** - كل user يقدر يوصل لـ data بتاعته بس
- **Rate Limiting** - 200 request كل 15 دقيقة
- **Finance PIN** - الماليات محمية بـ PIN منفصل
- **CORS** - محدود على الـ origins المسموح بيها

---

## Flutter Integration (قريباً)

```
shared/types/index.ts  →  يتحول لـ Dart models
shared/constants/      →  نفس الـ API routes
Firebase Auth          →  نفس الـ token
API v1                 →  نفس الـ endpoints
```

---

## Developer

**Fathy** - Egyptian Chinese University, Software Engineering
- GitHub: [@fathy20](https://github.com/fathy20)
- Project: [itqan-life-manager](https://github.com/fathy20/itqan-life-manager)
