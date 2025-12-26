import { calculateStreak, getNextMilestone, formatTime } from '@/lib/utils'

describe('calculateStreak', () => {
  it('returns 0 for empty logs', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('calculates streak correctly for consecutive days', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const logs = [
      { createdAt: today },
      { createdAt: yesterday }
    ]
    
    expect(calculateStreak(logs)).toBe(2)
  })

  it('resets streak for non-consecutive days', () => {
    const today = new Date()
    const threeDaysAgo = new Date(today)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    
    const logs = [
      { createdAt: today },
      { createdAt: threeDaysAgo }
    ]
    
    expect(calculateStreak(logs)).toBe(1)
  })
})

describe('getNextMilestone', () => {
  it('returns next milestone correctly', () => {
    expect(getNextMilestone(25, 1260)).toBe(30)
    expect(getNextMilestone(35, 1260)).toBe(60)
    expect(getNextMilestone(1300, 1260)).toBe(1260)
  })
})

describe('formatTime', () => {
  it('formats time correctly', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(3661)).toBe('61:01')
  })
})