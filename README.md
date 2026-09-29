# ReviewCanvas — Brand-Aware AI Google Review Assistant

**ReviewCanvas** helps real in-store customers turn their genuine experiences into authentic, editable Google review drafts in seconds, taking them straight to the official Google review form—without review-gating, inventing claims, or posting on their behalf.

---

## 🌟 What's New & Upgraded (Pro Redesign)

- **Apple & Linear-Grade UI/UX**: Full Tailwind CSS design system with glassmorphism cards, micro-interactions, responsive mobile drawer navigation, and Plus Jakarta Sans typography.
- **Multi-Tone AI Drafting Engine**:
  - `Warm & Enthusiastic`: Celebratory, ideal for great visits (4–5★).
  - `Crisp & To the Point`: Fast 2-sentence review for busy customers.
  - `Detailed & Comprehensive`: Highlighting specific observed facts.
  - `Constructive & Direct`: Respectful, solutions-oriented phrasing for low ratings (1–3★) that complies 100% with Google anti-gating policies.
- **Physical QR Print Studio**:
  - Foldable **Table Tent Flyers** (with 5-star callout for dining tables & counters).
  - High-contrast **Counter Stickers** for cash registers & entrance doors.
  - Instant high-res PNG download or direct in-browser printing (`Ctrl+P` / `Cmd+P`).
- **Telemetry & Conversion Funnel Dashboard**:
  - Real-time tracking: *QR Scans → Assistant Starts → Details Selected → Drafts Created → Outbound to Google Maps*.
  - Direct Google bypass tracking (for customers who prefer writing with zero AI assistance).
- **Zero-Gating Google Policy Audit Guardrail**:
  - Verified 100% policy-clean: whether a customer chooses 1★ or 5★, everyone receives the identical public Google Maps review destination.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested through Node 24)
- npm

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
```
Runs on `http://localhost:3001`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

---

## 🔗 Live Demo URLs & Seed Credentials

| Page | URL | Purpose |
|------|-----|---------|
| **Marketing Homepage** | [http://localhost:5173/](http://localhost:5173/) | SaaS product presentation, policy comparison, and industry breakdown |
| **Customer QR Flow** | [http://localhost:5173/review/ef9b1224-1b18-4137-825d-0693d8dcd72f](http://localhost:5173/review/ef9b1224-1b18-4137-825d-0693d8dcd72f) | Live mobile-first review flow for *Acme Artisan Roastery (Downtown)* |
| **Admin Dashboard** | [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard) | Conversion funnel analytics, locations, QR print studio, brand settings |
| **Business Setup** | [http://localhost:5173/admin/setup](http://localhost:5173/admin/setup) | Onboarding form with live brand color picker |
| **Admin Login** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) | Sign in with pre-seeded demo button (`admin@acme.com` / `password123`) |

---

## 🤖 AI Drafting (Gemini & Smart Fallback)

Set `GEMINI_API_KEY` in `backend/.env` for Gemini-2.0-flash generation:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Smart Offline Fallback**: Even without an API key, ReviewCanvas includes an intelligent local generative fallback that crafts 3 distinct tone variants without hallucinating unselected details.

---

## 🛡️ Strict Google Policy Guardrails

1. **No Review Gating**: All customers receive identical access to public Google review submission regardless of rating intent.
2. **No Incentives**: Zero discounts, loyalty rewards, or sweepstakes entries.
3. **No Automated Posting**: The customer retains full editorial control, selects their true stars on Google, and posts under their own Google Account.
4. **Fact-Grounded Only**: No invented experiences, dishes, or staff names.

---

## 📄 Disclaimer
ReviewCanvas is independent software and is not endorsed by or affiliated with Google LLC.
