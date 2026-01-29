import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService 
    extends  PrismaClient 
    implements OnModuleInit, OnModuleDestroy {

    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        });

        super({
            adapter,
            log: 
                process.env.NODE_ENV === "development" 
                    ?  ["query", "info", "warn", "error"] 
                    : ["warn", "error"],
        });
    }

    async onModuleInit() {
        await this.$connect();

        console.log("Database connected successfully!");
    }

    async onModuleDestroy() {
        await this.$disconnect();

        console.log("Database disconnected successfully!");
    }

    async cleanDatabase() {
        if(process.env.NODE_ENV === "production") {
            throw new Error("Cannot clean database in production environment!");
        }

        const models = Reflect.ownKeys(this).filter(
            (key) => typeof key === "string" && !key.startsWith("_")
        );

        return Promise.all(
            models.map((key) => {
                if(typeof key === "string") {
                    return this[key].deleteMany();
                }
            })
        );
    }
}
