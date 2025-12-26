import Link from 'next/link'
import { Clock, Target, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            1260
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build skills through micro-practice. Track your journey to mastery.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup" className="btn btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="/login" className="btn btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
            <Link href="/login?guest=true" className="btn btn-secondary text-lg px-8 py-3">
              Try as Guest
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Micro Sessions</h3>
            <p className="text-gray-600">
              Practice in small, manageable chunks. Every minute counts toward your goal.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">21 Hour Goal</h3>
            <p className="text-gray-600">
              Reach 1260 minutes (21 hours) to build lasting skills and habits.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor streaks, milestones, and progress across multiple activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}