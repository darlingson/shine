# Export data dictionary

What every CSV/JSON export holds, column by column, and how the files
reference each other. All exports ship from the API endpoints listed in
the [README](README.md#api) (`?format=csv|json`, default `csv`).

## Reading the files together

CSV and JSON exports of the same file are identical in shape: same column
names, same values, same row order — pick either format.

Every ID column joins two files in the set:

| Join key | Present in | Points at |
|---|---|---|
| `playerId` | players, player-career-history, match-appearances | players.csv |
| `clubId` | clubs, player-career-history (`clubId`), club-matches (`homeClubId`/`awayClubId`), match-appearances (`teamId`/`opponentId` when scope = club) | clubs.csv |
| `nationalTeamId` | national-teams, match-appearances (`teamId`/`opponentId` when scope = national) | national-teams.csv |
| `matchId` | club-matches / national-team-matches, match-appearances | the match that owns the appearance |

A row always names the entity it IDs (`playerId` sits beside `playerName`,
`clubId` beside `clubName`, …), so the files are readable standalone — the
IDs exist so analyses can join without relying on names, which are not
unique or stable.

Each row ends `sourceUrl, createdAt, updatedAt`: where the fact came from
and how fresh it is. `sourceUrl` is the citation; blank cells mean unknown.

## players.csv

One row per player.

| Column | Meaning |
|---|---|
| `playerId` | Stable ID; the join key for everything about a player |
| `fullName`, `knownAs` | Registered name and the name used publicly (blank = same as full name) |
| `dateOfBirth` | ISO date, blank if unknown |
| `gender` | `men` or `women`, blank = unknown |
| `nationality` | Defaults to `Malawi` when the source implies it |
| `positionPrimary`, `positionSecondary` | Canonical position codes: `GK DF CB LB RB MF DM CM AM FW LW RW ST` |
| `primaryRole`, `secondaryRole` | Coarse bucket for the same position: one of `GK DF MF FW` (a `CB` has position `CB`, role `DF`) |
| `heightCm` | Centimetres |
| `foot` | `left` / `right` / `both`, blank = unknown |
| `status` | `active` / `retired` / `unknown` |

The position/role columns can look duplicated (`DF, DF`); they only differ
when the position is granular (`CB, DF`, `RW, FW`). The role is the bucket
to group on; the position is the specific spot.

## clubs.csv

One row per club **entity** — one per team, not per organisation:
"FCB Nyasa Big Bullets" and "FCB Nyasa Big Bullets U19" are separate rows
because they are separate sides.

| Column | Meaning |
|---|---|
| `clubId` | Join key used by career history, matches and appearances |
| `name`, `shortName` | Full name and common short form |
| `city`, `country` | Where the side is based (country defaults `Malawi`) |
| `foundedYear` | Blank if not sourced |

## player-career-history.csv

One row per **stint**: a player registered at a club for a period. A player
moving between clubs produces several rows; a loan can too.

| Column | Meaning |
|---|---|
| `stintId` | Stable ID of the stint itself (referenced by nothing else — your handle for one affiliation) |
| `playerId`, `playerName` | The player |
| `clubId`, `clubName` | The club they were registered with |
| `startDate`, `endDate` | Contract/registration window; `endDate` blank = still there |
| `isCurrent` | `true` while the player is actively registered at this club |
| `contractType` | Free text; convention is `permanent` / `loan` / `youth` / `trial` |
| `shirtNumber` | Worn at this club (can vary between stints) |
| `positionAtClub`, `roleAtClub` | Where they played at that club, canonical code + bucket role |

## club-matches.csv

One row per club fixture.

| Column | Meaning |
|---|---|
| `matchId` | Join key for match appearances |
| `matchDate` | ISO date |
| `competition`, `season` | e.g. `FDH Bank Premiership`, `2026`; free text for now |
| `homeClubId` / `awayClubId`, `homeClubName` / `awayClubName` | The two sides |
| `homeScore` / `awayScore` | Filled only from a same-day match report; blank while lineups alone are known |
| `venue` | Where it was played |

## national-teams.csv

One row per national side (men's, women's, youth as separate sides).

| Column | Meaning |
|---|---|
| `nationalTeamId` | Join key used by national matches and appearances |
| `name`, `shortName`, `nickname` | e.g. "Malawi", "Malawi", "The Flames" |
| `gender` | `men` / `women` / `mixed` |
| `level` | Free text; convention is `senior` / `U23` / `U20` / `U17` |
| `coach`, `country` | As sourced |

## national-team-matches.csv

Same shape as club-matches plus international specifics: `kickoffTime`
(HH:mm), `stage` (e.g. "Group C"), `isNeutral`, `wentToExtraTime`, and
`homePenaltyScore` / `awayPenaltyScore` (set together, only when there was
a shootout).

## match-appearances.csv

The flagship file: one flat row per squad entry — **go far with this one
alone, no joins required**. Covers club and national squad entries in one
table.

| Column | Meaning |
|---|---|
| `matchScope` | `club` or `national` — tells you which match table `matchId` refers to |
| `matchId` | The match (see scope); joins club-matches or national-team-matches |
| `matchDate`, `kickoffTime`, `competition`, `season`, `stage` | Denormalised from the match so the file stands alone |
| `teamId`, `teamName` | The side the player featured for — a `clubId` when scope = `club`, a `nationalTeamId` when scope = `national` |
| `opponentId`, `opponentName` | The other side, same ID semantics as teamId |
| `homeScore`, `awayScore`, `isNeutral`, `wentToExtraTime` | Match context |
| `playerId`, `playerName` | The player |
| `lineupStatus` | How they featured: `starter` / `substitute` / `matchday_squad` (listed without a confirmed starter/bench split) / `unused_sub` / `reserve` / `suspended` / `injured` |
| `shirtNumber` | Worn that match |
| `position`, `role` | Where they featured that match (same code/bucket pair as the player files) |
| `minutesPlayed` | Blank when the report didn't leave (start ≈ 90/120, subs ≈ appearance length) |
| `goals`, `assists`, `yellowCards`, `redCards` | Counted events, integer, blank = nothing reported, not zero-certified |
| `captain` | `true` when they wore the armband |
| `notes` | Free text residue from the source (e.g. "equalised in stoppage time") |
