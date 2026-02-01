import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateUser {
    @ApiProperty({
        description: "User email address",
        example: "john.doe@example.com",
        required: false,
    })

    @IsOptional()
    @IsEmail()
    email?: string;


    @ApiProperty({
        description: "User first name",
        example: "John",
        nullable: true,
    })

    @IsOptional()
    @IsString()
    firstname?: string;


    @ApiProperty({
        description: "User last name",
        example: "Doe",
        nullable: true,
    })

    @IsOptional()
    @IsString()
    lastname?: string;
}