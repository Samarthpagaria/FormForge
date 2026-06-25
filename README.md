# 🚀 FormForge

[![Built with Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![tRPC](https://img.shields.io/badge/tRPC-11.17-2596BE?style=flat-square&logo=trpc)](https://trpc.io)
[![Supabase](https://img.shields.io/badge/Supabase-2.108-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Monorepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444?style=flat-square&logo=turborepo)](https://turbo.build)

**🔗 Live Demo:** [https://formforge-io.vercel.app/](https://formforge-io.vercel.app/)

## PROJECT CONTEXT
**Project Name:** FormForge  
**Type:** Modern form-building platform with AI capabilities  
**Architecture:** Turborepo monorepo with Next.js 16+ (App Router), TypeScript, tRPC for type-safe APIs, Drizzle ORM + Supabase for auth/database, Vercel for hosting.  
**Core Concept:** Schema-driven form builder with GitHub integration, multi-agent AI assistance, and comprehensive embedded documentation.

![FormForge Landing Page](./apps/web/public/landing_page.png)

---

## 1. PROJECT IDENTITY
- **Exact Project Name:** FormForge
- **One-line Tagline:** Modern form-building platform with AI capabilities.
- **Project Overview:** FormForge is an advanced, schema-driven form-building platform that leverages the modern React ecosystem. By combining Next.js App Router, tRPC, and Drizzle ORM within a Turborepo monorepo, FormForge guarantees strict end-to-end type safety while simplifying the process of generating, validating, and submitting complex forms.
- **Value Proposition:** FormForge uniquely unifies schema-driven configurations with multi-agent AI assistance and GitHub repository management, enabling developers to build, test, and sync robust forms faster than traditional UI-based form builders.

---

## 2. INSTALLATION & USAGE

Follow these steps to set up FormForge locally:

### Prerequisites
- Node.js >= 18
- `pnpm` >= 9.0.0
- A Supabase/PostgreSQL database

### Steps
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd formforge
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Environment Setup:**
   - Copy `.env.example` to `.env` at the root.
   - Fill in your `DATABASE_URL` (Supabase Postgres URI), App URL, and other required API keys.
   ```bash
   cp .env.example .env
   ```
4. **Initialize Database:**
   - Push the Drizzle ORM schema to your Supabase Postgres database.
   ```bash
   cd packages/db
   pnpm run db:push
   ```
5. **Start the Development Server:**
   - Run the Turbo development script from the root.
   ```bash
   cd ../../
   pnpm run dev
   ```
6. **Open the Application:**
   - The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 3. COMPLETE TECH STACK WITH VERSIONS

#### Turborepo Monorepo Structure
- **Turborepo Version:** `2.9.18`
- **Package Manager:** `pnpm@9.0.0`
- **Workspace Structure:**
  ```text
  apps/
    └── web/                # Next.js 16 frontend & API application
  packages/
    ├── ui/                 # Shared UI components (shadcn/ui + tailwindcss 4.3.1)
    ├── config/             # Shared ESLint/TypeScript configs
    ├── db/                 # Database schema and utilities (Drizzle ORM)
    ├── form-engine/        # Core form rendering and logic
    └── validators/         # Shared Zod schemas
  ```

| Package | Version | Purpose | Usage |
|---------|---------|---------|--------|
| Next.js | `16.2.0` | React framework (App Router) | Full-stack app, server components (`apps/web`) |
| React | `19.2.0` | UI Library | Frontend rendering |
| tRPC | `11.17.0` | Type-safe API layer | End-to-end type safety between client/server |
| Supabase Auth | `2.108.2` | Authentication | `@supabase/ssr` for Next.js App Router auth integration |
| Drizzle ORM | `0.45.2` | Database ORM | Schema definition and querying in `packages/db` |
| Zod | `4.4.3` | Schema validation | Form validation, API validation |
| TypeScript | `5.9.2` | Type safety | Full type coverage across the monorepo |
| Tailwind CSS | `4.3.1` | Styling | Utility-first CSS framework |

---

## 4. COMPLETE DEPLOYMENT STACK

#### Vercel Deployment
- **Platform:** Vercel (frontend and API hosting)
- **Deployment Method:** GitHub integration (automatic deploys on main branch)
- **Build Command:** `turbo run build`
- **Output Directory:** `.next` inside `apps/web`
- **Environment Variables:** Managed natively in the Vercel dashboard.
- **Preview Deployments:** Automatic generation for all pull requests.

#### Supabase Configuration
- **Auth Configuration:**
  - Employs `@supabase/ssr` for cookie-based session management in App Router.
  - Integration across middleware and server-side components.
- **Database:**
  - PostgreSQL managed by Supabase, interacted with using **Drizzle ORM** (`postgres` driver `^3.4.9`).

---

## 5. SUPABASE & DATABASE INTEGRATION DEEP DIVE

#### Authentication Flow
- FormForge uses `@supabase/ssr` for robust authentication in the Next.js App Router ecosystem.
- Session handling is integrated directly into Next.js middleware to protect private routes securely.

![Authentication Page](./apps/web/public/auth_page.png)

#### Database Schema (Drizzle ORM)
Instead of raw SQL or standard Supabase client models, the project uses **Drizzle ORM** within `packages/db`:
- Managed via `drizzle-kit` (`^0.31.10`)
- Pushed to the database using `pnpm db:push`
- Schema and relations are strongly typed and shared across the monorepo.

---

## 6. API ENDPOINTS & TRPC ROUTERS

FormForge relies heavily on **tRPC** for strictly typed APIs. Standard REST endpoints are minimal, with the bulk of client-server communication passing through the tRPC boundary.

### Standard REST Endpoints
- **`GET /api/health`**: Service availability health check used for uptime monitoring to prevent Vercel cold starts.
- **`GET /api/openapi`**: Serves OpenAPI JSON specs for integration.
- **`GET /api/docs`**: Swagger/Scalar API documentation viewer.

### tRPC Procedures (`/api/trpc/*`)
Configured in `apps/web/src/trpc/routers`, providing end-to-end type safety:
- **`analytics` Router**: Fetches telemetry, views, and submission statistics for forms.
- **`forms` Router**: Core CRUD operations for forms. Validated by Zod schemas from `packages/validators`.
- **`formVersions` Router**: Tracks historical variations and revisions of schemas.
- **`responses` Router**: Submits, fetches, and manages form submission payloads.
- **`share` Router**: Manages public sharing tokens and visibility settings.
- **`site` Router**: Retrieves general platform configuration data.
- **`templates` Router**: Fetches predefined schema blueprints for the template library.

---

## 7. GITHUB INTEGRATION

- **Features:** Connect GitHub repositories to manage and version form schemas directly.
- **Security Considerations:** GitHub tokens (if utilized) are managed on the client side with strict permissions warnings regarding repository write access.

---

## 8. FEATURES INVENTORY

- **Schema-Driven Forms:** Build complex forms from JSON or Zod schemas dynamically.
- **Type Safety:** Full TypeScript support with automatic inference across the Turborepo stack.
- **Workspace Monorepo:** Split components natively using `@formforge/ui`, `@formforge/db`, and `@formforge/validators`.
- **Modern UI:** Styled using Tailwind CSS v4, shadcn/ui, and Framer Motion.

![Form Builder Interface](./apps/web/public/form_builder_page.png)

---

## 9. ENVIRONMENT VARIABLES

```bash
# ⚠️ IMPORTANT: DO NOT EXPOSE REAL KEYS
# Refer to .env.example for required keys

# Database (Drizzle ORM)
DATABASE_URL=postgres://...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (Emails)
RESEND_API_KEY=
RESEND_FROM=FormForge <onboarding@resend.dev>
```

---

## 10. PROJECT STRUCTURE MAP

```text
formforge/
├── apps/
│   └── web/                          # Next.js 16 frontend & API
│       ├── app/                      # App Router pages
│       ├── components/               # React components
│       ├── lib/                      # Supabase client instantiation
│       └── src/trpc/                 # tRPC configuration
├── packages/
│   ├── db/                           # Drizzle ORM schemas & migrations
│   ├── form-engine/                  # Core parsing and rendering logic
│   ├── ui/                           # Shared UI components (shadcn)
│   ├── validators/                   # Shared validation logic (Zod)
│   ├── eslint-config/                # Linting rules
│   └── typescript-config/            # TS rules
├── turbo.json                        # Turborepo caching configs
└── package.json                      # Monorepo scripts
```

---

## 11. SECURITY & GUARDRAILS
Security is handled as a first-class citizen inside the FormForge monorepo:
- **No Leaked Credentials:** The repository is fully sanitized. `.env.example` only contains empty boilerplate variables.
- **Strict Input Validation:** Enforced globally via `zod` at the tRPC boundary—preventing malformed injection payloads.
- **Auth Guarding:** Server-side component auth verification using `@supabase/ssr` inside Next.js middleware blocks unauthenticated deep linking.
- **Type Safety:** Full end-to-end TS coverage dramatically reduces runtime exploitation vectors.
- **Row Level Access (Application Tier):** Database isolation is strictly managed through the tRPC backend layer interacting with Drizzle ORM contexts.

---

## 12. UI/UX DOCUMENTATION

- **Styling framework:** Tailwind CSS 4.3.1
- **Component Library:** Built iteratively utilizing custom `shadcn` implementations (`@repo/ui`).
- **Animations:** Employs `framer-motion` for fluid component transitions and micro-interactions.
- **Icons:** A blend of `@tabler/icons-react`, `lucide-react`, and `@untitledui/icons` provides extensive iconography.

![Templates Page](./apps/web/public/templates_page.png)
