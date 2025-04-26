import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Use direct instantiation in production, global singleton in development
const prismaClient = process.env.NODE_ENV === 'production' 
  ? new PrismaClient()
  : global.prisma ?? new PrismaClient();

// If not in production, attach to global to reuse connection
if (process.env.NODE_ENV !== 'production') global.prisma = prismaClient;

export const prisma = prismaClient; 