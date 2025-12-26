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

    const { name, targetMinutes, color, icon } = await req.json()

    const activity = await prisma.activity.updateMany({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      data: {
        ...(name && { name }),
        ...(targetMinutes && { targetMinutes }),
        ...(color && { color }),
        ...(icon && { icon })
      }
    })

    if (activity.count === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Activity updated' })
  } catch (error) {
    console.error('Update activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activity = await prisma.activity.deleteMany({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    })

    if (activity.count === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Activity deleted' })
  } catch (error) {
    console.error('Delete activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}