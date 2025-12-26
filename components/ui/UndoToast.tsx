'use client'

import { useState, useEffect } from 'react'
import { Undo2, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface UndoToastProps {
  logId: string
  minutes: number
  activityName: string
  onUndo: () => void
}

export function UndoToast({ logId, minutes, activityName, onUndo }: UndoToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000) // Auto-hide after 5 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleUndo = async () => {
    try {
      const res = await fetch(`/api/time-logs/${logId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        onUndo()
        toast.success('Time log undone')
        setVisible(false)
      } else {
        toast.error('Failed to undo')
      }
    } catch (error) {
      toast.error('Failed to undo')
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
      <div className="flex-1">
        <div className="text-sm font-medium dark:text-white">
          Added {minutes} min to {activityName}
        </div>
      </div>
      <button
        onClick={handleUndo}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <Undo2 className="w-4 h-4" />
        Undo
      </button>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}