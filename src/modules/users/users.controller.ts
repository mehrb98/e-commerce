import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UsersService } from "./users.service";
import { UserResponse } from "./dto/user.dto";
import type { RequestWithUser } from "src/common/user.interface";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { UpdateUser } from "./dto/update-user.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { ChangePassword } from "./dto/change-password.dto";

@ApiTags("Users")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // ===== Get current user profile =====
    @Get("me")
    @ApiOperation({
        summary: "Get current user profile",
    })
    @ApiResponse({
        status: 200,
        description: "The user profile has been successfully retrieved.",
        type: UserResponse,
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    async getProfile(@Req() req: RequestWithUser): Promise<UserResponse> {
        return await this.usersService.findOne(req.user.id);
    }

    // ===== Get all users (for admin purposes) =====
    @Get("users")
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: "Get all users",
    })
    @ApiResponse({
        status: 200,
        description: "The list of users",
        type: [UserResponse],
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden. Admins only.",
    })
    async findAllUsers(): Promise<UserResponse[]> {
        return this.usersService.findAll();
    } 


    // ===== Get user by ID =====
    @Get(":id")
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: "Get user by ID",
    })
    @ApiResponse({
        status: 200,
        description: "The user with the specified ID",
        type: [UserResponse],
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden. Admins only.",
    })
    @ApiResponse({
        status: 404,
        description: "User not found.",
    })
    async findOne(@Param("id") id: string): Promise<UserResponse> {
        return this.usersService.findOne(id);
    }

    // ===== Update current user profile =====
    @Patch("me")
    @ApiOperation({
        summary: "Update current user profile",
    })
    @ApiBody({ 
        type: UpdateUser 
    })
    @ApiResponse({
        status: 200,
        description: "The user profile has been successfully updated.",
        type: UpdateUser
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    @ApiResponse({
        status: 409,
        description: "The email is already in use.",
    })
    async updateProfile(
        @GetUser("id") userId: string, 
        @Body() userData: UpdateUser
    ): Promise<UserResponse> {
        return await this.usersService.update(userId, userData);
    }


    // ===== Change current user password =====
    @Patch("me/password")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Change current user password",
    })
    @ApiResponse({
        status: 200,
        description: "The user password has been successfully changed.",
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    async changePassword(
        @GetUser("id") userId: string, 
        @Body() credentials: ChangePassword
    ): Promise<{ message: string } > {
        return await this.usersService.changePassword(userId, credentials);
    }


    // ===== Delete current user profile =====
    @Delete("me")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Delete current user profile",
    })
    @ApiResponse({
        status: 200,
        description: "The user account has been successfully deleted.",
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    async deleteAccount(
        @GetUser("id") userId: string
    ): Promise<{ message: string } > {
        return await this.usersService.delete(userId);
    }


    // ===== Delete user by ID (for admin purposes) =====
    @Delete(":id")
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Delete user by ID",
    })
    @ApiResponse({
        status: 200,
        description: "The user with the specified ID has been successfully deleted.",
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    async deleteUserById(
        @Param("id") id: string
    ): Promise<{ message: string } > {
        return await this.usersService.delete(id);
    }
}
