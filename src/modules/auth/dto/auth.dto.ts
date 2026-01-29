import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";

export class AuthResponse {
    @ApiProperty({ 
        description: "Access token for authentication",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    })
    accessToken: string;

    @ApiProperty({ 
        description: "Refresh token for obtaining new access tokens",
        example: "dGhpcy1pcz1hLXJlZnJlc2gtdG9rZW4tZXhhbXBsZQ...",
    })
    refreshToken: string;

    @ApiProperty({ 
        description: "Authenticated user details",
        example: {
            id: "user-123",
            email: "john@example.com",
            firstname: "John",
            lastname: "Doe",
            role: "USER",
        },
    })
    user: {
        id: string;
        email: string;
        firstname: string | null;
        lastname: string | null;
        role: Role;
    };
}