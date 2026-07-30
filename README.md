<div align="center">

# NexaSupport

**AI-powered customer support agent you can embed into any website.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Overview

NexaSupport is a production-ready SaaS landing page and authentication shell for an AI customer support product. It lets businesses embed a smart chatbot into their website in minutes, powered by their own knowledge base — with zero backend complexity.

The project includes:
- A polished marketing landing page with animated hero, feature grid, and CTA section
- Secure authentication via [Scalekit](https://scalekit.com) (OAuth 2.0 / SSO)
- Session management with HTTP-only cookies
- A protected dashboard route for authenticated users

---

## Features

| Feature | Description |
|---|---|
| ⚡ Plug & Play | Single script tag embed — no backend changes needed |
| 🎛️ Admin Controlled | Full control over what the AI knows and how it responds |
| 🕐 Always Online | 24/7 availability with 99.9% uptime SLA |
| 🔒 Secure by Default | Encrypted in transit, HTTP-only session cookies |
| 📊 Actionable Insights | Analytics dashboard for questions and resolution rates |
| 🌐 Multi-language Ready | Automatic language detection for global audiences |

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **Language** — TypeScript 5
- **Styling** — Tailwind CSS 4
- **Animations** — [Motion](https://motion.dev)
- **Auth** — [Scalekit SDK](https://scalekit.com) (OAuth 2.0 / SSO)
- **Runtime** — Node.js

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Scalekit](https://scalekit.com) account with an environment set up

### Installation

```bash
git clone https://github.com/your-username/nexasupport.git
cd nexasupport
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
SCALEKIT_ENVIRONMENT_URL=https://your-env.scalekit.cloud
SCALEKIT_CLIENT_ID=your_client_id
SCALEKIT_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Never commit `.env.local` to version control. Add it to `.gitignore`.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── callback/route.ts   # OAuth callback — exchanges code for token
│   │       ├── login/route.ts      # Redirects to Scalekit authorization URL
│   │       └── logout/route.ts     # Clears session cookie and redirects home
│   ├── dashboard/
│   │   └── page.tsx                # Protected dashboard page
│   ├── globals.css                 # Global styles and Tailwind utilities
│   ├── layout.tsx                  # Root layout with metadata
│   └── page.tsx                    # Home page (server component, reads session)
├── components/
│   └── HomeClient.tsx              # Landing page UI (client component)
├── config/
│   └── env.ts                      # Scalekit client and env validation
└── lib/
    ├── data.ts                     # Features and stats content
    └── getSession.tsx              # Server-side session resolver
```

---

## Authentication Flow

```
User clicks Login
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

To log out, the session cookie is deleted via `GET /api/auth/logout`.

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

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your repository to GitHub
2. Import the project on [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy — Vercel handles the rest

For other platforms, run `npm run build` and serve the `.next` output with `npm run start`.

---

## License

MIT © 2025 NexaSupport
