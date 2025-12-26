import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activityId, minutes, note, source, createdAt } = await req.json()

    if (!activityId || !minutes || !source) {
      return NextResponse.json(
        { error: 'Activity ID, minutes, and source are required' },
        { status: 400 }
      )
    }

    // Verify activity belongs to user
    const activity = await prisma.activity.findFirst({
      where: { 
        id: activityId,
        userId: session.user.id 
      }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: session.user.id,
        activityId,
        minutes: parseInt(minutes),
        note: note || null,
        source,
        ...(createdAt && { createdAt: new Date(createdAt) })
      }
    })

    return NextResponse.json(timeLog, { status: 201 })
  } catch (error) {
    console.error('Create time log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}