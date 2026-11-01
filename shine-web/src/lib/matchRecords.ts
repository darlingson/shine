import { apiJson } from "@/lib/api";

export interface MatchRecordSquadRow {
  clubId: number;
  name: string;
  position?: string;
  shirtNumber?: number | null;
  lineupStatus: string;
  minutesPlayed?: number | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  captain: boolean;
  sourceUrl?: string;
  notes?: string;
}

export interface MatchRecordPayload {
  match: {
    matchDate: string;
    competition?: string;
    season?: string;
    /** Registry links — omitted leaves the match unlinked. */
    competitionId?: number;
    seasonId?: number;
    homeClubId: number;
    awayClubId: number;
    homeScore?: number | null;
    awayScore?: number | null;
    venue?: string;
    sourceUrl?: string;
  };
  squads: MatchRecordSquadRow[];
}

export interface MatchRecordEntry {
  row: number;
  playerId: number;
  decision: "linked" | "linked-unverified" | "created";
  score: number;
  flag?: string | null;
}

export interface ReviewFlag {
  reviewFlagId: number;
  entityType: string;
  entityKey: string;
  reason: string;
  score?: number | null;
  status: string;
  sourceUrl?: string | null;
}

export interface MatchRecordResult {
  matchId: number;
  entries: MatchRecordEntry[];
  createdPlayerIds: number[];
  reviewFlags: ReviewFlag[];
}

export const SQUAD_STATUSES = [
  "starter",
  "substitute",
  "matchday_squad",
  "unused_sub",
  "reserve",
  "suspended",
  "injured",
];

export const SQUAD_STATUS_LABELS: Record<string, string> = {
  starter: "Starter",
  substitute: "Substitute",
  matchday_squad: "Matchday squad",
  unused_sub: "Unused sub",
  reserve: "Reserve",
  suspended: "Suspended",
  injured: "Injured",
};

export function createMatchRecord(payload: MatchRecordPayload): Promise<MatchRecordResult> {
  return apiJson<MatchRecordResult>("/api/matchrecords", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listReviewFlags(): Promise<ReviewFlag[]> {
  return apiJson<ReviewFlag[]>("/api/matchrecords/review-flags");
}
