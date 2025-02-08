"use client"

import { useMemo, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { eventBus, EVENTS } from "@/lib/events"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"

interface InfectionEvent {
  event_timestamp: string
  status: "healthy" | "sick"
}

export function InfectionChart() {
  const [data, setData] = useState<InfectionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    console.log('[InfectionChart] Setting up component')

    // Initial fetch
    fetchInfectionEvents()

    // Subscribe to health status changes
    console.log('[InfectionChart] Subscribing to HEALTH_STATUS_CHANGED event')
    const unsubscribe = eventBus.subscribe(EVENTS.HEALTH_STATUS_CHANGED, () => {
      console.log('[InfectionChart] Received HEALTH_STATUS_CHANGED event')
      fetchInfectionEvents()
    })

    return () => {
      console.log('[InfectionChart] Cleaning up event subscription')
      unsubscribe()
    }
  }, [])

  async function fetchInfectionEvents() {
    console.log('[InfectionChart] Fetching infection events')
    try {
      const { data, error } = await supabase
        .from("infection_events")
        .select("event_timestamp, status")
        .order("event_timestamp", { ascending: true })

      if (error) {
        throw error
      }

      console.log('[InfectionChart] Setting infection events data:', data)
      setData(data || [])
    } catch (error) {
      console.error("[InfectionChart] Error fetching infection events:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = useMemo(() => {
    const dailyCases = new Map<string, number>()
    let currentSick = 0

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a.event_timestamp).getTime() - new Date(b.event_timestamp).getTime()
    )

    // Calculate running total of sick people
    sortedData.forEach((event) => {
      if (event.status === "sick") currentSick++
      else if (event.status === "healthy") currentSick--

      const date = format(parseISO(event.event_timestamp), "yyyy-MM-dd")
      dailyCases.set(date, currentSick)
    })

    return Array.from(dailyCases.entries()).map(([date, cases]) => ({
      date,
      activeCases: cases,
    }))
  }, [data])

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        Loading infection trend...
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={() => {
            console.log('[InfectionChart] Manual refresh clicked')
            setIsRefreshing(true)
            eventBus.emit(EVENTS.HEALTH_STATUS_CHANGED)
            // Reset the refreshing state after a short delay
            setTimeout(() => setIsRefreshing(false), 1000)
          }}
          disabled={isRefreshing}
          className={cn(
            "text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1",
            isRefreshing && "opacity-50 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "inline-block transition-transform duration-1000 ease-in-out",
              isRefreshing && "animate-spin"
            )}
          >
            ↻
          </span>
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), "MMM d")}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => format(parseISO(date as string), "MMM d, yyyy")}
            />
            <Line
              type="monotone"
              dataKey="activeCases"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
