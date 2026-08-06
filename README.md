# 🏆 Summer Cup 2026 — Official Registration & Live Raffle Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon_PostgreSQL-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, high-performance web application engineered for public participant registrations, real-time ticket generation with QR codes, and automated live raffle draws. Built with **Clean Architecture**, **Domain-Driven Design (DDD)**, and optimized for **Serverless Cloud deployments** (Vercel, Cloudflare Pages).

---

## 🌟 Key Features

- **⚡ Public Participant Registration**: Dynamic validation rules ensuring data integrity (e.g., ticket format `TK-XXXXXXXX`, strict name checking, phone and email validation).
- **🎫 Instant Ticket & QR Code Generation**: Digital ticket rendering with QR code generation and direct PDF export capabilities.
- **🎉 Live Animated Raffle Draw**: High-energy, fair winner selection system powered by the Fisher-Yates shuffle algorithm and physics-based particle confetti animations.
- **🛡️ Secure Admin Dashboard**: Password-protected administrative panel with `HTTP-Only` cookie authentication (`SameSite=Strict`), real-time event configuration management, winner management, and live CSV export capabilities.
- **🔒 Multi-Layered Security**: Pre-configured global security headers (HSTS, CSP with dynamic nonce, X-Frame-Options: DENY, X-Content-Type-Options: nosniff).

---

## 🏗️ Architecture & Tech Stack

The platform is designed following strict **Clean Architecture / DDD** principles to decouple business logic from infrastructure providers:

```
src/
├── domain/                  # Core domain models, entities, and repository interfaces
│   ├── entities/            # Participant & Configuration entities
│   └── repositories/        # Contract definitions for data persistence
├── usecases/                # Business logic rules (Registration, Drawing, Export)
├── infrastructure/          # External integrations & database adapters
│   └── persistence/         # Neon PostgreSQL serverless connection & repositories
├── presentation/            # UI Components & Client State Management
└── app/                     # Next.js 16 App Router (Pages, API Route Handlers)
```

### Technology Matrix

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3 (App Router) |
| **UI Library** | React 19.2 & Tailwind CSS v4 |
| **Animations** | Framer Motion & Canvas Confetti |
| **Database** | Neon Database (Serverless PostgreSQL) |
| **Exporting** | jsPDF, html-to-image, QRCode.react |
| **Language** | TypeScript 5.0 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` v10+
- **Database**: A Neon PostgreSQL account or any standard PostgreSQL instance.

### 1. Clone the repository

```bash
git clone https://github.com/BenSira99/Summercup2026.git
cd Summercup2026
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# 🗄️ Neon PostgreSQL Database Connection
DATABASE_URL="postgresql://user:password@ep-cool-field-xxx.neon.tech/neondb?sslmode=require"

# 🌐 Public Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

### Option A: Deploying to Cloudflare Pages (Recommended)

1. Connect your GitHub repository `BenSira99/Summercup2026` to **Cloudflare Pages**.
2. Set Framework Preset: `Next.js`.
3. Add Environment Variable in the Cloudflare Dashboard:
   - `DATABASE_URL`: Your Neon PostgreSQL Connection String.
4. Click **Save and Deploy**.

### Option B: Deploying to Vercel

1. Import the repository into your Vercel account.
2. Configure Environment Variable:
   - `DATABASE_URL`: Your Neon PostgreSQL Connection String.
3. Click **Deploy**.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
