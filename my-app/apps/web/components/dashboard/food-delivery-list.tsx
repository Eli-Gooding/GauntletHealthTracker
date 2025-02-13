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
  id: string
  full_name: string
  room_number: string
  lunch_note: string | null
  dinner_note: string | null
  other_note: string | null
  lunch_note_updated_at: string | null
  dinner_note_updated_at: string | null
  other_note_updated_at: string | null
  food_packed: boolean
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
    const healthStatusUnsubscribe = eventBus.subscribe(EVENTS.HEALTH_STATUS_CHANGED, () => {
      console.log('[FoodDeliveryList] Received HEALTH_STATUS_CHANGED event')
      fetchSickUsers()
    })

    // Subscribe to real-time food packed changes
    const foodPackedSubscription = supabase
      .channel('food-packed-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload: any) => {
          console.log('[FoodDeliveryList] Received food packed update:', payload)
          // Only update if the changed field includes food_packed
          if ('food_packed' in payload.new) {
            setUsers(users => users.map(user => 
              user.id === payload.new.id 
                ? { ...user, food_packed: payload.new.food_packed }
                : user
            ))
          }
        }
      )
      .subscribe()

    return () => {
      console.log('[FoodDeliveryList] Cleaning up subscriptions')
      healthStatusUnsubscribe()
      foodPackedSubscription.unsubscribe()
    }
  }, [])

  async function fetchSickUsers() {
    console.log('[FoodDeliveryList] Fetching sick users')
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, room_number, lunch_note, dinner_note, other_note, lunch_note_updated_at, dinner_note_updated_at, other_note_updated_at, food_packed")
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

  const toggleFoodPacked = async (userId: string, currentValue: boolean) => {
    try {
      // Update local state immediately for better UX
      setUsers(users => users.map(user => 
        user.id === userId 
          ? { ...user, food_packed: !currentValue }
          : user
      ))

      const { error } = await supabase
        .from('users')
        .update({ food_packed: !currentValue })
        .eq('id', userId)

      if (error) {
        // Revert local state if server update fails
        setUsers(users => users.map(user => 
          user.id === userId 
            ? { ...user, food_packed: currentValue }
            : user
        ))
        throw error
      }
    } catch (error) {
      console.error('[FoodDeliveryList] Error toggling food packed:', error)
    }
  }

  const resetAllFoodPacked = async () => {
    try {
      console.log('[FoodDeliveryList] Resetting all food packed statuses')
      const { data, error } = await supabase
        .rpc('reset_food_packed')

      console.log('[FoodDeliveryList] Reset response:', { data, error })

      if (error) {
        console.error('[FoodDeliveryList] Error from RPC:', error)
        throw error
      }

      // After successful reset, fetch the latest state
      await fetchSickUsers()
    } catch (error) {
      console.error('[FoodDeliveryList] Error resetting food packed:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={resetAllFoodPacked}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset All Packed Status</span>
        </button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Food Packed</TableHead>
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
            <TableRow key={user.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={user.food_packed}
                  onChange={() => toggleFoodPacked(user.id, user.food_packed)}
                  className="h-4 w-4"
                />
              </TableCell>
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
    </div>
  )
}
