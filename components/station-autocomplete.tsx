"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import useSWR from "swr"
import { fetchRecommendations } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function useDebounced<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value)
  useMemo(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function StationAutocomplete({
  label,
  value,
  onChange,
  placeholder = "Type station name",
  metroId, // Add metroId prop to filter stations by metro
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  metroId?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const debounced = useDebounced(value, 250)

  const { data: options = [], isValidating } = useSWR(
    debounced && metroId ? ["/recommend", debounced, metroId] : null,
    () => fetchRecommendations(debounced, metroId),
    { keepPreviousData: true },
  )

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const showList = open && (isValidating || options.length > 0)

  return (
    <div className="grid gap-2" ref={containerRef}>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={showList}
          aria-controls={showList ? "station-suggestions" : undefined}
          disabled={!metroId}
        />
        {showList && (
          <div
            id="station-suggestions"
            role="listbox"
            aria-label="Station suggestions"
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
          >
            {!isValidating && options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No stations found.</div>
            ) : (
              <ul className="py-1 max-h-60 overflow-auto">
                {options.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={opt === value.toLowerCase()}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground capitalize",
                      )}
                      // Prevent blur-before-click by using mousedown
                      onMouseDown={(e) => {
                        e.preventDefault()
                        onChange(opt)
                        setOpen(false)
                      }}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
                {isValidating && <li className="px-3 py-2 text-sm text-muted-foreground">Loading...</li>}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
