import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

const productionPrisma = () => {
  try {
    return new PrismaClient().$extends(withAccelerate());
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
};

// In development, use a global variable to avoid instantiating multiple clients
const prisma = global.prismaInstance || (
  process.env.NODE_ENV === 'production'
  ? productionPrisma()
  : new PrismaClient().$extends(withAccelerate())
);

if (process.env.NODE_ENV !== 'production') global.prismaInstance = prisma;

export default prisma; 