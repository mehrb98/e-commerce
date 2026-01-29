import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";

export class UserResponse {
    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({ 
        description: "User email address",
        example: "john@example.com",
    })
    email: string;

    @ApiProperty({ 
        description: "User first name",
        example: "John",
    })
    firstname: string | null;

    @ApiProperty({ 
        description: "User last name",
        example: "Doe",
    })
    lastname: string | null;

    @ApiProperty({ 
        description: "User role",
        enum: Role,
    })
    role: Role;

    @ApiProperty({ 
        description: "Account creation timestamp",
        example: "2023-10-01T12:34:56.789Z",
    })
    createdAt: Date;

    @ApiProperty({ 
        description: "Last account update timestamp",
        example: "2023-10-10T12:34:56.789Z",
    })
    updatedAt: Date;
}