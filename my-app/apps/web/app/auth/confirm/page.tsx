"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link. Please check your email to complete your signup.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-sm text-muted-foreground">
              After confirming your email, you&apos;ll be able to sign in to your account.
            </div>
            <Link href="/login">
              <Button className="w-full" variant="outline">
                Return to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
