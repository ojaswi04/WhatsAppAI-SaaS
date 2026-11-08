<div align="center">

# 💬 WhatsAppAI

### A multi-tenant SaaS for running a small business on WhatsApp

![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)

</div>

---

## The idea

Shops, salons, clinics and food businesses already talk to their customers on WhatsApp, but orders, payments, follow-ups and offers end up scattered across chats and notebooks.

**WhatsAppAI** turns those chats into a managed workflow: incoming messages are logged, customers are tagged and segmented automatically, payment reminders and offers are targeted, and the owner runs everything from one dashboard.

![WhatsAppAI landing page](docs/landing.png)

---

## What's inside

| Part | What it does | Stack | Folder |
|---|---|---|---|
| **Business dashboard** | Landing page, sign-up/login, and protected pages for chats, customers, product catalogue, campaigns, analytics, team and settings. Light/dark theme. | React, Vite, Tailwind CSS, React Router, Recharts, Supabase Auth | `dashboard/frontend/` |
| **Dashboard API** | Tenant-scoped REST API for orders, payments, customers, products (full CRUD) and business settings, with a health check | FastAPI, Supabase Python client | `dashboard/backend/` |
| **Multi-tenant auth** | Verifies each Supabase JWT and pulls the `tenant_id` from user metadata, so every request only sees its own business's data | FastAPI security, Supabase Auth | `dashboard/backend/auth_backend.py` |
| **WhatsApp message service** | Webhook that receives WhatsApp messages, a send endpoint, and a message log stored in Supabase | Node.js, Express | `services/whatsapp-webhook/` |
| **Customer tagging and segmentation** | Rule-based tags and segments from customer and payment history: payment reminders, loyal customers, welcome lists, inactive customers and offer eligibility | Python | `customer_tagging/` |
| **Offer engine** | Picks the best eligible offer (flat or percentage) for a customer's cart using their stored category preferences | Python, Supabase | `services/offer-engine/` |
| **Reply templates** | Intent-based reply library (greeting, orders, price queries, and more) for the WhatsApp bot | Python | `message-handling/` |

<p align="center"><img src="docs/login.png" width="420" alt="Login and sign-up screen"></p>

---

## Architecture

```
 WhatsApp Cloud API
        │  webhook
        ▼
 services/whatsapp-webhook  (Node/Express) ──────► Supabase: messages
                                                        │
 customer_tagging  ──► segments & tags ─────────────────┤
 services/offer-engine ──► best offer per customer ─────┤
                                                        ▼
 dashboard/frontend (React) ──JWT──► dashboard/backend (FastAPI) ──► Supabase Postgres
        └──────────── Supabase Auth (login / sign-up, tenant in user metadata) ────┘
```

---

## Quick start

**1. Configure Supabase.** Create a Supabase project, then copy `.env.example` to `.env` at the repo root and fill in `SUPABASE_URL` and `SUPABASE_KEY`.

**2. API**

```bash
cd dashboard/backend
pip install -r requirements.txt
uvicorn view_orders:app --reload --port 8000
```

**3. Dashboard**

```bash
cd dashboard/frontend
npm install
npm run dev            # http://localhost:5173
```

**4. WhatsApp message service**

```bash
cd services/whatsapp-webhook
cp .env.example .env   # add Supabase credentials
npm install
npm start              # POST /webhook, POST /send, GET /messages
```

**5. Try the segmentation logic offline**

```bash
cd customer_tagging
python demo.py
```

---

## Repository layout

```
dashboard/
├── frontend/                 # React + Vite + Tailwind dashboard
├── backend/                  # FastAPI API (view_orders.py) + JWT tenant auth
└── latest_dashboard_module.py
services/
├── whatsapp-webhook/         # Node/Express WhatsApp webhook + message logging
└── offer-engine/             # offer selection + Supabase schema
customer_tagging/             # customers, payments, segmentation, tagging (+ demo data)
message-handling/             # bot reply templates
docs/                         # screenshots
```

---

## Roadmap

- Connect the webhook to an intent classifier (payment query, order tracking, broadcast, opt-out), with low-confidence messages handed to a human
- Meta WhatsApp Cloud API webhook verification and outbound templates
- Supabase Row Level Security on every tenant table
- Consent and opt-out enforcement for broadcast campaigns

---

## Author

**Ojaswi Gondalia** · B.Tech Artificial Intelligence, NMIMS Mumbai  
[GitHub](https://github.com/ojaswi04) · [LinkedIn](https://linkedin.com/in/ojaswi-gondalia-25bb65205) · ojaswigondalia@gmail.com

Built with my team.
