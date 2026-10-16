<div align="center">

# CDIN — Civic Integrity Blockchain Voting System

**A citizen-owned cryptographic verification layer that ensures every vote can be independently verified, and any unauthorized change is immediately detectable.**

Installable PWA · Next.js · TypeScript · Tailwind CSS · Framer Motion

</div>

---

## Overview

CDIN is a transparent, tamper-resistant electronic voting platform. It combines a
hash-linked **blockchain ledger**, a **secure verification flow**, and an **AI fraud-detection
layer** to make elections auditable end-to-end — without exposing voter identity.

This repository is a fully working, **client-rendered Progressive Web App** that demonstrates
the complete system. There is no external backend: a shared in-browser store (Zustand,
persisted to `localStorage`) simulates the blockchain, the AI engine and the audit ledger, so
**every role's actions flow into every other role's dashboard in real time.**

> ⚠️ **Demonstration software.** The hashing and "proof-of-work" are illustrative stand-ins for a
> real cryptographic backend (SHA-256, smart contracts, mixnets). Do not use to run a real election.

---

## The five solution components → where they live

| # | Component | In this app |
|---|-----------|-------------|
| 🔐 1 | **Secure Voter Verification** | Voter flow `/vote` · Officer console `/officer` (ID / biometric / QR) |
| 🗳 2 | **Digital Voting Interface** | Voter ballot + encrypted, irreversible submission |
| ⛓️ 3 | **Blockchain Vote Recording** | Ledger explorer `/admin/ledger` · hash-linked blocks, integrity check |
| 🤖 4 | **AI Fraud Detection** | `/admin/fraud` · velocity / cadence anomaly engine with risk scores |
| 🧩 5 | **Secure Backend** | Zustand store (`src/store`) acting as the API + chain + AI bridge |

---

## Roles (all connected through one shared ledger)

| Role | Entry | What they do |
|------|-------|--------------|
| **Voter** | `/vote` | Verify identity → cast an encrypted ballot → receive an on-chain receipt |
| **Verification Officer** | `/officer` | Authenticate voters, manage the unit roster, watch unit activity |
| **Election Admin** | `/admin` | Live results, blockchain explorer, AI fraud triage, audit trail |
| **Super Admin** | `/super-admin` | Configure elections, candidates, officers, polling units; system reset |

A vote cast by a **Voter** instantly: appends a block to the **ledger**, updates the **Admin**
results & turnout, can trigger an **AI alert**, and writes to the **audit trail** — demonstrating
the parallel "truth layer" the system describes.

---

## Tech stack

- **Next.js 15** (App Router, client-rendered) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first design tokens)
- **Framer Motion** for subtle, orchestrated motion
- **lucide-react** icons · **Recharts** for analytics
- **Zustand** (+ persist) as the simulated backend
- **PWA**: native `manifest.webmanifest` + offline service worker

## Design system

- **Colour — 60 / 30 / 10:** 60% neutral ink canvas · 30% structural navy · 10% civic-blue accent. Flat solids, **no gradients**.
- **Typography:** Plus Jakarta Sans (display + body), JetBrains Mono for hashes.
- **Spacing:** strict **8-pt grid** (Tailwind 4px base, composed in even steps).
- **Motion:** staggered reveals, micro-interactions, reduced-motion aware.
- **Mobile-first:** app-like bottom navigation, safe-area aware, responsive throughout.

---

## Getting started

**Requirements:** Node.js 18.18+ (Node 20/22/24 recommended) and npm.

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# open http://localhost:3000

# 3. Production build + run
npm run build
npm run start
```

From the landing page, pick any role to enter its workspace. State persists in your browser;
**Super Admin → Overview → Danger zone → Reset system** restores the seeded scenario.

### Install as an app (PWA)

Run a **production** build (`npm run build && npm run start`), open it in Chrome/Edge, and use
the browser's **Install** action (address-bar icon). The app then works offline and launches
in a standalone window. (The service worker is disabled in `npm run dev` by design.)

---

## Project structure

```
src/
├─ app/                     # Next.js App Router
│  ├─ page.tsx              # Landing / role login
│  ├─ vote/                 # Voter flow
│  ├─ officer/              # Verification officer area (+ layout, roster, activity)
│  ├─ admin/                # Admin area (overview, results, ledger, fraud, audit)
│  ├─ super-admin/          # Super admin area (elections, candidates, officers, units)
│  ├─ manifest.ts           # PWA manifest
│  └─ globals.css           # Design tokens (60/30/10, 8-pt, fonts)
├─ components/
│  ├─ ui/                   # Button, Card, Badge, Field, Modal, StatCard, …
│  ├─ layout/               # DashboardLayout, RoleGuard, SplashLoader
│  ├─ voter/ · officer/ · admin/   # Feature components
├─ store/                   # Zustand: blockchain, AI fraud engine, seed data, session
└─ lib/                     # hashing, formatting, motion presets, cn()
public/                     # icons + service worker (sw.js)
```

---

## Deploy to Vercel (GitHub flow)

1. Create a new GitHub repository (empty, no README).
2. Push this project:
   ```bash
   git init
   git add .
   git commit -m "feat: CDIN civic integrity voting PWA"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. Go to **vercel.com → Add New… → Project → Import** your repo.
4. Framework preset is auto-detected as **Next.js** — no env vars needed. Click **Deploy**.

Every push to `main` then auto-deploys. No build configuration is required.

---

<div align="center">
<sub>CDIN is not a replacement for government systems — it is a parallel truth layer that forces accountability through verifiability.</sub>
</div>
