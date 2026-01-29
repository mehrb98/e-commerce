import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class RegisterDTO {
    @ApiProperty({ 
        description: "User email address",
        example: "john@example.com",
    })
    @IsEmail({}, { message: "Email is invalid" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;


    @ApiProperty({ 
        description: "User password",
        example: "StrongP@ssword123",
    })
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
        message: "Password must contain at least one letter and one number",
    })
    password: string;


    @ApiProperty({ 
        description: "User first name",
        example: "John",
        required: false,
    })
    @IsOptional()
    @IsString()
    firstname?: string;

     
    @ApiProperty({ 
        description: "User last name",
        example: "Doe",
        required: false,
    })
    @IsOptional()
    @IsString()
    lastname?: string;
}