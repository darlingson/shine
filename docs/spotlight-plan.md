# Player & Team Spotlight — Landing Page Plan

> Branch: `feat/player-spotlight`. The landing page becomes a spotlight page: the leaderboard section (top scorers / providers / caps / latest) is removed, replaced by a rotating player spotlight and a rotating team spotlight.

## Principle

Shine is a player database. The spotlight is a window into the record: it presents **the player** — who they are, where they play, what their record looks like — and rotates through everyone in the database over time. It is not a performance ranking and not a curated highlight; no one picks anyone. As the record grows, the spotlight keeps moving through it.

Any performance numbers that appear are the player's own record, in context, never compared or ranked.

## Decisions

| Decision | Choice |
|---|---|
| Who picks | No one. Selection is automatic rotation over the existing record |
| Rotation | Deterministic daily: the same player/team all day (UTC), a different one each day |
| What shows on landing | One player + one team |
| Card depth | Rich: a dedicated public API composes profile + record server-side |
| When sparse | Show it anyway with the facts that exist — an honest thin record fits the product; sections hide only when the database itself is empty |
| Leaderboards | Deleted (also stops the landing page downloading every squad entry to compute stats client-side) |

## Selection mechanics

- **Player pool:** all players, deterministic order (by `Id`). Prefer players with at least one recorded fact (a club affiliation or a squad entry) so the spotlight rarely lands on a bare name; fall back to the full pool when no such players exist.
- **Team pool:** clubs and national teams in one pool, same idea.
- **Index:** `days-since-epoch mod pool-size` — stable for the whole day, cacheable, and every entry in the record gets a turn. No state, no cron, nothing to store.
- **Testability:** the endpoint accepts an optional `?date=YYYY-MM-DD` to compute any day's spotlight deterministically.

## API surface

Public, read-only, no auth, **no new entity, no admin UI, no new permission**:

- `GET /api/Spotlight` — the composed bundle:
  - `player`: profile, current club, national team, career record (appearances, goals, assists, national caps), recent matches with participation, position/foot/age as available
  - `team`: profile, kind (club / national team), coach or staff lead from the appointments registry, recent results, squad size
  - `asOf`: the rotation date used
- Composition lives in a `SpotlightService` (Controllers → Services → Repositories layering, like the rest); all aggregation is server-side via EF.
- `Cache-Control` header so CDNs/proxies can hold the response for the day.

## Web

- `lib/spotlight.ts` — typed client + TanStack Query hook for the bundle.
- `routes/index.tsx` — rebuilt:
  - **Keep:** hero (live totals, SearchBox, contribute card), about strip, footer.
  - **Remove:** all leaderboards, `Scorer`, `Leaderboard`, `Empty`, and the `useClubSquads` / `useNationalSquads` fetches the landing no longer needs.
  - **Add:** spotlight section — player card (monogram, name, position, current club, national team, record totals, recent matches, CTA to `/data/players/$id`) and team card (name, kind badge, coach, recent results, CTA to the team's data page). Loading skeleton while fetching; sections hidden when the database is empty.

## Sequence

Two scoped commits:

1. **API:** `SpotlightController` + `SpotlightService` — deterministic rotation, server-side composition, `?date=` override, cache headers, Swagger docs.
2. **Web:** `lib/spotlight.ts` client, landing page rebuild — remove leaderboards, add spotlight cards with loading/empty behavior.

## Left for during implementation

- How much bio on the card (DOB/age? foot? height?) — keep it lean, the data page holds the rest
- Recent-matches count (default 5)
- Monogram styling per team kind (club vs national team)
- If rotation ever needs biasing (e.g. prefer recently-added records), it stays a pure function of the date — no state
