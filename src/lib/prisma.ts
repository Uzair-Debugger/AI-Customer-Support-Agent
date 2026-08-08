import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { NODE_ENV, DIRECT_URL } from "@/config/env";
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString: DIRECT_URL })
});

if (NODE_ENV !== "production") globalForPrisma.prisma = prisma;
