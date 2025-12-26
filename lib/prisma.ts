import { PrismaClient } from '@prisma/client'
import path from 'path'

const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    // Fallback for Windows compatibility
    const dbPath = path.join(process.cwd(), 'dev.db')
    return `file:${dbPath.replace(/\\/g, '/')}`
  }
  return dbUrl
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma