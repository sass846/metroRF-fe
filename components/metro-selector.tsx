"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { fetchMetros } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function MetroSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (metroId: string, metroName: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { data: metros = [], isLoading } = useSWR("metros", fetchMetros)

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Set default metro if none selected and metros are loaded
  useEffect(() => {
    if (!value && metros.length > 0) {
      onChange(metros[0].id.toString(), metros[0].name)
    }
  }, [metros, value, onChange])

  const selectedMetro = metros.find((m) => m.id.toString() === value)

  return (
    <div className="grid gap-2" ref={containerRef}>
      <label className="text-sm font-medium">Metro System</label>
      <div className="relative">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
          onClick={() => setOpen(!open)}
          disabled={isLoading}
        >
          {isLoading ? (
            "Loading metros..."
          ) : selectedMetro ? (
            <span className="truncate">
              {selectedMetro.name} - {selectedMetro.city}
            </span>
          ) : (
            "Select metro system..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        {open && metros.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <ul className="py-1 max-h-60 overflow-auto">
              {metros.map((metro) => (
                <li key={metro.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                      selectedMetro?.id === metro.id && "bg-accent",
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onChange(metro.id.toString(), metro.name)
                      setOpen(false)
                    }}
                  >
                    <div>
                      <div className="font-medium">{metro.name}</div>
                      <div className="text-xs text-muted-foreground">{metro.city}</div>
                    </div>
                    {selectedMetro?.id === metro.id && <Check className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
