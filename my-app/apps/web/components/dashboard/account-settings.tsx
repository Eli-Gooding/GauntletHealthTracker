"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers"
import { supabase } from "@/lib/supabase/client"
import { eventBus, EVENTS } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings } from "lucide-react"

export function AccountSettings() {
  const { session } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: session?.user?.user_metadata?.full_name || "",
    roomNumber: session?.user?.user_metadata?.room_number || "",
    lunchNote: session?.user?.user_metadata?.lunch_note || "",
    dinnerNote: session?.user?.user_metadata?.dinner_note || "",
    otherNote: session?.user?.user_metadata?.other_note || "",
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          room_number: formData.roomNumber,
          lunch_note: formData.lunchNote,
          dinner_note: formData.dinnerNote,
          other_note: formData.otherNote,
        }
      })

      if (updateError) throw updateError

      // Update users table
      const { error: profileError } = await supabase
        .from("users")
        .update({
          full_name: formData.fullName,
          room_number: formData.roomNumber,
          lunch_note: formData.lunchNote,
          dinner_note: formData.dinnerNote,
          other_note: formData.otherNote,
          lunch_note_updated_at: formData.lunchNote ? new Date().toISOString() : null,
          dinner_note_updated_at: formData.dinnerNote ? new Date().toISOString() : null,
          other_note_updated_at: formData.otherNote ? new Date().toISOString() : null,
        })
        .eq("id", session?.user?.id)

      if (profileError) throw profileError

      // Emit event to refresh all components
      eventBus.emit(EVENTS.HEALTH_STATUS_CHANGED)

      toast({
        variant: "success",
        title: "Settings updated",
        description: "Your account settings have been updated successfully.",
      })

      setOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              value={formData.roomNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lunchNote">Lunch Note</Label>
            <Input
              id="lunchNote"
              value={formData.lunchNote}
              onChange={(e) => setFormData(prev => ({ ...prev, lunchNote: e.target.value }))}
              placeholder="Any special requests for lunch?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dinnerNote">Dinner Note</Label>
            <Input
              id="dinnerNote"
              value={formData.dinnerNote}
              onChange={(e) => setFormData(prev => ({ ...prev, dinnerNote: e.target.value }))}
              placeholder="Any special requests for dinner?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otherNote">Other Note</Label>
            <Input
              id="otherNote"
              value={formData.otherNote}
              onChange={(e) => setFormData(prev => ({ ...prev, otherNote: e.target.value }))}
              placeholder="Any other notes or requests?"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
