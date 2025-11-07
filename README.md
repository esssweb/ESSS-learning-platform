# ESSS Learning Platform

A comprehensive learning management system consisting of two applications: a learner-facing portal and an administrative management portal.

## Project Structure

```
ESSS-learning-platform/
├── learners_portal/    # Student-facing learning platform (Next.js)
└── admin_portal/       # Administrative management portal (Nuxt.js)
```

## Applications

### Learners Portal

The main learning platform for students built with Next.js 14, featuring:
- User authentication with NextAuth
- Course browsing and enrollment
- Interactive learning content (video, PDF)
- Progress tracking
- Redux state management
- Prisma ORM for database operations

**Tech Stack:**
- Next.js 14 with App Router
- React 18
- TypeScript
- Prisma ORM
- NextAuth for authentication
- TailwindCSS + Radix UI components
- Redux Toolkit

### Admin Portal

Management interface for administering the learners portal, built with Nuxt.js:
- Content management
- User management
- Course administration
- Analytics and reporting

**Tech Stack:**
- Nuxt.js 4
- Vue 3
- TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

Install dependencies for both applications:

```bash
# Learners Portal
cd learners_portal
npm install

# Admin Portal
cd ../admin_portal
npm install
```

### Development

Run both applications in development mode:

**Learners Portal** (runs on `http://localhost:3000`):
```bash
cd learners_portal
npm run dev
```

**Admin Portal** (runs on `http://localhost:3000`):
```bash
cd admin_portal
npm run dev
```

> **Note:** Both applications run on port 3000 by default. Run them separately or configure different ports if needed.

### Database Setup (Learners Portal)

The learners portal uses Prisma for database management:

```bash
cd learners_portal
npx prisma generate
npx prisma migrate dev
```

## Building for Production

### Learners Portal
```bash
cd learners_portal
npm run build
npm run start
```

### Admin Portal
```bash
cd admin_portal
npm run build
npm run preview
```

## Project Status

Currently in active development. See individual portal READMEs for more details:
- [Learners Portal README](./learners_portal/README.md)
- [Admin Portal README](./admin_portal/README.md)

## License

Private project
