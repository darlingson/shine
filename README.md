# Shine — Malawi Football Player Database

A structured, source-backed database of Malawian football players, their club affiliations, and their participation in club and national team match squads — built to make fragmented football data searchable, traceable, and reusable.

> See [docs/PRODUCT.md](docs/PRODUCT.md) for the full product description (problem, solution, users, principles, boundaries).

## What this is

Shine records facts about Malawian football players and their match involvement so questions like these become answerable in one place:

- Who played for this club, and when?
- Was this player in the squad for that match? Did they start?
- Did this player feature for the national team (including youth / women's sides)?

Every record carries provenance (`SourceUrl`, timestamps) so users can see what is known, where it came from, and how reliable it is. The project is intentionally **non-authoritative**: it is a tool for recording, linking, correcting, and retrieving data — not an official registry, live score service, or scouting platform.

## Tech stack

- **API:** .NET 10 (ASP.NET Core Web API), Controllers → Services → Repositories → `ShineDbContext`
- **Data access:** Entity Framework Core over Postgres (Npgsql); schema via EF migrations, applied automatically at startup
- **Auth:** ASP.NET Identity + JWT access tokens (15 min, permissions snapshotted in) + rotating SHA-256-hashed refresh tokens (14 days); roles `Admin`/`Editor`/`Viewer` with permission bundles (`users:manage`, `players:write`, …)
- **API docs:** OpenAPI + Swagger UI (development)
- **Logging:** Serilog (console + daily rolling file under `logs/`)
- **Web:** React 19 + Vite + TanStack Router (file-based routes) + shadcn/ui + Tailwind CSS

## Repository layout

```text
shine/
├── README.md
├── LICENSE
├── Dockerfile            # multi-stage .NET build for Render
├── docs/
│   └── PRODUCT.md        # product description
├── ShineApi/
│   ├── Program.cs        # DI wiring, JWT, EF Npgsql, Serilog, Swagger UI
│   ├── Authorization/    # Permissions, policies, role seeder
│   ├── Controllers/      # Auth, Users, Clubs, Players, Matches,
│   │                     # PlayerClubs, ClubMatchSquads, NationalTeamMatchSquads
│   ├── Dtos/
│   ├── Models/           # Player, Club, Match, PlayerClub,
│   │                     # ClubMatchSquad, NationalTeamMatchSquad,
│   │                     # RefreshToken, UserPermission
│   ├── Migrations/       # EF migrations (applied on startup)
│   ├── Repositories/
│   ├── Services/         # incl. Services/Auth/TokenService
│   └── ShineApi.http     # sample requests
└── shine-web/
    ├── vercel.json       # SPA rewrite for history routing
    └── src/
        ├── routes/       # / (landing), /manage/** (dashboard)
        ├── pages/        # Players, Matches, Squads, Users, Roles, …
        ├── auth/         # AuthContext, LoginForm, RequirePermission
        ├── lib/          # API clients per entity
        └── components/   # AppSidebar, shared form UI, shadcn ui/*
```

## Core data model

| Entity | What it stores |
|---|---|
| `Player` | Full name, known-as, DOB, gender, nationality (default `Malawi`), positions, height, foot, status (`active`/`retired`/`unknown`), `SourceUrl` |
| `Club` | Name, short name, city, country (default `Malawi`), founded year, `SourceUrl` |
| `PlayerClub` | Player ↔ Club affiliation: start/end dates, `IsCurrent`, contract type (`permanent`/`loan`/`youth`/`trial`), shirt number, position at club |
| `Match` | Date, competition (e.g. Super League, AFCON qualifier), season, home/away teams + scores, venue, `SourceUrl` |
| `ClubMatchSquad` | Player participation in a club match: lineup status (`starter`/`substitute`/`unused_sub`/`reserve`/`suspended`/`injured`), minutes, goals, assists, cards, captaincy, notes |
| `NationalTeamMatchSquad` | Same participation detail for national sides (e.g. `Malawi`, `Malawi U20`, `Malawi Women`) |

## Getting started

Prerequisites: [.NET 10 SDK](https://dotnet.microsoft.com/download), a Postgres database, and Node 20+ with pnpm for the web app.

### API

The API needs configuration — user-secrets locally, environment variables in production (never committed files):

```powershell
# from the repo root
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=shine;Username=...;Password=..." --project ShineApi
dotnet user-secrets set "Jwt:Key" "<at-least-32-chars>" --project ShineApi
dotnet user-secrets set "Jwt:Issuer" "shine-local" --project ShineApi
dotnet user-secrets set "Seed:AdminEmail" "you@example.com" --project ShineApi
dotnet user-secrets set "Seed:AdminPassword" "<8+ chars, letters and a number>" --project ShineApi

dotnet run --project ShineApi
```

On boot the app applies pending EF migrations, then seeds the `Admin`/`Editor`/`Viewer` roles and the admin user from `Seed:*`. Passwords need 8+ characters with letters and a number (see `Program.cs`).

Then open (development):

- Swagger UI: `https://localhost:<port>/swagger`
- OpenAPI JSON: `https://localhost:<port>/openapi/v1.json`

The port is assigned by ASP.NET Core (`Properties/launchSettings.json` if present, otherwise a random dev port — check console output).

Sample requests live in [`ShineApi/ShineApi.http`](ShineApi/ShineApi.http) and can be run from VS Code (REST Client) or Rider.

### Web

```powershell
# from shine-web/
pnpm install
# point at the API (see .env.example)
"VITE_API_URL=http://localhost:<api-port>" | Out-File -FilePath .env -Encoding utf8
pnpm dev
```

- `/` — public landing page
- `/manage` — staff sign-in + dashboard (overview, players, matches, squads, users, roles)

## API surface

Reads are public; writes require the listed permission (snapshotted in the access token, refreshed on token refresh):

- `/api/Clubs`, `/api/Players`, `/api/Matches`, `/api/PlayerClubs`, `/api/ClubMatchSquads`, `/api/NationalTeamMatchSquads` — REST (`GET` collection + item, `POST`/`PUT`/`DELETE` with `players:write`, `clubs:write`, `matches:write`, `squads:write`)
- `/api/Auth` — `register`, `login`, `refresh`, `revoke`, `logout`, `me`
- `/api/Users` — list, role assign/remove (`users:manage`), permission grant/revoke (`permissions:grant`)

## Deploying

### API (Render)

- **Runtime:** Render has no .NET runtime, so the service uses Docker with the `Dockerfile` at the repo root (multi-stage: .NET 10 SDK build → ASP.NET runtime image).
- **Port:** the container listens on Render's `$PORT` (defaults to `10000`). No port configuration needed.
- **Health check:** set Render's **Health Check Path** to `/healthz`.
- **HTTPS:** TLS terminates at Render's proxy. The app honors `X-Forwarded-Proto` via forwarded headers (`Program.cs`), so the dev-only HTTPS redirection doesn't loop behind the proxy.
- **Environment variables:** `ConnectionStrings__DefaultConnection` (Neon/Postgres), `Jwt__Key` (≥32 chars), `Jwt__Issuer`, `Seed__AdminEmail`, `Seed__AdminPassword`, optionally `Jwt__Audience`, `Cors__AllowedOrigins`, `Jwt__AccessExpiryMinutes`, `Jwt__RefreshExpiryDays`. Migrations run automatically at startup.
- **Persistence:** Postgres. Data survives restarts.

Swagger UI is only served in Development; in production use `/healthz` and the `/api/*` endpoints.

### Web (Vercel)

- Set `VITE_API_URL` to the deployed API origin and rebuild after changing it (Vite bakes env at build time; production builds fail fast if it is unset).
- `vercel.json` rewrites all routes to `index.html` so `/manage/**` deep links work with history routing.

## Status and roadmap

Implemented: Postgres-backed CRUD API for the six core entities with service/repository layering and Swagger docs; JWT auth with rotating refresh tokens and role/permission bundles; web landing page plus staff dashboard (`/manage`) for players, matches, club/national squads, users, and roles.

Planned (per product description, not yet built): search/filter across player/club/match/competition/date/squad role, CSV/JSON export, public API hardening, moderation and audit logging, bulk import/correction workflows, and provenance enrichment (source type, confidence, last-verified date).

## Contributing

Contributions and corrections are part of the workflow. The usual flow:

1. Open an issue describing the data gap, bug, or feature.
2. Cite a source (URL) for any factual data change.
3. Keep changes small and scoped; one entity or endpoint per PR is ideal.

## License

MIT — see [LICENSE](LICENSE).
