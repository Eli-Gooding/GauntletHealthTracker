"use client"

import { useAuth } from "@/components/providers"
import { Metrics } from "@/components/dashboard/metrics"
import { InfectionChart } from "@/components/dashboard/infection-chart"
import { FoodDeliveryList } from "@/components/dashboard/food-delivery-list"
import { HealthStatusButton } from "@/components/dashboard/health-status-button"
import { UserStatus } from "@/components/dashboard/user-status"
import { AccountSettings } from "@/components/dashboard/account-settings"

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Health Status Dashboard</h1>
      
      <Metrics />

      <div className="bg-card rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Infection Trend</h2>
        <InfectionChart />
      </div>

      <div className="bg-card rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Food Delivery List</h2>
        <FoodDeliveryList />
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-2">
        <HealthStatusButton userId={session.user.id} />
        <UserStatus />
      </div>
      <div className="fixed bottom-8 left-8">
        <AccountSettings />
      </div>
    </div>
  )
}
