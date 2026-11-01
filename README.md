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
│   ├── Controllers/      # Auth, Users, Clubs, NationalTeams, Players,
│   │                     # ClubMatches, NationalTeamMatches, PlayerClubs,
│   │                     # ClubMatchSquads, NationalTeamMatchSquads,
│   │                     # MatchRecords, Search, Export
│   ├── Dtos/
│   ├── Models/           # Player, Club, NationalTeam, ClubMatch,
│   │                     # NationalTeamMatch, PlayerClub, ClubMatchSquad,
│   │                     # NationalTeamMatchSquad, ReviewFlag,
│   │                     # RefreshToken, UserPermission
│   ├── Migrations/       # EF migrations (applied on startup)
│   ├── Repositories/
│   ├── Services/         # incl. Services/Auth/TokenService
│   └── ShineApi.http     # sample requests
└── shine-web/
    ├── vercel.json       # SPA rewrite for history routing
    └── src/
        ├── routes/       # / (landing), /data/** (public browser), /manage/** (dashboard)
        ├── pages/        # Players, Matches, Squads, Users, Roles, …
        ├── auth/         # AuthContext, LoginForm, RequirePermission
        ├── lib/          # API clients per entity
        └── components/   # AppSidebar, shared form UI, shadcn ui/*
```

## Core data model

| Entity | What it stores |
|---|---|
| `Player` | Full name, known-as, DOB, gender (`men`/`women`, empty = unknown), nationality (default `Malawi`), positions (canonical codes) with derived roles, height, foot (`left`/`right`/`both`, empty = unknown), status (`active`/`retired`/`unknown`, empty = keeps the stored value on update and defaults to `active` on create), `SourceUrl` |
| `Club` | Name, short name, city, country (default `Malawi`), founded year, `SourceUrl` |
| `NationalTeam` | Canonical national side: name, short name, gender (`men`/`women`/`mixed`), level (`senior`/`U23`/`U20`/`U17`), country, `SourceUrl`. Squad entries reference this instead of free text |
| `PlayerClub` | Player ↔ Club affiliation: start/end dates, `IsCurrent`, contract type (`permanent`/`loan`/`youth`/`trial`), shirt number, position at club (canonical code with derived role) |
| `ClubMatch` | Club fixture: date, competition (e.g. Super League), season, optional home/away `Club` links (+ scores), venue, `SourceUrl`. Teams can be linked after the fact |
| `NationalTeamMatch` | National-team fixture: same core fields, additionally kickoff time, round/stage (e.g. "Group C"), neutral venue, extra time and penalty-shootout scores, with optional home/away `NationalTeam` links |
| `ClubMatchSquad` | Player participation in a club match: lineup status (`starter`/`substitute`/`matchday_squad`/`unused_sub`/`reserve`/`suspended`/`injured`, enforced on write together with `NationalTeamMatchSquad`), minutes, goals, assists, cards, captaincy, notes |
| `NationalTeamMatchSquad` | Same participation detail and enforced lineup-status vocabulary for national-team matches, keyed by `{MatchId, NationalTeamId, PlayerId}` |

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
- `/manage` — staff sign-in + dashboard (overview, players, matches, squads, competitions, users, roles)

## API surface

Reads are public; writes require the listed permission (snapshotted in the access token, refreshed on token refresh):

- `/api/Clubs`, `/api/NationalTeams`, `/api/Players`, `/api/ClubMatches`, `/api/NationalTeamMatches`, `/api/PlayerClubs`, `/api/ClubMatchSquads`, `/api/NationalTeamMatchSquads` — REST (`GET` collection + item, `POST`/`PUT`/`DELETE` with `clubs:write`, `nationalteams:write`, `players:write`, `matches:write`, `squads:write`)
- `/api/Competitions` (+ `/api/Competitions/{id}/seasons` nested) — competition registry and its season editions (`GET` collection + item + `query`, `POST`/`PUT`/`DELETE` with `competitions:write`)
- `/api/StaffMembers`, `/api/StaffAppointments` — staff registry and dated team roles; the appointment needs exactly one of `clubId` / `nationalTeamId` (`GET` collection + item + `query`, `POST`/`PUT`/`DELETE` with `staff:write`). In the web app staff are never browsed on their own: each club and national team owns a Staff section on its page.
- `/api/ClubMatches/{id}/teams`, `/api/NationalTeamMatches/{id}/teams` — `PATCH` (`matches:write`) to link or correct a match's two teams
- `/api/MatchRecords` — `POST` (`matches:write`) to record a full match in one request (fixture, lineups and scorers); unmatched team references become review flags
- `/api/MatchRecords/review-flags` — list, resolve and delete data-review flags (`matches:write`)
- `/api/Search?q=…&kinds=…&limit=…` — public keyword search across players, clubs, national teams, staff and both match kinds; returns a flat list of `{ kind, id, title, subtitle, badge }` ranked best-first (`limit` caps results per kind)
- `/api/Auth` — `register`, `login`, `refresh`, `revoke`, `logout`, `me`
- `/api/Users` — list, role assign/remove (`users:manage`), permission grant/revoke (`permissions:grant`)

Exports — full-list downloads for analysts, journalists and integrations; reads stay public:

- `/api/Players/export`, `/api/Clubs/export`, `/api/NationalTeams/export`, `/api/Competitions/export`, `/api/Competitions/seasons/export`, `/api/StaffMembers/export`, `/api/StaffAppointments/export`, `/api/ClubMatches/export`, `/api/NationalTeamMatches/export`, `/api/PlayerClubs/export` — `GET ?format=csv|json` (default `csv`)
- `/api/Export/appearances` — every squad appearance, club and national matches combined, one flat denormalized row per entry (player, team, opponent, match context, participation detail)
- CSV files are UTF-8 with BOM (Excel-friendly), quoted per RFC 4180, ISO 8601 dates, resolved display names alongside IDs; the JSON download of the same file carries exactly the CSV column names as property names, in the same order
- [docs/exports.md](docs/exports.md) is the data dictionary: what each column means, the ID semantics between files, and the canonical value vocabularies — paste it beside any published export

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

Implemented: Postgres-backed CRUD API for the core entities with service/repository layering and Swagger docs; JWT auth with rotating refresh tokens and role/permission bundles; web landing page plus staff dashboard (`/manage`) for players, matches, squads, competitions, users, and roles; public keyword search across players, clubs, national teams and matches, with a debounced search box and a shareable results page; filtering, sorting and pagination on every public list, including a Malawi national-team browser; full-match recording that flags unmatched references for review; a competitions registry that keeps stable competition identity separate from sponsor-named seasons, linked optionally from club and national-team matches and exposed through data pages and exports; a staff registry with dated club and national-team appointments, canonical roles and a derived national coach, managed inside each team's own page rather than as a standalone directory; CSV/JSON exports for every public entity plus a combined flat appearances export for club and national squad entries; and a canonical position vocabulary (roles `GK`/`DF`/`MF`/`FW` with granular position codes) enforced on write across players, squads and club stints, surfaced as grouped pickers in the web forms and as extra columns in the player, appearance and career exports; and canonical gender values (`men`/`women`, aligned with the national-team vocabulary) enforced on write (the gender backfill was a one-off update on the live database, so existing records carry canonical values without any runtime backfill); enforced canonical foot (`left`/`right`/`both`) and player status (`active`/`retired`/`unknown`) on player writes; enforced line-up-status vocabulary (`starter`/`substitute`/`matchday_squad`/`unused_sub`/`reserve`/`suspended`/`injured`) on club and national-team squad writes; and validated national-team gender (`men`/`women`/`mixed`) on write.

Planned (per product description, not yet built): squad-role filters, public API hardening, moderation and audit logging, bulk import/correction workflows, and provenance enrichment (source type, confidence, last-verified date).

Left as free text on purpose for now: `NationalTeam.Level` (convention is `senior`/`U23`/`U20`/`U17` when a level is known) and `PlayerClub.ContractType` (convention is `permanent`/`loan`/`youth`/`trial`). Match `competition`/`season` stay free text as the source's own wording, kept alongside the optional registry links so provenance survives a rename or re-sponsorship.

## Contributing

Contributions and corrections are part of the workflow. The usual flow:

1. Open an issue describing the data gap, bug, or feature.
2. Cite a source (URL) for any factual data change.
3. Keep changes small and scoped; one entity or endpoint per PR is ideal.

## License

MIT — see [LICENSE](LICENSE).
