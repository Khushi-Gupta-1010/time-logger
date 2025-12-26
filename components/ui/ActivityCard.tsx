'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Trash2, Plus, Clock } from 'lucide-react'
import { Timer } from './Timer'
import { ProgressBar } from './ProgressBar'
import { Modal } from './Modal'
import { UndoToast } from './UndoToast'
import { calculateStreak, getNextMilestone } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Activity {
  id: string
  name: string
  targetMinutes: number
  color: string
  icon: string
  timeLogs: { id?: string; minutes: number; createdAt: Date }[]
}

interface ActivityCardProps {
  activity: Activity
  onUpdate: () => void
  activeTimer: string | null
  onTimerStart: (activityId: string) => void
  onTimerStop: () => void
}

export function ActivityCard({ 
  activity, 
  onUpdate, 
  activeTimer, 
  onTimerStart, 
  onTimerStop 
}: ActivityCardProps) {
  const [showManualLog, setShowManualLog] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [manualMinutes, setManualMinutes] = useState('')
  const [manualNote, setManualNote] = useState('')
  const [editName, setEditName] = useState(activity.name)
  const [editTarget, setEditTarget] = useState(activity.targetMinutes.toString())
  const [lastLogId, setLastLogId] = useState<string | null>(null)

  const totalMinutes = activity.timeLogs.reduce((sum, log) => sum + log.minutes, 0)
  const streak = calculateStreak(activity.timeLogs)
  const nextMilestone = getNextMilestone(totalMinutes, activity.targetMinutes)
  const progress = (totalMinutes / activity.targetMinutes) * 100

  const logTime = async (minutes: number, source: string, note?: string) => {
    try {
      const res = await fetch('/api/time-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity.id,
          minutes,
          note,
          source
        })
      })

      if (res.ok) {
        const newLog = await res.json()
        setLastLogId(newLog.id)
        onUpdate()
        
        // Check for milestone
        const newTotal = totalMinutes + minutes
        if (newTotal >= nextMilestone && totalMinutes < nextMilestone) {
          toast.success(`🎉 Milestone reached: ${nextMilestone} minutes!`)
        }
        
        // Auto-hide undo after 5 seconds
        setTimeout(() => setLastLogId(null), 5000)
      } else {
        toast.error('Failed to log time')
      }
    } catch (error) {
      toast.error('Failed to log time')
    }
  }

  const handleQuickAdd = (minutes: number) => {
    logTime(minutes, 'QUICK_ADD')
  }

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault()
    const minutes = parseInt(manualMinutes)
    if (minutes > 0) {
      await logTime(minutes, 'MANUAL', manualNote || undefined)
      setManualMinutes('')
      setManualNote('')
      setShowManualLog(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          targetMinutes: parseInt(editTarget)
        })
      })

      if (res.ok) {
        onUpdate()
        setShowEdit(false)
        toast.success('Activity updated')
      } else {
        toast.error('Failed to update activity')
      }
    } catch (error) {
      toast.error('Failed to update activity')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        onUpdate()
        toast.success('Activity deleted')
      } else {
        toast.error('Failed to delete activity')
      }
    } catch (error) {
      toast.error('Failed to delete activity')
    }
  }

  return (
    <>
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activity.icon}</span>
            <div>
              <Link 
                href={`/activity/${activity.id}`}
                className="text-lg font-semibold hover:text-primary-600"
              >
                {activity.name}
              </Link>
              <div className="text-sm text-gray-500">
                {totalMinutes}/{activity.targetMinutes} min • {streak} day streak
              </div>
            </div>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-1 hover:bg-gray-100 rounded text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ProgressBar current={totalMinutes} target={activity.targetMinutes} className="mb-4" />

        <div className="flex items-center justify-between mb-4">
          <Timer
            activityId={activity.id}
            activityName={activity.name}
            onSave={(minutes) => logTime(minutes, 'TIMER')}
            isActive={activeTimer === activity.id}
            onStart={() => onTimerStart(activity.id)}
            onStop={onTimerStop}
          />
          
          <div className="text-sm text-gray-500">
            Next: {nextMilestone} min
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleQuickAdd(1)}
            className="btn btn-secondary text-sm"
          >
            +1
          </button>
          <button
            onClick={() => handleQuickAdd(5)}
            className="btn btn-secondary text-sm"
          >
            +5
          </button>
          <button
            onClick={() => handleQuickAdd(10)}
            className="btn btn-secondary text-sm"
          >
            +10
          </button>
          <button
            onClick={() => handleQuickAdd(25)}
            className="btn btn-secondary text-sm"
          >
            +25
          </button>
          <button
            onClick={() => setShowManualLog(true)}
            className="btn btn-secondary text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Log
          </button>
        </div>
      </div>

      <Modal
        isOpen={showManualLog}
        onClose={() => setShowManualLog(false)}
        title="Log Practice Time"
      >
        <form onSubmit={handleManualLog} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Minutes</label>
            <input
              type="number"
              min="1"
              required
              className="input"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowManualLog(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Activity"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              className="input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Minutes</label>
            <input
              type="number"
              min="1"
              required
              className="input"
              value={editTarget}
              onChange={(e) => setEditTarget(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Activity"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete "{activity.name}"? This will also delete all associated time logs.</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      
      {lastLogId && (
        <UndoToast
          logId={lastLogId}
          minutes={5}
          activityName={activity.name}
          onUndo={() => {
            setLastLogId(null)
            onUpdate()
          }}
        />
      )}
    </>
  )
}