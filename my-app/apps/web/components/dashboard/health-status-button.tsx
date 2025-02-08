"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { eventBus, EVENTS } from "@/lib/events"
import { Button } from "../ui/button"

interface HealthStatusButtonProps {
  userId: string
}

export function HealthStatusButton({ userId }: HealthStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchCurrentStatus()
  }, [userId])

  async function fetchCurrentStatus() {
    const { data: user, error } = await supabase
      .from("users")
      .select("health_status")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching status:", error)
      return
    }

    if (user) {
      setCurrentStatus(user.health_status)
    }
  }

  async function toggleHealthStatus() {
    try {
      setIsLoading(true)
      setError(null)

      if (!currentStatus) {
        throw new Error("Current status not loaded")
      }

      const newStatus = currentStatus === "healthy" ? "sick" : "healthy"
      console.log('[HealthStatusButton] Toggling status to:', newStatus)

      // Update user status
      const { error: updateError } = await supabase
        .from("users")
        .update({ health_status: newStatus })
        .eq("id", userId)

      if (updateError) {
        throw updateError
      }

      console.log('[HealthStatusButton] Successfully updated status in database')

      // Record the event
      const { error: eventError } = await supabase
        .from("infection_events")
        .insert([
          {
            user_id: userId,
            status: newStatus,
          },
        ])

      if (eventError) {
        console.error("Error recording event:", eventError)
        // Don't throw here as this is not critical
      } else {
        console.log('[HealthStatusButton] Successfully recorded event in database')
      }

      // Update local state and notify all components
      console.log('[HealthStatusButton] Emitting HEALTH_STATUS_CHANGED event')
      setCurrentStatus(newStatus)
      eventBus.emit(EVENTS.HEALTH_STATUS_CHANGED)
      console.log('[HealthStatusButton] Event emitted')
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error updating health status:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentStatus) {
    return (
      <Button size="lg" disabled className="shadow-lg">
        Loading...
      </Button>
    )
  }

  const buttonText = currentStatus === "healthy" ? "Mark as Sick" : "Mark as Healthy"
  const buttonVariant = currentStatus === "healthy" ? "destructive" : "default"

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        variant={buttonVariant}
        onClick={toggleHealthStatus}
        disabled={isLoading}
        className="shadow-lg"
      >
        {isLoading ? "Updating..." : buttonText}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
