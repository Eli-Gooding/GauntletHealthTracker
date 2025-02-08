"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { eventBus, EVENTS } from "@/lib/events"

export function UserStatus() {
  const { session } = useAuth()
  const [healthStatus, setHealthStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    console.log('[UserStatus] Setting up component for user:', session.user.id)

    // Initial fetch
    fetchHealthStatus()

    // Subscribe to health status changes
    console.log('[UserStatus] Subscribing to HEALTH_STATUS_CHANGED event')
    const unsubscribe = eventBus.subscribe(EVENTS.HEALTH_STATUS_CHANGED, () => {
      console.log('[UserStatus] Received HEALTH_STATUS_CHANGED event')
      fetchHealthStatus()
    })

    return () => {
      console.log('[UserStatus] Cleaning up event subscription')
      unsubscribe()
    }
  }, [session?.user?.id])

  async function createUserProfile() {
    if (!session?.user) return null

    console.log('[UserStatus] Creating user profile for:', session.user.id)
    const { error } = await supabase
      .from("users")
      .insert([
        {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata.full_name,
          room_number: session.user.user_metadata.room_number,
          health_status: "healthy"
        }
      ])

    if (error) {
      console.error("[UserStatus] Error creating user profile:", error)
      return null
    }

    return "healthy" // Return default health status
  }

  async function fetchHealthStatus() {
    if (!session?.user?.id) {
      console.log('[UserStatus] No user session, skipping fetch')
      return
    }

    if (!session?.user?.email_confirmed_at) {
      console.log('[UserStatus] User email not confirmed yet')
      setError('Please confirm your email to access the dashboard')
      return
    }

    try {
      console.log('[UserStatus] Fetching health status for user:', session.user.id)
      const { data, error } = await supabase
        .from("users")
        .select("health_status")
        .eq("id", session.user.id)
        .single()

      if (error?.code === "PGRST116") { // Record not found
        console.log('[UserStatus] User profile not found, creating one')
        const defaultStatus = await createUserProfile()
        if (defaultStatus) {
          setError(null)
          setHealthStatus(defaultStatus)
          return
        }
      } else if (error) {
        console.error("[UserStatus] Error fetching health status:", error)
        setError('Unable to fetch health status')
        return
      }

      if (!data) {
        console.error("[UserStatus] No health status data found")
        setError('No health status found')
        return
      }

      console.log('[UserStatus] Setting health status to:', data.health_status)
      setError(null)
      setHealthStatus(data.health_status)
    } catch (err) {
      console.error("[UserStatus] Unexpected error:", err)
      setError('An unexpected error occurred')
    }
  }

  if (error) {
    return (
      <div className="text-center text-sm text-red-500">
        {error}
      </div>
    )
  }

  if (!healthStatus) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Loading health status...
      </div>
    )
  }

  const statusColor = healthStatus === "healthy" ? "text-green-500" : "text-red-500"

  return (
    <div className="text-center text-sm text-muted-foreground">
      Your current health status:{" "}
      <span className={`font-semibold ${statusColor}`}>
        {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
      </span>
    </div>
  )
}
