"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { eventBus, EVENTS } from "@/lib/events"

interface HealthStats {
  currentlyInfected: number
  recovered: number
  neverInfected: number
}

interface AuthContextType {
  session: any
  loading: boolean
  healthStats: HealthStats
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  healthStats: {
    currentlyInfected: 0,
    recovered: 0,
    neverInfected: 0,
  },
})

export const useAuth = () => {
  return useContext(AuthContext)
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [healthStats, setHealthStats] = useState<HealthStats>({
    currentlyInfected: 0,
    recovered: 0,
    neverInfected: 0,
  })

  async function fetchHealthStats() {
    console.log('[AuthProvider] Fetching health stats')
    const { data, error } = await supabase
      .from("dashboard_stats")
      .select("*")
      .single()

    if (error) {
      console.error("[AuthProvider] Error fetching health stats:", error)
      return
    }

    console.log('[AuthProvider] Setting health stats:', data)
    setHealthStats({
      currentlyInfected: data.currently_infected,
      recovered: data.recovered,
      neverInfected: data.never_infected,
    })
  }

  useEffect(() => {
    console.log('[AuthProvider] Setting up component')

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthProvider] Initial session:', session)
      setSession(session)
      setLoading(false)
      if (!session) {
        router.push("/login")
      }
    })

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthProvider] Auth state changed:', event)
      setSession(session)
      setLoading(false)
      if (event === "SIGNED_OUT") {
        router.push("/login")
      }
    })

    // Subscribe to health status changes
    console.log('[AuthProvider] Subscribing to HEALTH_STATUS_CHANGED event')
    const unsubscribe = eventBus.subscribe(EVENTS.HEALTH_STATUS_CHANGED, () => {
      console.log('[AuthProvider] Received HEALTH_STATUS_CHANGED event')
      fetchHealthStats()
    })

    // Initial fetch of stats
    fetchHealthStats()

    return () => {
      console.log('[AuthProvider] Cleaning up subscriptions')
      authSubscription.unsubscribe()
      unsubscribe()
    }
  }, [router])

  return (
    <AuthContext.Provider value={{ session, loading, healthStats }}>
      {children}
    </AuthContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <AuthProvider>{children}</AuthProvider>
    </NextThemesProvider>
  )
}
