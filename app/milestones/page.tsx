'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Target, CheckCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface Activity {
  id: string
  name: string
  targetMinutes: number
  icon: string
  timeLogs: { minutes: number }[]
}

interface Milestone {
  minutes: number
  name: string
  description: string
  icon: string
}

const MILESTONES: Milestone[] = [
  { minutes: 30, name: 'First Steps', description: 'Started your journey', icon: '🌱' },
  { minutes: 60, name: 'Building Momentum', description: 'One hour completed', icon: '⚡' },
  { minutes: 120, name: 'Consistency', description: 'Two hours of practice', icon: '🔥' },
  { minutes: 300, name: 'Dedication', description: 'Five hours milestone', icon: '💪' },
  { minutes: 600, name: 'Commitment', description: 'Ten hours achieved', icon: '🎯' },
  { minutes: 900, name: 'Excellence', description: 'Fifteen hours mastered', icon: '⭐' },
  { minutes: 1260, name: 'Master', description: 'Twenty-one hours completed', icon: '👑' }
]

export default function MilestonesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

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

  const getActivityMilestones = (activity: Activity) => {
    const totalMinutes = activity.timeLogs.reduce((sum, log) => sum + log.minutes, 0)
    return MILESTONES.map(milestone => ({
      ...milestone,
      completed: totalMinutes >= milestone.minutes,
      progress: Math.min((totalMinutes / milestone.minutes) * 100, 100)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ArrowLeft className="w-5 h-5 dark:text-white" />
            </Link>
            <h1 className="text-2xl font-bold dark:text-white">Milestones</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No activities yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create activities to start tracking milestones
            </p>
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {activities.map(activity => {
              const totalMinutes = activity.timeLogs.reduce((sum, log) => sum + log.minutes, 0)
              const milestones = getActivityMilestones(activity)
              const completedCount = milestones.filter(m => m.completed).length

              return (
                <div key={activity.id} className="card">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{activity.icon}</span>
                    <div>
                      <h2 className="text-xl font-semibold dark:text-white">{activity.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {totalMinutes} minutes • {completedCount}/{milestones.length} milestones
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {milestones.map(milestone => (
                      <div
                        key={milestone.minutes}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          milestone.completed
                            ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{milestone.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${
                                milestone.completed ? 'text-green-700 dark:text-green-300' : 'dark:text-white'
                              }`}>
                                {milestone.name}
                              </h3>
                              {milestone.completed && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <p className={`text-sm ${
                              milestone.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="dark:text-gray-300">{milestone.minutes} minutes</span>
                            <span className={milestone.completed ? 'text-green-600 dark:text-green-400' : 'dark:text-gray-400'}>
                              {milestone.progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                milestone.completed ? 'bg-green-500' : 'bg-primary-500'
                              }`}
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}