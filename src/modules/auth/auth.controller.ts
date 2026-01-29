import { Body, Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDTO } from "../dto/register.dto";
import { AuthResponse } from "../dto/auth.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {} 

    async register(@Body() register_dto: RegisterDTO): Promise<AuthResponse> {
        return this.authService.register(register_dto);
    }
}
