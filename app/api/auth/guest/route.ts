import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const guestEmail = `${guestId}@guest.local`
    const guestPassword = Math.random().toString(36).substr(2, 15)
    
    const passwordHash = await hashPassword(guestPassword)

    const user = await prisma.user.create({
      data: {
        email: guestEmail,
        passwordHash
      }
    })

    return NextResponse.json({
      email: guestEmail,
      password: guestPassword,
      userId: user.id
    })
  } catch (error) {
    console.error('Guest login error:', error)
    return NextResponse.json(
      { error: 'Failed to create guest account' },
      { status: 500 }
    )
  }
}