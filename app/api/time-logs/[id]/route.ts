import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { minutes, note } = await req.json()

    if (!minutes || minutes < 1) {
      return NextResponse.json({ error: 'Minutes must be at least 1' }, { status: 400 })
    }

    const timeLog = await prisma.timeLog.updateMany({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      data: {
        minutes: parseInt(minutes),
        note: note || null
      }
    })

    if (timeLog.count === 0) {
      return NextResponse.json({ error: 'Time log not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Time log updated' })
  } catch (error) {
    console.error('Update time log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const timeLog = await prisma.timeLog.deleteMany({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (timeLog.count === 0) {
      return NextResponse.json({ error: 'Time log not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Time log deleted' })
  } catch (error) {
    console.error('Delete time log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}