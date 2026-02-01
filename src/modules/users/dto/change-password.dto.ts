import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ChangePassword {
    @ApiProperty({ 
        description: "The current password of the user",
        example: "Str0ngP@ssw0rd!",
    })

    @IsString()
    @IsNotEmpty({ 
        message: "Current password is required" 
    })
    currentPassword: string;


    @ApiProperty({ 
        description: "The new password of the user", 
        example: "Str0ngP@ssw0rd!", 
    })  

    @IsString()
    @IsNotEmpty({ message: "New Password is required" })
    @MinLength(8, { message: "New Password must be at least 8 characters long" })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
        message: "New Password must contain at least one letter and one number",
    })
    newPassword: string;
} 