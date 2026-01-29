import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDTO } from "./dto/register.dto";
import { AuthResponse } from "./dto/auth.dto";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { LoginDTO } from "./dto/login.dto";

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

    // Generate JWT tokens(access and refresh)

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

    // Update refresh token in database

    async updateRefreshToken(params: {
        userId: string;
        refreshToken: string;
    }): Promise<void> {
        const { userId, refreshToken } = params;

        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken }
        });
    }

    // Refresh tokens

    async refreshToken(userId: string): Promise<AuthResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        const tokens = await this.generateTokens(user.id, user.email);

        await this.updateRefreshToken({
            userId: user.id,
            refreshToken: tokens.refreshToken,
        });

        return { user, ...tokens };
    }

    // Log out user

    async logout(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }

    // Login user

    async login(loginDto: LoginDTO): Promise<AuthResponse> {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
                password: true,
            },
        });

        
        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isPasswordValid = await bcrypt
            .compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const tokens = await this.generateTokens(user.id, user.email);

        await this.updateRefreshToken({
            userId: user.id,
            refreshToken: tokens.refreshToken,
        });

        // Exclude password from returned user object
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, ...tokens };
    }
}
