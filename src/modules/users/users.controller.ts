import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UsersService } from "./users.service";
import { UserResponse } from "./dto/user.dto";
import type { RequestWithUser } from "src/common/user.interface";

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // Get current user profile

    @Get('me')
    @ApiOperation({
        summary: 'Get current user profile',
    })
    @ApiResponse({
        status: 200,
        description: 'The user profile has been successfully retrieved.',
        type: UserResponse,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    async getProfile(@Req() req: RequestWithUser): Promise<UserResponse> {
        return await this.usersService.findOne(req.user.id);
    }
}
