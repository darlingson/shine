import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "__none__";

/** Select for an optional string value: a "Not set" choice plus the given
 * options, shown verbatim (they are short canonical codes/values). */
export function OptionalSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Not set",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <Select
      value={value || NONE}
      onValueChange={(v) => onChange(!v || v === NONE ? "" : v)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue>
          {(v: unknown) =>
            typeof v === "string" && v !== NONE && v !== "" ? v : placeholder
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
