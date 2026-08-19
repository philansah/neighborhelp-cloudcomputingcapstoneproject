import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'], // Disable verbose query logging in terminal
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
