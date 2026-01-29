import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class LoginDTO {
    @ApiProperty({ 
        description: "User email address",
        example: "john@example.com",
    })
    @IsEmail({}, { message: "Please provide a valid email address" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @ApiProperty({ 
        description: "User password",
        example: "StrongP@ssword123",
    })
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    password: string;
}