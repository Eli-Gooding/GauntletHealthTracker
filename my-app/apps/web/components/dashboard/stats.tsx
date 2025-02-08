interface StatsProps {
  stats: {
    currently_infected: number
    recovered: number
    never_infected: number
  }
}

export function DashboardStats({ stats }: StatsProps) {
  return (
    <>
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-lg font-medium">Currently Infected</h3>
        <p className="text-3xl font-bold mt-2">{stats.currently_infected}</p>
      </div>
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-lg font-medium">Recovered</h3>
        <p className="text-3xl font-bold mt-2">{stats.recovered}</p>
      </div>
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-lg font-medium">Never Infected</h3>
        <p className="text-3xl font-bold mt-2">{stats.never_infected}</p>
      </div>
    </>
  )
}
