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
        .select("full_name, room_number")
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Room Number</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-muted-foreground">
              No sick challengers at the moment
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.room_number}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.room_number}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
