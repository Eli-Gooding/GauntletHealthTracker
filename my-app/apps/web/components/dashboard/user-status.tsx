"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { eventBus, EVENTS } from "@/lib/events"

export function UserStatus() {
  const { session } = useAuth()
  const [healthStatus, setHealthStatus] = useState<string | null>(null)

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

  async function fetchHealthStatus() {
    console.log('[UserStatus] Fetching health status for user:', session?.user?.id)
    const { data, error } = await supabase
      .from("users")
      .select("health_status")
      .eq("id", session?.user?.id)
      .single()

    if (error) {
      console.error("[UserStatus] Error fetching health status:", error)
      return
    }

    console.log('[UserStatus] Setting health status to:', data.health_status)
    setHealthStatus(data.health_status)
  }

  if (!healthStatus) return null

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
