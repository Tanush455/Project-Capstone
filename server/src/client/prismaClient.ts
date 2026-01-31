import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/dummy",
});

export const prisma = new PrismaClient({
    adapter,
});