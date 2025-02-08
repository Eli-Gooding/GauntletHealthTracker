"use client"

import { useAuth } from "@/components/providers"

export function Metrics() {
  const { healthStats } = useAuth()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Currently Infected</h3>
        </div>
        <div className="text-2xl font-bold">{healthStats.currentlyInfected}</div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Recovered</h3>
        </div>
        <div className="text-2xl font-bold">{healthStats.recovered}</div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Never Infected</h3>
        </div>
        <div className="text-2xl font-bold">{healthStats.neverInfected}</div>
      </div>
    </div>
  )
}
