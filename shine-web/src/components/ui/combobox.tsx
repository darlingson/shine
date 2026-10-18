import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { cn } from "cn"
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react"

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  "aria-label": string
}

function Combobox({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results.",
  disabled,
  className,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const items = React.useMemo(
    () =>
      ComboboxPrimitive.createItems(options, {
        getValue: (o) => o.value,
        getLabel: (o) => o.label,
      }),
    [options],
  )

  return (
    <ComboboxPrimitive.Root
      items={items}
      value={value === "" ? null : value}
      onValueChange={(v) => onValueChange((v as string | null) ?? "")}
      disabled={disabled}
    >
      <ComboboxPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
      >
        <ComboboxPrimitive.Value placeholder={placeholder} />
        <ComboboxPrimitive.Icon>
          <CaretUpDownIcon className="size-4 text-muted-foreground" />
        </ComboboxPrimitive.Icon>
      </ComboboxPrimitive.Trigger>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          className="isolate z-50"
          sideOffset={4}
          align="start"
        >
          <ComboboxPrimitive.Popup
            data-slot="combobox-content"
            className={cn(
              "dark relative z-50 w-[26rem] min-w-(--anchor-width) max-w-[calc(100vw-2rem)] origin-(--transform-origin) overflow-hidden rounded-lg text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 bg-popover before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150"
            )}
          >
            <div className="border-b border-border p-1">
              <ComboboxPrimitive.Input
                placeholder={searchPlaceholder}
                className="w-full rounded-md bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ComboboxPrimitive.Empty className="px-3 py-4 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="max-h-64 overflow-x-hidden overflow-y-auto p-1">
              {(item: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item.value}
                  className="relative flex w-full cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  <span className="truncate">{item.label}</span>
                  <ComboboxPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}

export { Combobox }
