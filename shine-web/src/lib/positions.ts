// Canonical pitch-position vocabulary — mirrors ShineApi/Services/Positions.cs.
// One list, two linked concept sets: role = coarse area (GK/DF/MF/FW), position
// = granular code or the area's generic code when a source isn't more specific.

export interface PositionOption {
  code: string;
  label: string;
  role: string;
  roleLabel: string;
}

export const POSITION_ROLES: { code: string; label: string }[] = [
  { code: "GK", label: "Goalkeeper" },
  { code: "DF", label: "Defender" },
  { code: "MF", label: "Midfielder" },
  { code: "FW", label: "Forward" },
];

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  POSITION_ROLES.map((r) => [r.code, r.label]),
);

/** All canonical position codes: generic area codes plus granular spots. */
export const POSITION_OPTIONS: PositionOption[] = [
  { code: "GK", label: "Goalkeeper", role: "GK", roleLabel: "Goalkeeper" },
  { code: "DF", label: "Defender (unspecified)", role: "DF", roleLabel: "Defender" },
  { code: "CB", label: "Centre-back", role: "DF", roleLabel: "Defender" },
  { code: "LB", label: "Left-back", role: "DF", roleLabel: "Defender" },
  { code: "RB", label: "Right-back", role: "DF", roleLabel: "Defender" },
  { code: "MF", label: "Midfielder (unspecified)", role: "MF", roleLabel: "Midfielder" },
  { code: "DM", label: "Defensive midfielder", role: "MF", roleLabel: "Midfielder" },
  { code: "CM", label: "Central midfielder", role: "MF", roleLabel: "Midfielder" },
  { code: "AM", label: "Attacking midfielder", role: "MF", roleLabel: "Midfielder" },
  { code: "LM", label: "Left midfielder", role: "MF", roleLabel: "Midfielder" },
  { code: "RM", label: "Right midfielder", role: "MF", roleLabel: "Midfielder" },
  { code: "FW", label: "Forward (unspecified)", role: "FW", roleLabel: "Forward" },
  { code: "LW", label: "Left winger", role: "FW", roleLabel: "Forward" },
  { code: "RW", label: "Right winger", role: "FW", roleLabel: "Forward" },
  { code: "ST", label: "Striker", role: "FW", roleLabel: "Forward" },
];

/** Fallback to the raw code for values stored before standardization. */
export function positionLabel(code?: string | null): string {
  if (!code) return "—";
  return POSITION_OPTIONS.find((p) => p.code === code)?.label ?? code;
}

export function roleLabel(code?: string | null): string {
  if (!code) return "—";
  return ROLE_LABELS[code] ?? code;
}
