import { Role } from "@prisma/client";

export class AuthResponse {
    accessToken: string;
    refreshToken: string;

    user: {
        id: string;
        email: string;
        firstname: string | null;
        lastname: string | null;
        role: Role;
    };
}