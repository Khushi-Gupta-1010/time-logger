'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Clock, TrendingUp, Calendar } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from 'recharts'

interface Activity {
  id: string
  name: string
  targetMinutes: number
  icon: string
  color: string
  timeLogs: { minutes: number; createdAt: string }[]
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316']

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchActivities()
    }
  }, [session])

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities')
      if (res.ok) {
        const data = await res.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-lg dark:text-white">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date()
    const cutoff = new Date()
    
    if (timeRange === '7d') {
      cutoff.setDate(now.getDate() - 7)
    } else if (timeRange === '30d') {
      cutoff.setDate(now.getDate() - 30)
    } else {
      cutoff.setFullYear(2000) // All time
    }

    return activities.map(activity => ({
      ...activity,
      timeLogs: activity.timeLogs.filter(log => new Date(log.createdAt) >= cutoff)
    }))
  }

  const filteredActivities = getFilteredData()
  const totalMinutes = filteredActivities.reduce((sum, activity) => 
    sum + activity.timeLogs.reduce((actSum, log) => actSum + log.minutes, 0), 0
  )

  // Pie chart data
  const pieData = filteredActivities
    .map((activity, index) => {
      const minutes = activity.timeLogs.reduce((sum, log) => sum + log.minutes, 0)
      return {
        name: activity.name,
        value: minutes,
        color: COLORS[index % COLORS.length]
      }
    })
    .filter(item => item.value > 0)

  // Daily practice data for line chart
  const getDailyData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const dailyData = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayTotal = filteredActivities.reduce((sum, activity) => {
        const dayLogs = activity.timeLogs.filter(log => 
          log.createdAt.startsWith(dateStr)
        )
        return sum + dayLogs.reduce((logSum, log) => logSum + log.minutes, 0)
      }, 0)
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: dayTotal
      })
    }
    
    return dailyData
  }

  const dailyData = getDailyData()
  const avgDaily = totalMinutes / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ArrowLeft className="w-5 h-5 dark:text-white" />
            </Link>
            <h1 className="text-2xl font-bold dark:text-white">Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="input py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No data yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start logging practice time to see analytics
            </p>
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
              <div className="card text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <div className="text-2xl font-bold dark:text-white">{totalMinutes}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Minutes</div>
              </div>
              <div className="card text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold dark:text-white">{avgDaily.toFixed(1)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg/Day</div>
              </div>
              <div className="card text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold dark:text-white">{activities.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Activities</div>
              </div>
              <div className="card text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold dark:text-white">
                  {dailyData.filter(d => d.minutes > 0).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Days</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Daily Practice Trend */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Daily Practice Trend</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <XAxis dataKey="date" className="dark:text-gray-300" />
                      <YAxis className="dark:text-gray-300" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Distribution */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Time Distribution</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Activity Breakdown</h2>
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => {
                  const minutes = activity.timeLogs.reduce((sum, log) => sum + log.minutes, 0)
                  const percentage = totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0
                  
                  return (
                    <div key={activity.id} className="flex items-center gap-4">
                      <span className="text-2xl">{activity.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium dark:text-white">{activity.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {minutes} min ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}