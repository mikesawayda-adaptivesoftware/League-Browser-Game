# LoL Hub — League of Legends Puzzle Games

A daily puzzle game hub inspired by League of Legends, featuring 6 game modes.

## Game Modes

| Game | Description |
|---|---|
| **Connections** | Group 16 LoL items into 4 hidden categories |
| **Champion Timeline** | Drag champions into chronological release order |
| **Draft Puzzle** | Counter-draft an enemy team composition |
| **Lore Connections** | Find the shortest lore path between two champions |
| **Ability Sound** | Guess the champion from an ability sound clip |
| **Patch Note** | Identify the champion from a redacted patch note |

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, dnd-kit
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Firebase Auth (Email/Password + Google OAuth)

## Setup

### 1. Prerequisites

- Node.js 20+
- PostgreSQL running locally

### 2. Environment Variables

Copy and fill in the env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`** — requires a PostgreSQL `DATABASE_URL` and Firebase Admin SDK credentials (from Firebase Console > Project Settings > Service Accounts > Generate new private key).

**`client/.env`** — requires Firebase Web SDK config (from Firebase Console > Project Settings > Your apps > Add app > Web).

### 3. Install Dependencies

```bash
npm install          # root (installs concurrently)
npm install --workspace=client
npm install --workspace=server
```

### 4. Fetch Champion Data

```bash
npx tsx scripts/fetch-champions.ts
```

This writes `client/public/data/champions.json` and `server/src/data/timeline-puzzles.json`.

### 5. Download Ability Sounds (optional)

```bash
npx tsx scripts/download-sounds.ts
```

Downloads OGG files from CommunityDragon into `client/public/sounds/`.

### 6. Set Up Database

```bash
cd server
npx prisma migrate dev --name init
```

### 7. Run Development Servers

```bash
npm run dev   # from root — starts both client (port 5173) and server (port 3001)
```

## Project Structure

```
/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── games/   # Each game mode
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── context/
│   └── public/
│       ├── data/    # champions.json (generated)
│       └── sounds/  # OGG audio files (downloaded)
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── data/    # Curated puzzle JSON files
│   └── prisma/
└── scripts/         # Data fetch scripts
```

## Disclaimer

Not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.
