import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Set global prefix for all routes
    app.setGlobalPrefix("api/v1");

    // Set global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { 
            enableImplicitConversion: true 
        },
    }));

    // Enable CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? 'https://localhost:3001',
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    // Enable Swagger docs 
    const config = new DocumentBuilder()
        .setTitle('NestJS API')
        .setDescription('API documentation for the application')
        .setVersion('1.0')
        .addTag("auth", "Authentication related endpoints")
        .addTag("users", "User management related endpoints")
        // .addTag("products", "Product management related endpoints")
        // .addTag("products", "Product management related endpoints")
        .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                in: 'header',
                name: 'JWT',
                description: 'Enter JWT token',
            },
            'JWT-auth',
        )
        .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                in: 'header',
                name: 'Refresh JWT',
                description: 'Enter Refresh JWT token',
            },
            'JWT-refresh',
        )
        .addServer("http://localhost:3001", "Development server")
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("api/docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: "alpha",
            operationsSorter: "alpha",
        },

        customSiteTitle: "API Documentation",
        customfavIcon: "https://nestjs.com/img/logo-small.svg",
        customCss: `
            .swagger-ui .topbar { display: none; }
            .swagger-ui .info {  margin: 50px 0;  }
            .swagger-ui .info .title { color: #4A90E2; }
        `,
    });

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
    Logger.error("Error starting the application", error);
    
    process.exit(1);
});
