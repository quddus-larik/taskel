import { useEffect, useState } from "react"
import axios from "axios"
import { CheckCircle, Clock, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ChartPieDonutActive } from "@/components/charts/ChartPieDonutActive" // ✅ Chart

// Define types
interface Member {
  id: number
  name: string
  email: string
  role: string
}

interface Stats {
  completedTasks: number
  pendingTasks: number
  totalMembers: number
  members: Member[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    completedTasks: 0,
    pendingTasks: 0,
    totalMembers: 0,
    members: [],
  })

  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    async function fetchStats() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/teams/stats/${user?.id}`,
          { withCredentials: true }
        )
        setStats(res.data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    fetchStats()
  }, [user])

  // ✅ Dynamic chart data
  const chartData = [
    {
      browser: "completed",
      visitors: stats.completedTasks,
      fill: "var(--color-completed)",
    },
    {
      browser: "pending",
      visitors: stats.pendingTasks,
      fill: "var(--color-pending)",
    },
  ]

  // ✅ Chart config
  const chartConfig = {
    visitors: {
      label: "Tasks",
    },
    completed: {
      label: "Completed",
      color: "var(--chart-1)",
    },
    pending: {
      label: "Pending",
      color: "var(--chart-2)",
    },
  }

  // ✅ Card Data
  const cardData = [
    {
      title: "Tasks Completed",
      value: stats.completedTasks,
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Tasks Pending",
      value: stats.pendingTasks,
      icon: <Clock className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: <Users className="w-8 h-8 text-blue-500" />,
    },
  ]

  return (
    <>
      {/* Stat Cards */}
      <div className="grid auto-rows-min gap-6 md:grid-cols-3">
        {cardData.map((card) => (
          <div
            key={card.title}
            className="bg-muted/50 aspect-video rounded-xl flex flex-col items-center justify-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="mb-4">{card.icon}</div>
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="text-4xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="mt-6">
        <ChartPieDonutActive
          title="Task Status Overview"
          description="Your team task distribution"
          data={chartData}
          config={chartConfig}
          activeIndex={0}
          stats={cardData} // Send same card data to chart for consistency
        />
      </div>

      {/* Members List */}
      <div className="mt-8 bg-muted/40 rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Team Members</h2>
        {stats.members.length === 0 ? (
          <p className="text-gray-500">No members found</p>
        ) : (
          <ul className="space-y-3">
            {stats.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  {member.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
