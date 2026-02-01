import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDTO } from "./dto/register.dto";
import { AuthResponse } from "./dto/auth.dto";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { LoginDTO } from "./dto/login.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {} 


    // ===== Register a new user =====
    @Post("register")
    @HttpCode(201)
    @ApiOperation({ 
        summary: "Register a new user",
        description: "Creates a new user account"
    })
    @ApiResponse({ 
        status: 201,
        type: AuthResponse,
        description: "User registered successfully",
    })
    @ApiResponse({ 
        status: 400,
        type: AuthResponse,
        description: "Bad request - User registration failed",
    })
    @ApiResponse({ 
        status: 500,
        type: AuthResponse,
        description: "Internal server error",
    })
    @ApiResponse({ 
        status: 429,
        type: AuthResponse,
        description: "Too many requests - Rate limit exceeded",
    })

    async register(@Body() register_dto: RegisterDTO): Promise<AuthResponse> {
        return this.authService.register(register_dto);
    }


    // ===== Refresh user token =====
    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshTokenGuard)
    @ApiBearerAuth("JWT-refresh")
    @ApiOperation({ 
        summary: "Refresh user token",
        description: "Generates a new access token using the refresh token"
    })
    @ApiResponse({ 
        status: 200,
        type: AuthResponse,
        description: "Refresh token generated successfully",
    })
    @ApiResponse({ 
        status: 401,
        type: AuthResponse,
        description: "Unauthorized - Invalid refresh token",
    })
    @ApiResponse({ 
        status: 429,
        type: AuthResponse,
        description: "Too many requests - Rate limit exceeded",
    })
    async refresh(@GetUser("id") userId: string): Promise<AuthResponse> {
        return this.authService.refreshToken(userId);
    }

    // ===== Logout user =====
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Logout user',
        description: 'Logs out the user and invalidates the refresh token',
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged out',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized. Invalid or expired access token',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests. Rate limit exceeded',
    })
    async logout(@GetUser("id") userId: string): Promise<{ message: string }> {
        await this.authService.logout(userId);

        return { message: "Logout successful" };
    }

    // ===== Login user =====
    @Post("login")
    @ApiOperation({
        summary: 'User login',
        description: 'Authenticates a user and returns access and refresh tokens',
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in',
        type: AuthResponse,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized. Invalid credentials',
    })
    @ApiResponse({
        status: 429,
        description: 'Too Many Requests. Rate limit exceeded',
    })
    @HttpCode(HttpStatus.OK)
    async login(@Body() login_dto: LoginDTO): Promise<AuthResponse> {
        return this.authService.login(login_dto);
    }
}
