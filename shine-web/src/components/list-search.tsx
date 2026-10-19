import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ListSearchProps {
  "aria-label": string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Filter box for a list that is already loaded. Clears on Escape. */
export function ListSearch({
  "aria-label": ariaLabel,
  value,
  onValueChange,
  placeholder = "Search",
  className,
}: ListSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onValueChange("");
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-9"
      />
    </div>
  );
}