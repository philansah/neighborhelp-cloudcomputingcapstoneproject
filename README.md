# NeighborHelp – Neighborhood Skill & Service Exchange Platform

> **NeighborHelp** is a community-driven web application connecting residents needing home service assistance (plumbing, electrical, yard work, drainage, cleaning, handyman) with verified local service providers and skilled neighbors.

---

## 🌟 Architecture & Key Features

### 1. Security & Verification Pipeline (Creator Admin Control)
- **Master Super Admin (Application Creator)**: Master control panel at `/admin` reserved for the platform creator.
- **Proof Document Upload**: Neighbors and service providers submit identity proof / trade certification photos via `/profile`.
- **Verification Review Queue**: Creator Admin inspects submitted proof documents and approves or rejects applications.
- **Trust Indicators**: Approved neighbors receive the **Trust Blue Verified Badge** (`#1d4ed8`), unlocking full provider privileges.

### 2. Design System: "Trust & Warmth"
- **Primary Palette (Community Green)**: `#0f5238`, container `#2d6a4f`, on-primary-container `#a8e7c5`.
- **Secondary (Trust Blue)**: `#1d4ed8`, container `#4069f2`.
- **Typography**: Dual-font pairing with **Plus Jakarta Sans** for headlines and **Atkinson Hyperlegible** for accessible body text.
- **Status-Driven Color-Coding**:
  - 🔵 **Blue (`#2563eb`)**: Active status (`OPEN` / `IN_PROGRESS`)
  - 🟢 **Green (`#0f5238`)**: Scheduled / Confirmed status (`ACCEPTED` / `COMPLETED`)
  - 🟡 **Amber (`#d97706`)**: Action Required status (`PENDING` / `HIGH URGENCY`)

### 3. Application Workflows
- **Discovery Feed (`/`)**: Real-time search by keywords, skill pills (`Plumbing`, `Electrical`, `Yard Work`, `Drainage`, `Cleaning`, `General Handyman`), urgency selector, and neighborhood location filter.
- **Multi-Photo Dropzone (`/posts/create`)**: Multi-photo S3 presigned URL uploader with drag & drop preview.
- **Interactive Action Box (`/posts/:id`)**: High-res photo gallery, job application scheduling modal for providers, and incoming application acceptance/rejection controls for residents.
- **User Dashboard (`/dashboard`)**: Active requests, pending applications, job status tracking, and 1-5 star review modal.
- **AWS CloudWatch Monitoring (`/api/admin/logs`)**: Structured JSON event streaming to `/neighborhelp/app-logs` with custom metrics (`PostCreationCount`, `BookingAcceptanceRate`, `S3UploadSuccessCount`, `APILatencyMs`).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Styling** | Vanilla Tailwind CSS v4 + Plus Jakarta Sans + Atkinson Hyperlegible |
| **Database & ORM** | SQLite + Prisma ORM 6.19 |
| **Auth & Security** | JWT (HTTP-Only Cookies) + `bcryptjs` Password Hashing |
| **Media Pipeline** | Amazon S3 Presigned URL Multi-Photo Uploader |
| **Logging** | AWS CloudWatch Structured Event Logging |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration & Seed
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Test Accounts (1-Click Switcher in Navbar)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Creator / Super Admin** | `admin@neighborhelp.org` | `password123` | Master Super Admin (Verification review queue & CloudWatch logs) |
| **Verified Provider** | `alex@example.com` | `password123` | Alex Rivera (Plumber & Handyman with Verified badge) |
| **Pending Provider** | `maria@example.com` | `password123` | Maria Santos (Electrician & Lawn Care, proof submitted) |
| **Resident** | `sarah@example.com` | `password123` | Sarah Jenkins (Maplewood Park resident) |

---

## 📁 Directory Structure

```
neighborhelp/
├── prisma/
│   ├── schema.prisma       # User, Post, PostPhoto, Booking, Review models
│   ├── seed.js             # Database seed script
│   └── dev.db              # SQLite Database
├── src/
│   ├── app/
│   │   ├── admin/          # Creator Admin Control Panel & Verification Queue
│   │   ├── api/            # REST API Routes (auth, posts, media, bookings, verifications, admin)
│   │   ├── dashboard/      # User Dashboard (Resident & Provider views)
│   │   ├── posts/          # Post creation and dynamic details pages
│   │   ├── profile/        # Profile editing & ID verification submission form
│   │   └── page.tsx        # Discovery Feed & Landing
│   ├── components/         # Navbar, Footer, PostCard, UrgencyBadge, Modals
│   ├── context/            # AuthContext provider with demo account switcher
│   └── lib/                # Prisma client, Auth JWT helpers, CloudWatch logger
└── docs/                   # Backlog and specifications document
```
