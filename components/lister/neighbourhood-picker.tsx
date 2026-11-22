"use client"

import * as React from "react"
import {
  Check,
  ChevronsUpDown,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocations, useLocationSearch } from "@/features/catalog/hooks"
import { getApiErrorMessage } from "@/lib/api/client"
import { catalogApi, type Location } from "@/lib/api/catalog"
import { queryKeys } from "@/lib/query/keys"
import { cn } from "@/lib/utils"

const same = (a: string, b: string) =>
  a.localeCompare(b, "en", { sensitivity: "base" }) === 0

/**
 * Pick a neighbourhood inside the chosen LGA: browse the list, search, or add a
 * missing one. A map pin can suggest the neighbourhood it sits in.
 */
type MapPlace = { id: string; name: string; label: string }

/** Places Mapbox knows inside one LGA, for when our own list has no match. */
function useMapPlaces(term: string, lgaName?: string, stateName?: string) {
  const q = term.trim()
  return useQuery({
    queryKey: ["geo", "places", lgaName, stateName, q],
    enabled: q.length >= 3 && Boolean(lgaName),
    staleTime: 60 * 60_000,
    queryFn: async (): Promise<MapPlace[]> => {
      const res = await fetch(
        `/api/geo/search?scope=place&q=${encodeURIComponent(
          [q, lgaName, stateName].filter(Boolean).join(", ")
        )}`
      )
      const data = (await res.json()) as { results?: MapPlace[] }
      // Keep only places in the same state, so a name from another state never sneaks in.
      const state = (stateName ?? "").toLowerCase().replace(/\s+state$/, "")
      // Mapbox falls back to the LGA or state when it can't find the name: drop those.
      const stem = q.toLowerCase().slice(0, Math.min(4, q.length))
      return (data.results ?? []).filter(
        (r) =>
          r.name.toLowerCase().includes(stem) &&
          (!state || r.label.toLowerCase().includes(state))
      )
    },
  })
}

export function NeighbourhoodPicker({
  lgaId,
  lgaName,
  stateName,
  value,
  onChange,
  suggestion,
  disabled,
}: {
  lgaId?: string
  lgaName?: string
  stateName?: string
  value: string
  onChange: (areaId: string) => void
  /** Neighbourhood name read from the pin on the map. */
  suggestion?: string
  disabled?: boolean
}) {
  const queryClient = useQueryClient()
  const list = useLocations(lgaId, Boolean(lgaId))
  const [open, setOpen] = React.useState(false)
  const [term, setTerm] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [adding, setAdding] = React.useState(false)
  const [picked, setPicked] = React.useState<Location | null>(null)

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(term), 300)
    return () => window.clearTimeout(t)
  }, [term])

  const search = useLocationSearch(debounced, lgaId)
  const listed = Array.isArray(list.data) ? list.data : []
  const current =
    listed.find((a) => a.id === value) ??
    (picked && picked.id === value ? picked : undefined)
  const q = term.trim()
  const mapPlaces = useMapPlaces(debounced, lgaName, stateName)
  const found = Array.isArray(search.data) ? search.data : []
  const results: Location[] = q.length >= 2 ? found : listed
  const exact = [...results, ...listed].some((r) => same(r.name, q))
  // Typing the LGA or state itself is a common slip: it isn't a neighbourhood.
  const isArea =
    q.length >= 2 &&
    (same(q, lgaName ?? "") ||
      same(q, (stateName ?? "").replace(/\s+state$/i, "")))
  // Map suggestions: not already listed, not the LGA itself, no repeats.
  const seen = new Set([...results, ...listed].map((r) => r.name.toLowerCase()))
  const onMap = (mapPlaces.data ?? []).filter((p) => {
    const key = p.name.toLowerCase()
    if (!p.name || seen.has(key) || key === (lgaName ?? "").toLowerCase())
      return false
    seen.add(key)
    return true
  })
  const searching = q.length >= 2 && (search.isFetching || debounced !== term)

  async function resolve(name: string) {
    if (!lgaId) return
    setAdding(true)
    try {
      const made = await catalogApi.createNeighbourhood({
        name,
        parentId: lgaId,
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.catalog.locations(lgaId),
      })
      setPicked(made)
      onChange(made.id)
      setOpen(false)
      setTerm("")
      toast.success(
        made.created ? `Added ${made.name}` : `${made.name} was already listed`,
        {
          description: made.created
            ? `Now in ${lgaName ?? "this area"}.`
            : "Selected it for you.",
        }
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't add that neighbourhood."))
    } finally {
      setAdding(false)
    }
  }

  const choose = (a: Location) => {
    setPicked(a)
    onChange(a.id)
    setOpen(false)
    setTerm("")
  }

  const showSuggestion =
    Boolean(suggestion) &&
    !same(suggestion ?? "", lgaName ?? "") &&
    !value &&
    Boolean(lgaId) &&
    !disabled
  const placeholder = !lgaId
    ? "Choose an area first"
    : list.isLoading
      ? "Loading…"
      : "Search or add (optional)"

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls="neighbourhood-list"
            aria-label="Neighbourhood"
            disabled={disabled || !lgaId}
            className={cn(
              "flex h-12 w-full items-center gap-2 rounded-lg border border-input bg-secondary/60 px-4 text-left text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-input/30",
              !current && "text-muted-foreground"
            )}
          >
            <span className="min-w-0 flex-1 truncate">
              {current?.name ?? placeholder}
            </span>
            {adding ? (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : (
              <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) min-w-64 gap-1 p-2"
        >
          <InputGroup className="h-10 rounded-lg bg-background">
            <InputGroupAddon align="inline-start" className="pl-3">
              {searching ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <MapPin className="size-4 text-muted-foreground" />
              )}
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={`Search in ${lgaName ?? "this area"}`}
              aria-label="Search neighbourhoods"
              maxLength={80}
              className="h-full text-sm md:text-sm"
            />
          </InputGroup>
          <Command
            id="neighbourhood-list"
            shouldFilter={false}
            className="bg-transparent p-0"
          >
            <CommandList>
              <CommandEmpty className="px-3 py-4 text-center text-xs text-muted-foreground">
                {isArea
                  ? "Nothing listed under this name."
                  : q.length >= 2
                    ? searching
                      ? "Searching…"
                      : "No match. Add it below."
                    : "No neighbourhoods listed here yet. Type a name to add one."}
              </CommandEmpty>
              {results.length ? (
                <CommandGroup
                  heading={
                    q.length >= 2
                      ? "Matches"
                      : `Listed in ${lgaName ?? "this area"}`
                  }
                >
                  {results.slice(0, 30).map((a) => (
                    <CommandItem
                      key={a.id}
                      value={a.id}
                      onSelect={() => choose(a)}
                      className="gap-2"
                    >
                      <span className="min-w-0 flex-1 truncate">{a.name}</span>
                      {a.id === value ? (
                        <Check className="size-4 text-primary" />
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {q.length >= 3 && onMap.length ? (
                <CommandGroup heading="Found on the map">
                  {onMap.slice(0, 5).map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`map-${p.id}`}
                      onSelect={() => void resolve(p.name)}
                      className="gap-2"
                    >
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{p.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {p.label}
                        </span>
                      </span>
                      <Plus className="size-3.5 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {isArea ? (
                <p className="mx-1 my-1 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
                  <strong className="text-foreground">{q}</strong> is the area
                  you&apos;ve already chosen. Type a district, estate or street
                  area inside it instead.
                </p>
              ) : null}
              {q.length >= 2 && !exact && !searching && !isArea ? (
                <CommandGroup>
                  <CommandItem
                    value={`add-${q}`}
                    onSelect={() => void resolve(q)}
                    className="gap-2 font-medium text-primary"
                  >
                    <Plus className="size-4" />
                    <span className="truncate">
                      Add &ldquo;{q}&rdquo; to {lgaName ?? "this area"}
                    </span>
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
          {value ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="justify-start text-muted-foreground"
              onClick={() => {
                onChange("")
                setPicked(null)
                setOpen(false)
              }}
            >
              Clear neighbourhood
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>

      {showSuggestion ? (
        <button
          type="button"
          onClick={() => void resolve(suggestion!)}
          disabled={adding}
          className="flex w-full items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-left text-xs text-primary transition-colors outline-none hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
        >
          <Sparkles className="size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            Your pin is in <strong>{suggestion}</strong>. Use it as the
            neighbourhood.
          </span>
          {adding ? <Loader2 className="size-3.5 animate-spin" /> : null}
        </button>
      ) : null}
    </div>
  )
}
