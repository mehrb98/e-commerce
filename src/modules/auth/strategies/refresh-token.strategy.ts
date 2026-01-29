import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { Request } from "express";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "refresh-token") {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: { sub: number; email: string }) {
        console.log("Payload", { sub: payload.sub, email: payload.email });

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.log("No authorization header found");
            throw new UnauthorizedException("Refresh token not provided");
        } 
          
        const refreshToken = authHeader.replace("Bearer ", "").trim();

        if (!refreshToken) {
            throw new UnauthorizedException(
                "Refresh token is empty after extracting from header"
            );
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub.toString() },

            select: { 
                id: true, email: true, 
                refreshToken: true, role: true 
            }
        });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const isTokenMatching = await bcrypt.compare(
            refreshToken, 
            user.refreshToken
        );

        if (!isTokenMatching) {
            throw new UnauthorizedException("Refresh token does not match");
        }

        return user;
    }
}