'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface TimerProps {
  activityId: string
  activityName: string
  onSave: (minutes: number) => void
  isActive: boolean
  onStart: () => void
  onStop: () => void
}

export function Timer({ activityId, activityName, onSave, isActive, onStart, onStop }: TimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRunning && isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isActive])

  const handleStart = () => {
    if (!isActive) {
      onStart()
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    onStop()
    
    if (seconds > 0) {
      const minutes = Math.round(seconds / 60)
      if (minutes > 0) {
        onSave(minutes)
        toast.success(`Saved ${minutes} minute${minutes > 1 ? 's' : ''} to ${activityName}`)
      }
    }
    
    setSeconds(0)
  }

  const canStart = !isActive || (isActive && activityId === activityId)

  return (
    <div className="flex items-center gap-2">
      <div className="text-lg font-mono min-w-[60px]">
        {formatTime(seconds)}
      </div>
      
      <div className="flex gap-1">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="p-1 rounded bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canStart ? 'Stop other timer first' : 'Start timer'}
          >
            <Play className="w-4 h-4 text-green-600" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-1 rounded bg-yellow-100 hover:bg-yellow-200"
            title="Pause timer"
          >
            <Pause className="w-4 h-4 text-yellow-600" />
          </button>
        )}
        
        {seconds > 0 && (
          <button
            onClick={handleStop}
            className="p-1 rounded bg-red-100 hover:bg-red-200"
            title="Stop and save"
          >
            <Square className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>
    </div>
  )
}