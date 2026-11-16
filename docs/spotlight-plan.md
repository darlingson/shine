# Player & Team Spotlight — Landing Page Plan

> Branch: `feat/player-spotlight`. The landing page becomes a spotlight page: the leaderboard section (top scorers / providers / caps / latest) is removed, replaced by one editorially-picked player and one team.

## Principle

Shine is a player database, not a performance tracker. The spotlight presents a **player** — who they are, where they play, what their record looks like — chosen by an editor because they are worth knowing about right now (a new signing, a national call-up, a women's-game profile, a milestone). It is never an automatic ranking of goals or minutes. Performance numbers appear only as the player's own record, in context.

Following the product ethos, every pick carries an editorial note and a `SourceUrl` — why this player, and where that came from.

## Decisions

| Decision | Choice |
|---|---|
| Who picks | Editorial: admins curate picks in the manage dashboard; no algorithmic selection |
| What shows on landing | One featured player + one featured team |
| Card depth | Rich: a dedicated public API composes profile + record server-side |
| When nothing is picked | Spotlight sections render nothing; hero/search/about still carry the page |
| Leaderboards | Deleted (also stops the landing page downloading every squad entry to compute stats client-side) |

## Data model (API)

New entity `Spotlight` — one row per pick, history retained:

```text
Spotlight
  Id                  int, PK
  SubjectKind         text  — 'player' | 'club' | 'nationalTeam'   (required)
  PlayerId            int?  — set when SubjectKind = 'player'
  ClubId              int?  — set when SubjectKind = 'club'
  NationalTeamId      int?  — set when SubjectKind = 'nationalTeam'
  Note                text  — the editorial blurb ("why this player")  (required, max ~500 chars)
  SourceUrl           text  — provenance for the pick                  (optional)
  IsCurrent           bool  — exactly one true per SubjectKind, enforced atomically on write
  CreatedAt / UpdatedAt timestamps
```

Mirrors existing in-repo patterns:

- exactly-one-of reference validation, same as `StaffAppointment` (`clubId` / `nationalTeamId`)
- `IsCurrent` with atomic write-side toggle, same as `PlayerClub.IsCurrent` and the recent atomic team-staff writes
- past picks stay as rows — a "past spotlights" view falls out for free later

## API surface

Public (no auth):

- `GET /api/Spotlight` — the composed landing bundle: current player pick (profile, current club + national team, career record: appearances, goals, assists, national caps, recent matches with participation) and current team pick (profile, coach/staff lead, recent results, squad size). Returns `{ player: null, team: null }` when nothing is current.
- `GET /api/Spotlight/history` — past picks, newest first (powers a future archive page; cheap to include now).

Manage (auth, new permission `spotlight:write` in the existing permission-bundle pattern):

- `GET /api/Spotlight/picks` — all picks with their subject's resolved display name
- `POST /api/Spotlight` — create; setting `IsCurrent = true` demotes the previous current pick of the same kind in one transaction
- `PUT /api/Spotlight/{id}` — edit / activate / retire
- `DELETE /api/Spotlight/{id}`

Composition lives in a `SpotlightService` (Controllers → Services → Repositories layering, like the rest). Record totals aggregate squad entries via EF; recent matches are the latest 5 with the player's participation line.

## Web

- `lib/spotlight.ts` — typed client + TanStack Query hook for the bundle and picks.
- `routes/index.tsx` — rebuilt:
  - **Keep:** hero (live totals, SearchBox, contribute card), about strip, footer.
  - **Remove:** all leaderboards, `Scorer`, `Leaderboard`, `Empty`, and the `useClubSquads` / `useNationalSquads` fetches the landing no longer needs.
  - **Add:** "Spotlight" section — featured player card (monogram, name, position, current club, national team, record totals, recent matches, editorial note with source link, CTA to `/data/players/$id`) and featured team card (name, kind badge, coach, recent results, CTA to the team's data page). Sections render only when a pick exists.
- `routes/manage/spotlight.tsx` — new manage page: pick list with current markers, editor form (subject picker, note, source URL, set-current), gated on `spotlight:write`; sidebar entry alongside existing manage sections.

## Sequence

Small scoped commits, per the contributing guide:

1. **API:** `Spotlight` model + migration, CRUD controller/service/repo, exactly-one-of + atomic current-toggle validation, `spotlight:write` permission + role seeder update.
2. **API:** composed public `GET /api/Spotlight` bundle (record aggregation service) + history endpoint; export/Swagger touch-ups.
3. **Web:** `lib/spotlight.ts` client + manage page for picks.
4. **Web:** landing page rebuild — remove leaderboards, add spotlight sections with loading skeleton and empty-state behavior.

## Left for during implementation

- Player card contents beyond the core (DOB/age? foot? height?) — keep it lean, the data page holds the rest
- Recent-matches count (default 5)
- Monogram styling per team kind (club vs national team)
