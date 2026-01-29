import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserResponse } from "./dto/user.dto";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(userId: string): Promise<UserResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                password: false,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        return user;
  }
}
