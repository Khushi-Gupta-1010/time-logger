import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activities = await prisma.activity.findMany({
      where: { userId: session.user.id },
      include: {
        timeLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, targetMinutes, color, icon } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        name,
        targetMinutes: targetMinutes || 1260,
        color: color || '#3b82f6',
        icon: icon || '⏱️'
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}