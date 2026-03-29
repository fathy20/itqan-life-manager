# إتقان | Itqan Life Manager

نظام إدارة الحياة الذكي - دراسة، عمل، مالية، وأسلوب حياة.

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Web (React) │    │ Flutter App │    │ Future Apps │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       └──────────────────┼──────────────────┘
                    ┌─────▼──────┐
                    │  API v1    │  Express + Firebase Auth
                    │ Port 5000  │  Rate Limited + CORS
                    └─────┬──────┘
                ┌─────────┼─────────┐
          ┌─────▼───┐ ┌───▼────┐ ┌──▼──────┐
          │Firestore│ │  Auth  │ │Storage  │
          └─────────┘ └────────┘ └─────────┘
```

## Project Structure

```
itqan/
├── src/                    # React Web App
│   ├── pages/              # All pages
│   ├── components/         # Reusable components
│   ├── context/            # App state (AppContext)
│   ├── lib/
│   │   ├── firebase.ts     # Firebase client
│   │   └── api.ts          # API client layer
│   └── types/              # Frontend types
├── backend/                # Express API Server
│   └── src/
│       ├── routes/         # API routes (v1)
│       ├── middleware/      # Auth middleware
│       └── lib/            # Firebase Admin
├── shared/                 # Shared between all clients
│   ├── types/              # TypeScript types
│   └── constants/          # API routes, colors, labels
├── docker-compose.yml      # Full stack Docker
├── Dockerfile.frontend     # React + Nginx
└── backend/Dockerfile      # Express API
```

## API Endpoints (v1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/v1/profile` | User profile |
| CRUD | `/api/v1/subjects` | Study subjects |
| CRUD | `/api/v1/tasks` | Tasks |
| CRUD | `/api/v1/projects` | Projects |
| CRUD | `/api/v1/courses` | Courses |
| CRUD | `/api/v1/finance/transactions` | Transactions |
| CRUD | `/api/v1/finance/wishlist` | Wishlist |
| CRUD | `/api/v1/finance/commitments` | Commitments |
| CRUD | `/api/v1/habits` | Habits |
| CRUD | `/api/v1/lifestyle` | Lifestyle logs |

## Run Locally

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
cp .env.example .env  # Add Firebase credentials
npm run dev
```

## Docker

```bash
docker-compose up --build
```

## Flutter Integration

The `shared/` folder contains types and constants ready to be used in Flutter via `dart_mappings/` (coming soon).

All API calls use Firebase ID Token in `Authorization: Bearer <token>` header.
