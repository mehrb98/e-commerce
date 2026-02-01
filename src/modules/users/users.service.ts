import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserResponse } from "./dto/user.dto";
import { UpdateUser } from "./dto/update-user.dto";
import { ChangePassword } from "./dto/change-password.dto";
import * as bcrypt from "bcrypt";


@Injectable()
export class UsersService {
    private readonly SALT_ROUNDS = 12;

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

    async findAll(): Promise<UserResponse[]> {
        return await this.prisma.user.findMany({
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
            orderBy: { createdAt: "desc" },
        }); 
    }

    async update(userId: string, userData: UpdateUser): Promise<UserResponse> {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if(!existingUser) {
            throw new NotFoundException('User not found');
        }

        if(userData.email && userData.email !== existingUser.email) {
            const emailTaken = await this.prisma.user.findUnique({
                where: { email: userData.email }
            });

            if(emailTaken) {
                throw new NotFoundException("Email is already in taken");
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: userData,
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
        })

        return updatedUser;
    }

    async changePassword(
        userId: string, 
        credentials: ChangePassword
    ): Promise<{ message: string }> {
        const { currentPassword, newPassword } = credentials;

        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if(!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword, user.password
        );

        if(!isPasswordValid) {
            throw new NotFoundException('Current password is incorrect');
        }

        const isSamePassword = await bcrypt.hash(newPassword, user.password);

        if(isSamePassword) {
            throw new NotFoundException(
                "New password must be different from the current password"
            );
        }

        const hashedNewPassword = await bcrypt.hash(
            newPassword, this.SALT_ROUNDS
        );

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        return { message: 'Password has been successfully changed' };
    }

    async delete(userId: string): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if(!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.delete({
            where: { id: userId }
        });

        return { 
            message: "User account has been successfully deleted" 
        };
    }
}