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

- **Runtime:** .NET 10 (ASP.NET Core Web API)
- **Data access:** Entity Framework Core (currently the InMemory provider — `ShineDb`)
- **API docs:** OpenAPI + NSwag Swagger UI (development)
- **Logging:** Serilog (console + daily rolling file under `logs/`)
- **Architecture:** Controllers → Services → Repositories → `ShineDbContext`

## Repository layout

```text
shine/
├── README.md
├── LICENSE
├── docs/
│   └── PRODUCT.md          # product description
└── ShineApi/
    ├── Program.cs          # DI wiring, EF InMemory, Serilog, Swagger UI
    ├── Controllers/        # Clubs, Players, Matches, PlayerClubs,
    │                       # ClubMatchSquads, NationalTeamMatchSquads
    ├── Dtos/
    ├── Models/             # Player, Club, Match, PlayerClub,
    │                       # ClubMatchSquad, NationalTeamMatchSquad
    ├── Repositories/
    ├── Services/
    └── ShineApi.http       # sample requests
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

Prerequisites: [.NET 10 SDK](https://dotnet.microsoft.com/download).

```powershell
# from the repo root
dotnet run --project ShineApi
```

Then open (development):

- Swagger UI: `https://localhost:<port>/swagger`
- OpenAPI JSON: `https://localhost:<port>/openapi/v1.json`

The port is assigned by ASP.NET Core (`Properties/launchSettings.json` if present, otherwise a random dev port — check console output). The database is EF InMemory (`ShineDb`), so data resets on restart — suitable for development only.

Sample requests live in [`ShineApi/ShineApi.http`](ShineApi/ShineApi.http) and can be run from VS Code (REST Client) or Rider.

## API surface

All resources follow standard REST conventions (`GET` collection + item, `POST`, `PUT`, `DELETE`):

- `/api/Clubs`
- `/api/Players`
- `/api/Matches`
- `/api/PlayerClubs`
- `/api/ClubMatchSquads`
- `/api/NationalTeamMatchSquads`

## Deploying the API (Render)

Only the API deploys to Render; the frontend lives in this repo but deploys separately to Vercel.

- **Runtime:** Render has no .NET runtime, so the service uses Docker with the `Dockerfile` at the repo root (multi-stage: .NET 10 SDK build → ASP.NET runtime image).
- **Port:** the container listens on Render's `$PORT` (defaults to `10000`). No port configuration needed.
- **Health check:** set Render's **Health Check Path** to `/healthz`.
- **HTTPS:** TLS terminates at Render's proxy. The app honors `X-Forwarded-Proto` via forwarded headers (`Program.cs`), so the dev-only HTTPS redirection doesn't loop behind the proxy.
- **Persistence:** the current EF InMemory (`ShineDb`) store resets on every restart — acceptable for the initial version. The planned Neon (Postgres) migration should take its connection string from an environment variable, never a committed file.

Swagger UI is only served in Development; in production use `/healthz` and the `/api/*` endpoints.

## Status and roadmap

Implemented: CRUD API for the six core entities over an InMemory store, with service/repository layering and Swagger docs.

Planned (per product description, not yet built): search/filter across player/club/match/competition/date/squad role, CSV/JSON export, public API hardening, role-based editing with moderation and audit logging, bulk import/correction workflows, provenance enrichment (source type, confidence, last-verified date), and a persistent database provider.

## Contributing

Contributions and corrections are part of the workflow. The usual flow:

1. Open an issue describing the data gap, bug, or feature.
2. Cite a source (URL) for any factual data change.
3. Keep changes small and scoped; one entity or endpoint per PR is ideal.

## License

MIT — see [LICENSE](LICENSE).
