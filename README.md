# EZLane

EZLane is a freelancer project-management and client-portal app. It helps freelancers move from a proposal to an accepted project, keep communication and files in one place, and offer a polished, account-free portal to clients.

This is a portfolio project. Payments are tracked manually; EZLane does not process payments or provide legal advice.

## Product principles

- Work should reflect how freelance projects actually run: flexible, conversational, and easy to adjust.
- Clients and projects are separate records, but a portal always belongs to one project.
- The proposal's structured terms are the source of truth for acceptance, the contract, and project setup.
- Keep a permanent project record: proposal versions, messages, attachments, contract, and payment state.
- Prefer simple, deliberate interactions over real-time collaboration or unnecessary account flows.

## Core workflow

1. The freelancer creates a client with a name and email, plus optional company and notes.
2. They create and manually save a proposal with price, due date, deliverables, and a rich-text body.
3. They send the proposal through that project's portal. Clients can leave inline comments and accept it.
4. Acceptance locks the proposal and creates an active project using the proposal's structured terms.
5. EZLane generates a fixed-template contract. The client accepts by typing their name.
6. The project keeps one chronological message thread, optional attachments, manual status/progress, approval, and 50/50 manual payment tracking.

## Key product decisions

### Clients and portals

Freelancers can keep multiple concurrent projects under one client record. Each project has its own independent portal URL and password: clients do not need an EZLane account and cannot see unrelated projects. Freelancers can use **Preview Portal** to inspect the same read-only portal view.

### Proposals

Proposals progress through **Draft**, **Sent**, **Client Commented**, **Revised**, and **Accepted**. Sending a proposal creates a version snapshot; there is no live editing or separate version-history workflow. A proposal can stay sent indefinitely and may be archived manually—there is no decline state.

The editor keeps price, estimated due date, and deliverables visible above the free-text body. The freelancer saves manually and sees when it was last saved. Its basic formatting tools are bold, italic, headings, and bullet/numbered lists. Font family and size customization are a Pro feature.

### Projects

Projects are either **Active** or **Completed**. Completed projects remain available, while only active projects count toward a plan limit. Freelancers update a simple status (for example, In Progress, Delivered, Awaiting Review, or Approved) and a 0–100% progress indicator manually. A status change appears as a system entry in the project thread.

The client approves deliverables with an explicit action; approval is never inferred from a message.

### Contracts and payments

Contracts are generated from the accepted proposal's price, due date, and deliverables using a fixed template. They include a plain notice that they are not legal advice. Client signing is a lightweight typed-name acknowledgement, not an e-signature service.

Payments use a fixed 50/50 structure: the freelancer manually marks **Deposit Received** and **Final Payment Received** once those off-platform payments arrive.

### Notifications

Proposal events (sent, commented on, accepted), contract events, and each message are app-wide notifications. There is no real-time sync requirement; changes appear the next time the other person opens the relevant page.

## Plans

| Feature | Free | Pro |
| --- | --- | --- |
| Price | $0/month | $20/month, or $192/year ($16/month) |
| Active projects | 2 | Unlimited |
| Proposal formatting | Default font and size | Font family and size customization |
| Client portal branding | Powered by EZLane | Branding removable |
| Portal customization | — | Accent color and logo |

Plan enforcement is currently conceptual/UI-level; payment processing is not implemented.

## Tech stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- tRPC
- Prisma with PostgreSQL
- Better Auth

## Getting started

### Prerequisites

- Node.js and npm
- PostgreSQL

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and configure:

   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_GITHUB_CLIENT_ID`
   - `BETTER_AUTH_GITHUB_CLIENT_SECRET`

3. Apply the database schema:

   ```bash
   npm run db:push
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve a production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run format:check` | Check formatting |
| `npm run db:generate` | Create and apply a development Prisma migration |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio |

## Scope boundaries

EZLane intentionally does not include payment processing, Stripe integration, live collaboration, client accounts/shared client logins, AI-written contracts, legal services, milestone-derived progress, or message editing/deletion.
