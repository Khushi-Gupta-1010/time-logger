export function calculateStreak(timeLogs: { createdAt: Date }[]): number {
  if (timeLogs.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const sortedLogs = timeLogs
    .map(log => {
      const date = new Date(log.createdAt)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
    .sort((a, b) => b - a)

  const uniqueDays = [...new Set(sortedLogs)]
  
  let streak = 0
  let currentDay = today.getTime()
  
  for (const logDay of uniqueDays) {
    if (logDay === currentDay) {
      streak++
      currentDay -= 24 * 60 * 60 * 1000
    } else if (logDay === currentDay + 24 * 60 * 60 * 1000) {
      // Yesterday counts if today has no logs
      streak++
      currentDay = logDay - 24 * 60 * 60 * 1000
    } else {
      break
    }
  }
  
  return streak
}

export function getNextMilestone(totalMinutes: number, targetMinutes: number): number {
  const milestones = [30, 60, 120, 300, 600, 900, targetMinutes].sort((a, b) => a - b)
  return milestones.find(m => m > totalMinutes) || targetMinutes
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}