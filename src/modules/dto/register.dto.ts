import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, Min, MinLength } from "class-validator";

export class RegisterDTO {
    @IsEmail({}, { message: "Email is invalid" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
        message: "Password must contain at least one letter and one number",
    })
    password: string;

    @IsOptional()
    @IsString()
    firstname?: string;

    @IsOptional()
    @IsString()
    lastname?: string;
}