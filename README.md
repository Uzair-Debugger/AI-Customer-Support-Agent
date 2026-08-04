<div align="center">

# NexaSupport

**AI-powered customer support agent you can embed into any website — in under 2 minutes.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<!-- 📸 SCREENSHOT: Full-page hero section of the landing page (light mode, desktop viewport) -->
![NexaSupport Landing Page](./public/home-page.png)

</div>

---

## What is NexaSupport?

NexaSupport is a full-stack SaaS application that lets any business deploy an AI-powered customer support chatbot on their website — without writing a single line of backend code. Business owners sign in, paste their FAQs and policies into a knowledge base, and get a single `<script>` tag they can drop into any HTML page. The embedded widget instantly starts answering customer questions using that knowledge, powered by an AI model.

The project covers the complete product lifecycle: a polished marketing landing page, secure OAuth authentication, a settings dashboard, a knowledge base editor, an embeddable chat widget, and a REST API that ties it all together — all built with a modern, production-grade stack.

---

## Key Features

### 🚀 One-Line Embed
The entire chatbot is delivered as a self-contained JavaScript file (`chatbot.js`) served from the app. Any website can activate it by adding a single script tag with the owner's unique ID:

```html
<script src="https://your-app.com/chatbot.js" data-owner-id="YOUR_ID"></script>
```

No npm install, no build step, no framework dependency. It works on any HTML page — static sites, WordPress, Shopify, or custom apps.

<!-- 📸 SCREENSHOT: The /embed page showing the code snippet card with the copy button -->

---

### 🧠 Knowledge Base — You Control What the AI Knows
From the dashboard, business owners write their own knowledge base in plain text: refund policies, delivery timelines, product FAQs, support hours — anything. The AI uses only this content to answer customer questions, keeping responses accurate, on-brand, and hallucination-free.

<!-- 📸 SCREENSHOT: The Dashboard page showing the Knowledge Base textarea filled with sample content -->

---

### 💬 Embedded Chat Widget
The `chatbot.js` script injects a floating chat button and a fully functional chat window into the host page. It:
- Renders a fixed-position chat bubble (bottom-right corner)
- Opens a styled chat panel with a message history area
- Sends user messages to `/api/chat` with the owner's ID
- Displays AI responses with a typing indicator
- Requires zero configuration from the website owner

<!-- 📸 SCREENSHOT: The embedded chat widget open on a plain HTML page, showing a sample conversation -->

---

### 🔐 Secure Authentication via OAuth 2.0 / SSO
Authentication is handled by [Scalekit](https://scalekit.com), an enterprise-grade auth provider. The flow uses the OAuth 2.0 Authorization Code grant:

1. User clicks "Get Started" → redirected to Scalekit's authorization screen
2. After authenticating, Scalekit redirects back with a `code`
3. The server exchanges the code for an access token
4. The token is stored in an **HTTP-only cookie** — never exposed to JavaScript
5. All protected routes read the session server-side before rendering

This means no JWTs in localStorage, no client-side token handling, and no risk of XSS-based token theft.

---

### 🗄️ Persistent Settings with PostgreSQL + Prisma
Each business owner's settings (business name, support email, knowledge base) are stored in a PostgreSQL database via Prisma ORM. The schema is minimal and clean:

```prisma
model Settings {
  id           String   @id @default(cuid())
  ownerId      String   @unique
  businessName String
  supportEmail String
  knowledge    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

Settings are loaded server-side on the dashboard and pre-populated into the form, so users always see their latest saved configuration.

---

### 🎨 Polished UI with Smooth Animations
The entire frontend is built with Tailwind CSS 4 and [Motion](https://motion.dev) (the successor to Framer Motion). Every page entry, card, button, and dropdown uses purposeful animation:

- Navbar slides in from the top on load
- Hero headline, stats row, and chat mockup stagger in sequentially
- Feature cards animate in as they scroll into view
- The user dropdown uses `AnimatePresence` for smooth mount/unmount transitions
- The CTA banner and save-status messages animate in/out cleanly

<!-- 📸 SCREENSHOT: The feature cards section mid-scroll, showing the staggered animation (use a GIF or video if possible) -->

---

### 📊 Stats & Social Proof
The landing page displays key trust metrics — setup time under 2 minutes, 24/7 availability, and 99.9% uptime SLA — in a clean pill row beneath the hero headline, immediately establishing credibility with potential customers.

---

### 🌐 Multi-language Ready
The AI layer is designed to detect and respond in the customer's language automatically, making NexaSupport suitable for businesses with a global audience without any extra configuration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, Server Components, Route Handlers |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animations | [Motion](https://motion.dev) |
| Auth | [Scalekit SDK](https://scalekit.com) — OAuth 2.0 / SSO |
| Database | PostgreSQL via [Prisma ORM](https://www.prisma.io) |
| Runtime | Node.js 18+ |
| Deployment | [Vercel](https://vercel.com) |

---

## Architecture Overview

```
Browser
  │
  ├── Landing Page (/)          ← Server Component reads session cookie
  ├── Dashboard (/dashboard)    ← Protected; loads settings from DB server-side
  ├── Embed Page (/embed)       ← Generates personalised <script> snippet
  │
  └── Embedded Widget           ← chatbot.js injected into any external site
        │
        └── POST /api/chat      ← Fetches owner's knowledge, calls AI, returns answer

Auth Flow
  GET /api/auth/login      → Redirect to Scalekit
  GET /api/auth/callback   → Exchange code → set HTTP-only cookie
  GET /api/auth/logout     → Clear cookie → redirect home

Settings Flow
  GET  /dashboard          → Read DB → pre-fill form
  POST /api/settings       → Upsert Settings record in PostgreSQL
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts   # OAuth callback — exchanges code for token
│   │   │   ├── login/route.ts      # Redirects to Scalekit authorization URL
│   │   │   └── logout/route.ts     # Clears session cookie and redirects home
│   │   ├── chat/route.ts           # AI chat endpoint — reads knowledge, calls AI
│   │   └── settings/route.ts       # Upserts owner settings in the database
│   ├── dashboard/page.tsx          # Protected dashboard (server component)
│   ├── embed/page.tsx              # Embed snippet generator page
│   ├── globals.css                 # Global styles and Tailwind utilities
│   ├── layout.tsx                  # Root layout with metadata
│   └── page.tsx                    # Home page (server component, reads session)
├── components/
│   ├── HomeClient.tsx              # Landing page UI (client component)
│   ├── DashboardClient.tsx         # Dashboard settings form (client component)
│   └── EmbedClient.tsx             # Embed snippet page (client component)
├── config/
│   └── env.ts                      # Scalekit client and env validation
└── lib/
    ├── data.ts                     # Features and stats content
    ├── getSession.tsx              # Server-side session resolver
    └── prisma.ts                   # Prisma client singleton
prisma/
├── schema.prisma                   # Database schema
└── seed.ts                         # Database seed script
public/
└── chatbot.js                      # Self-contained embeddable chat widget
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database
- A [Scalekit](https://scalekit.com) account with an environment configured

### Installation

```bash
git clone https://github.com/your-username/nexasupport.git
cd nexasupport
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
SCALEKIT_ENVIRONMENT_URL=https://your-env.scalekit.cloud
SCALEKIT_CLIENT_ID=your_client_id
SCALEKIT_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/nexasupport
```

> Never commit `.env` to version control.

### Database Setup

```bash
npx prisma migrate dev
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentication Flow

```
User clicks "Get Started"
        │
        ▼
GET /api/auth/login
        │  Redirects to Scalekit authorization URL
        ▼
Scalekit OAuth screen
        │  User authenticates
        ▼
GET /api/auth/callback?code=...
        │  Exchanges code for access token
        │  Sets HTTP-only cookie: access_token
        ▼
Redirect to /  (user is now logged in)
```

Logout clears the session cookie via `GET /api/auth/logout`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Deployment

The easiest deployment path is [Vercel](https://vercel.com):

1. Push your repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env` in the Vercel dashboard
4. Deploy — Vercel handles builds, edge routing, and HTTPS automatically

For other platforms, run `npm run build` and serve the `.next` output with `npm run start`.

---

## License

MIT © 2025 NexaSupport
