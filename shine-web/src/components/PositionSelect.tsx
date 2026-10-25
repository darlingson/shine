import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POSITION_OPTIONS, POSITION_ROLES } from "@/lib/positions";

/** Sentinel for "no position" — Base UI items can't use an empty value. */
const NONE = "__none__";

interface PositionSelectProps {
  id: string;
  /** Canonical position code, or "" for none. */
  value?: string;
  onChange: (code: string) => void;
  placeholder?: string;
  className?: string;
}

/** Single picker for the canonical position code. The role stored on the
 * record is derived server-side from this choice — no separate role input. */
export function PositionSelect({
  id,
  value = "",
  onChange,
  placeholder = "Select…",
  className,
}: PositionSelectProps) {
  const selectValue = value === "" ? NONE : value;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onChange(v === NONE || v == null ? "" : v)}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>None</SelectItem>
        {POSITION_ROLES.map((role) => (
          <SelectGroup key={role.code}>
            <SelectLabel>{role.label}</SelectLabel>
            {POSITION_OPTIONS.filter((p) => p.role === role.code).map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {p.code} — {p.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
