"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { eventBus, EVENTS } from "@/lib/events"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

interface User {
  full_name: string
  room_number: string
  lunch_note: string | null
  dinner_note: string | null
  other_note: string | null
  lunch_note_updated_at: string | null
  dinner_note_updated_at: string | null
  other_note_updated_at: string | null
}

export function FoodDeliveryList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[FoodDeliveryList] Setting up component')

    // Initial fetch
    fetchSickUsers()

    // Subscribe to health status changes
    console.log('[FoodDeliveryList] Subscribing to HEALTH_STATUS_CHANGED event')
    const unsubscribe = eventBus.subscribe(EVENTS.HEALTH_STATUS_CHANGED, () => {
      console.log('[FoodDeliveryList] Received HEALTH_STATUS_CHANGED event')
      fetchSickUsers()
    })

    return () => {
      console.log('[FoodDeliveryList] Cleaning up event subscription')
      unsubscribe()
    }
  }, [])

  async function fetchSickUsers() {
    console.log('[FoodDeliveryList] Fetching sick users')
    try {
      const { data, error } = await supabase
        .from("users")
        .select("full_name, room_number, lunch_note, dinner_note, other_note, lunch_note_updated_at, dinner_note_updated_at, other_note_updated_at")
        .eq("health_status", "sick")
        .order("room_number", { ascending: true })

      if (error) {
        throw error
      }

      console.log('[FoodDeliveryList] Setting users list:', data)
      setUsers(data || [])
    } catch (error) {
      console.error("[FoodDeliveryList] Error fetching sick users:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading food delivery list...
      </div>
    )
  }

  function formatLastUpdated(timestamp: string | null): string {
    if (!timestamp) return 'Not set';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Room Number</TableHead>
          <TableHead>Lunch Note</TableHead>
          <TableHead>Dinner Note</TableHead>
          <TableHead>Other Note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No sick challengers at the moment
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.room_number}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.room_number}</TableCell>
              <TableCell>
                {user.lunch_note && (
                  <div>
                    <div>{user.lunch_note}</div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {formatLastUpdated(user.lunch_note_updated_at)}
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {user.dinner_note && (
                  <div>
                    <div>{user.dinner_note}</div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {formatLastUpdated(user.dinner_note_updated_at)}
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {user.other_note && (
                  <div>
                    <div>{user.other_note}</div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {formatLastUpdated(user.other_note_updated_at)}
                    </div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
