"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useToast } from "../ui/use-toast"

export function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const roomNumber = formData.get("roomNumber") as string


    
    try {
      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            room_number: roomNumber,
          },
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user?.id) {
        throw new Error("No user ID returned from signup")
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            room_number: roomNumber,
            health_status: "healthy"
          }
        ])

      if (profileError) {
        console.error("Failed to create profile:", profileError)
        // Continue anyway - the profile will be created on first login if it doesn't exist
      }

      // Automatically sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      // Show success message and redirect to dashboard
      toast({
        title: "Welcome!",
        description: "Your account has been created and you're now signed in.",
      })
      router.push("/dashboard")

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred during signup",
      })
      setIsLoading(false)
      return
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roomNumber">Room Number</Label>
        <Input
          id="roomNumber"
          name="roomNumber"
          type="text"
          placeholder="101"
          required
        />
      </div>

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
