# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-11

### Added
- Next.js 14 App Router project scaffolding.
- Prisma relational database schema (User, Org, Membership, Services, Incidents, IncidentServices, IncidentUpdates, AuditLogs) configured for SQLite.
- NextAuth session middleware credentials implementation carrying custom org context claims.
- Tailwind CSS global variables layout matching light and dark themes.
- 18 UI Primitives components including Button, Dialog, Confirm, Toast, and Search.
- Dashboard Overview dashboard presenting status summaries, active incidents counters, and admin activity feed.
- Service and Incident CRUD operations backed by Server Actions and validation schemas.
- Interactive public-facing status landing templates supporting custom canonical headers and timeline expanders.
- Vitest unit tests verifying validators and sliding window rate limits.
- GitHub Actions CI workflow config.
