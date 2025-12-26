'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, Clock, BarChart3, Trophy } from 'lucide-react'
import { ActivityCard } from '@/components/ui/ActivityCard'
import { Modal } from '@/components/ui/Modal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Activity {
  id: string
  name: string
  targetMinutes: number
  color: string
  icon: string
  timeLogs: { minutes: number; createdAt: Date }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateActivity, setShowCreateActivity] = useState(false)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [focusTimer, setFocusTimer] = useState(300) // 5 minutes
  const [focusRunning, setFocusRunning] = useState(false)
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [newActivityName, setNewActivityName] = useState('')
  const [newActivityTarget, setNewActivityTarget] = useState('1260')
  const [selectedActivityForFocus, setSelectedActivityForFocus] = useState('')

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

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (focusRunning && focusTimer > 0) {
      interval = setInterval(() => {
        setFocusTimer(t => t - 1)
      }, 1000)
    } else if (focusTimer === 0 && focusRunning) {
      handleFocusComplete()
    }
    return () => clearInterval(interval)
  }, [focusRunning, focusTimer])

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities')
      if (res.ok) {
        const data = await res.json()
        setActivities(data)
      }
    } catch (error) {
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newActivityName,
          targetMinutes: parseInt(newActivityTarget)
        })
      })

      if (res.ok) {
        fetchActivities()
        setNewActivityName('')
        setNewActivityTarget('1260')
        setShowCreateActivity(false)
        toast.success('Activity created!')
      } else {
        toast.error('Failed to create activity')
      }
    } catch (error) {
      toast.error('Failed to create activity')
    }
  }

  const handleFocusStart = () => {
    if (!selectedActivityForFocus) {
      toast.error('Please select an activity')
      return
    }
    setFocusRunning(true)
    setShowFocusMode(false)
  }

  const handleFocusComplete = async () => {
    setFocusRunning(false)
    setFocusTimer(300)
    
    if (selectedActivityForFocus) {
      try {
        const res = await fetch('/api/time-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId: selectedActivityForFocus,
            minutes: 5,
            source: 'FOCUS_5'
          })
        })

        if (res.ok) {
          fetchActivities()
          toast.success('🎉 5-minute focus session completed!')
        }
      } catch (error) {
        toast.error('Failed to log focus session')
      }
    }
    setSelectedActivityForFocus('')
  }

  const handleFocusCancel = () => {
    setFocusRunning(false)
    setFocusTimer(300)
    setSelectedActivityForFocus('')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const formatFocusTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300">
              {session.user?.email}
            </span>
            <ThemeToggle />
            <button
              onClick={() => signOut()}
              className="btn btn-secondary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2 dark:text-white">Your Activities</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your practice sessions and build lasting skills
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/analytics" className="btn btn-secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
            <Link href="/milestones" className="btn btn-secondary">
              <Trophy className="w-4 h-4 mr-2" />
              Milestones
            </Link>
            <button
              onClick={() => setShowFocusMode(true)}
              className="btn btn-secondary"
              disabled={focusRunning}
            >
              <Clock className="w-4 h-4 mr-2" />
              {focusRunning ? formatFocusTime(focusTimer) : '5 Min Focus'}
            </button>
            <button
              onClick={() => setShowCreateActivity(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Activity
            </button>
          </div>
        </div>

        {focusRunning && (
          <div className="card mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold dark:text-white">Focus Session Active</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFocusTime(focusTimer)} remaining
                  </div>
                </div>
              </div>
              <button
                onClick={handleFocusCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No activities yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first activity to start tracking your practice sessions
            </p>
            <button
              onClick={() => setShowCreateActivity(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Activity
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onUpdate={fetchActivities}
                activeTimer={activeTimer}
                onTimerStart={setActiveTimer}
                onTimerStop={() => setActiveTimer(null)}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={showCreateActivity}
        onClose={() => setShowCreateActivity(false)}
        title="Create New Activity"
      >
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Activity Name</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g., Guitar, DSA, Sketching"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Minutes</label>
            <input
              type="number"
              min="1"
              required
              className="input"
              value={newActivityTarget}
              onChange={(e) => setNewActivityTarget(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Default: 1260 minutes (21 hours)
            </p>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Create Activity
            </button>
            <button
              type="button"
              onClick={() => setShowCreateActivity(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        title="5-Minute Focus Session"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Choose an activity for your 5-minute focused practice session.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Activity</label>
            <select
              className="input"
              value={selectedActivityForFocus}
              onChange={(e) => setSelectedActivityForFocus(e.target.value)}
              required
            >
              <option value="">Select an activity</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFocusStart}
              className="btn btn-primary"
              disabled={!selectedActivityForFocus}
            >
              Start Focus Session
            </button>
            <button
              onClick={() => setShowFocusMode(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}