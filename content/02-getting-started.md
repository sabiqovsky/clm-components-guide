# Getting Started with the Repo

## Prerequisites

- **Node.js 20 LTS**
- **npm**
- **Xendit API keys** — one per currency

## Clone and Install

```bash
git clone https://github.com/<org>/xendit-demo-store.git
cd xendit-demo-store
npm install
```

## Environment Setup

```bash
cp .env.example .env
```

Fill in one secret key per currency:

```
XENDIT_SECRET_KEY_IDR=xnd_development_...
XENDIT_SECRET_KEY_PHP=xnd_development_...
XENDIT_SECRET_KEY_MYR=xnd_development_...
XENDIT_SECRET_KEY_THB=xnd_development_...
XENDIT_SECRET_KEY_VND=xnd_development_...
XENDIT_SECRET_KEY_SGD=xnd_development_...
XENDIT_SECRET_KEY_HKD=xnd_development_...
XENDIT_SECRET_KEY_MXN=xnd_development_...
```

> Use `xnd_development_...` keys for local testing.

## Running the App

```bash
npm run dev
```

| Process | URL | What it is |
|---------|-----|-----------|
| Vite dev server | `http://localhost:5173` | React frontend |
| Express server | `http://localhost:8000` | API backend |

## Available Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Starts client + server concurrently |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | Express only |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
