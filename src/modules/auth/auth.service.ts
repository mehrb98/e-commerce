import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDTO } from "../dto/register.dto";
import { AuthResponse } from "../dto/auth.dto";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    // Registration logic

    async register(registerDto: RegisterDTO): Promise<AuthResponse> {
        const { email, password, firstname, lastname } = registerDto;

        // Check if user already exists
        const existingUser = await this.prisma
            .user.findUnique({ where: { email } });

        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        try { 
            const hashedPassword = await bcrypt
                .hash(password, this.SALT_ROUNDS);

            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstname,
                    lastname,
                },

                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    role: true,
                    password: false,
                },
            });

            const tokens = await this.generateTokens(user.id, user.email);

            await this.updateRefreshToken({
                    userId: user.id,
                    refreshToken: tokens.refreshToken,
            });

            return { user, ...tokens };
        } catch (error) {
            console.error("Error during registration: " + error.message);
            
            throw new InternalServerErrorException(
                "An error occurred during registration"
            );
        }
    }

    private async generateTokens(userId: string, email: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const payload = { sub: userId, email };
        const refreshId= randomBytes(16).toString("hex");

        const [ accessToken, refreshToken ] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: "15m" }),
            this.jwtService.signAsync({ ...payload, refreshId }, { expiresIn: "7d" }),
        ]);

        return { accessToken, refreshToken };
    }

    private async updateRefreshToken(params: {
        userId: string;
        refreshToken: string;
    }): Promise<void> {
        const { userId, refreshToken } = params;

        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken }
        });
    }
}
