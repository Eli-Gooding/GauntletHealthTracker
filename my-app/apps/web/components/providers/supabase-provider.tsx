"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { RealtimeChannel } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"

interface SupabaseContextType {
  healthStats: {
    currentlyInfected: number
    recovered: number
    neverInfected: number
  }
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [healthStats, setHealthStats] = useState({
    currentlyInfected: 0,
    recovered: 0,
    neverInfected: 0,
  })

  useEffect(() => {
    // Initial fetch of stats
    fetchHealthStats()

    // Subscribe to changes in users table
    const usersChannel = supabase
      .channel("users-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        () => {
          fetchHealthStats()
        }
      )
      .subscribe()

    // Subscribe to changes in infection_events table
    const eventsChannel = supabase
      .channel("events-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "infection_events",
        },
        () => {
          fetchHealthStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(eventsChannel)
    }
  }, [])

  async function fetchHealthStats() {
    const { data, error } = await supabase
      .from("dashboard_stats")
      .select("*")
      .single()

    if (error) {
      console.error("Error fetching health stats:", error)
      return
    }

    setHealthStats({
      currentlyInfected: data.currently_infected,
      recovered: data.recovered,
      neverInfected: data.never_infected,
    })
  }

  return (
    <SupabaseContext.Provider
      value={{
        healthStats,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
