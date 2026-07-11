# StatusForge

> Beautiful public status pages with incident timelines for engineering teams. Build trust with your customers by keeping them informed during downtime.

StatusForge is a production-grade SaaS status page application designed for engineering teams. It allows you to display infrastructure status, post chronological incident updates, and present uptime records clearly without clutter. Inspired by Vercel, Linear, and Supabase.

---

## Features

- **Service Status Indicators:** Manage, track, and display the health status of separate microservices, clusters, portals, and CDNs.
- **Incident Updates Timelines:** Report incident lifecycles chronologically with detailed updates, markdown, and severity indicators.
- **Cascading State Resolvers:** Incident states cascade directly to affected services. Resolving an incident automatically recovers services to operational.
- **Role-Based Access Control (RBAC):** Restrict modification capabilities to authenticated Owners, Admins, and Members. Viewers are restricted to read-only views.
- **Admin Audit Logs:** Trace administrative actions, service additions, status transitions, and incident updates in a central log feed.
- **Responsive Theme Switcher:** Fully supporting keyboard accessible light and dark themes.

---

## Tech Stack

- **Core Framework:** Next.js 14 (App Router) + TypeScript strict mode
- **Database ORM:** Prisma ORM (SQLite for dev, PostgreSQL-ready)
- **Authentication:** NextAuth.js v4 (Credentials Provider with JWT sessions)
- **Styling & UI:** Tailwind CSS with CSS custom properties design tokens and Lucide React icons
- **Testing Suite:** Vitest unit assertions

---

## Quick Start

### 1. Clone the repository and navigate inside
```bash
git clone https://github.com/your-org/statusforge.git
cd statusforge
```

### 2. Configure environment variables
Copy the example variables file:
```bash
cp .env.example .env
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run database migrations and seed data
Generate Prisma client engines and seed demo accounts:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the homepage.

---

## Demo Login

You can log in to the admin dashboard with the following seed credentials:

- **Email:** `demo@demo.com`
- **Password:** `demo1234`

---

## Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | Prisma DB connection URL | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Secret token signing NextAuth JWT sessions | `some-random-signing-secret` |
| `NEXTAUTH_URL` | Local or production NextAuth app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | Base public canonical URL of the application | `http://localhost:3000` |

---

## Architecture

For details on the database relationships, authentication guards, and non-obvious architecture trade-offs, read the [Architecture Documentation](docs/architecture.md).

## Testing Commands

Run the unit test suites:
```bash
# Run tests once
npm run test

# Run tests in watch mode
npx vitest
```

---

## Roadmap

- [x] Multi-service status indicator dashboards
- [x] Incident timeline reporting with cascading resolver actions
- [x] Role-Based Access Control credentials
- [x] Keyboard navigation overlays, mobile drawer toggles, prefers-reduced-motion supports
- [ ] Google & GitHub OAuth integrations
- [ ] Email/Slack real-time status notifications
- [ ] Automated ping checks and response latency monitoring (uptime stats)

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

*Digital Heroes Full Stack Developer Trial submission.*
