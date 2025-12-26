'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Tag, Edit2, Trash2, Undo2 } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Modal } from '@/components/ui/Modal'
import { calculateStreak } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

interface TimeLog {
  id: string
  minutes: number
  note?: string
  source: string
  createdAt: string
}

interface Activity {
  id: string
  name: string
  targetMinutes: number
  color: string
  icon: string
  timeLogs: TimeLog[]
}

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null)
  const [editMinutes, setEditMinutes] = useState('')
  const [editNote, setEditNote] = useState('')
  const [deletingLog, setDeletingLog] = useState<TimeLog | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchActivity()
    }
  }, [session, params.id])

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activities')
      if (res.ok) {
        const activities = await res.json()
        const found = activities.find((a: Activity) => a.id === params.id)
        if (found) {
          setActivity(found)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || !activity) {
    return null
  }

  const totalMinutes = activity.timeLogs.reduce((sum, log) => sum + log.minutes, 0)
  const streak = calculateStreak(activity.timeLogs.map(log => ({ createdAt: new Date(log.createdAt) })))
  
  // Get last 7 days data for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const chartData = last7Days.map(date => {
    const dayLogs = activity.timeLogs.filter(log => {
      const logDate = new Date(log.createdAt)
      return logDate.toDateString() === date.toDateString()
    })
    const dayMinutes = dayLogs.reduce((sum, log) => sum + log.minutes, 0)
    
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: dayMinutes
    }
  })

  const recentLogs = activity.timeLogs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)

  const getSourceBadge = (source: string) => {
    const badges = {
      TIMER: 'bg-green-100 text-green-800',
      MANUAL: 'bg-blue-100 text-blue-800',
      QUICK_ADD: 'bg-purple-100 text-purple-800',
      FOCUS_5: 'bg-orange-100 text-orange-800'
    }
    return badges[source as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const handleEditLog = (log: TimeLog) => {
    setEditingLog(log)
    setEditMinutes(log.minutes.toString())
    setEditNote(log.note || '')
  }

  const handleUpdateLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLog) return

    try {
      const res = await fetch(`/api/time-logs/${editingLog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes: parseInt(editMinutes),
          note: editNote
        })
      })

      if (res.ok) {
        fetchActivity()
        setEditingLog(null)
        toast.success('Time log updated')
      } else {
        toast.error('Failed to update time log')
      }
    } catch (error) {
      toast.error('Failed to update time log')
    }
  }

  const handleDeleteLog = async () => {
    if (!deletingLog) return

    try {
      const res = await fetch(`/api/time-logs/${deletingLog.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchActivity()
        setDeletingLog(null)
        toast.success('Time log deleted')
      } else {
        toast.error('Failed to delete time log')
      }
    } catch (error) {
      toast.error('Failed to delete time log')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activity.icon}</span>
              <div>
                <h1 className="text-2xl font-bold">{activity.name}</h1>
                <div className="text-gray-600">
                  {totalMinutes}/{activity.targetMinutes} minutes • {streak} day streak
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Progress</h2>
              <ProgressBar current={totalMinutes} target={activity.targetMinutes} className="mb-4" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">{totalMinutes}</div>
                  <div className="text-sm text-gray-600">Total Minutes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{streak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((totalMinutes / activity.targetMinutes) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Last 7 Days</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Bar dataKey="minutes" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No sessions yet</p>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium dark:text-white">{log.minutes} min</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getSourceBadge(log.source)}`}>
                            {log.source.replace('_', ' ')}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{log.note}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleDateString()} at{' '}
                          {new Date(log.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEditLog(log)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Edit log"
                        >
                          <Edit2 className="w-3 h-3 text-blue-600" />
                        </button>
                        <button
                          onClick={() => setDeletingLog(log)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Delete log"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Log Modal */}
      <Modal
        isOpen={!!editingLog}
        onClose={() => setEditingLog(null)}
        title="Edit Time Log"
      >
        <form onSubmit={handleUpdateLog} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Minutes</label>
            <input
              type="number"
              min="1"
              required
              className="input"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Note (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Update
            </button>
            <button
              type="button"
              onClick={() => setEditingLog(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingLog}
        onClose={() => setDeletingLog(null)}
        title="Delete Time Log"
      >
        <div className="space-y-4">
          <p className="dark:text-white">
            Are you sure you want to delete this {deletingLog?.minutes} minute log?
            {deletingLog?.note && (
              <span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">
                Note: "{deletingLog.note}"
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteLog}
              className="btn btn-danger"
            >
              Delete
            </button>
            <button
              onClick={() => setDeletingLog(null)}
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