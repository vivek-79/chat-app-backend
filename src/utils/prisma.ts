import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"




const prismaClientSingleton = () =>
    new PrismaClient().$extends(withAccelerate());


type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Extend globalThis with prisma type
declare global {
    var prisma: PrismaClientSingleton | undefined;
}


export const prisma =
    globalThis.prisma ??
    prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}