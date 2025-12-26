interface ProgressBarProps {
  current: number
  target: number
  className?: string
}

export function ProgressBar({ current, target, className = '' }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100)
  
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 ${className}`}>
      <div
        className="bg-primary-600 h-3 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}