import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateProductDTO } from './dto/create-product.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductDTO } from './dto/query-product.dto';
import { UpdateCategoryDTO } from '../category/dto/update-category.dto';
import { UpdateProductDTO } from './dto/update-product.dto';

@ApiTags("Products")
@Controller("products")
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}


     // ===== Create product =====
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth("JWT-auth")
    @ApiOperation({ summary: "Create a new product" })
    @ApiBody({ type: CreateProductDTO })
    @ApiResponse({
        status: 201,
        description: "The category has been successfully created."
    })
    @ApiResponse({
        status: 400,
        description: "Bad request - invalid category data.",
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden - insufficient permissions.",
    })
    async create(@Body() createProductDTO: CreateProductDTO): Promise<ProductResponseDto> {
        return await this.productsService.create(createProductDTO);
    }


    // ===== Get all products =====
    @Get()
    @ApiOperation({ summary: "Get all products" })
    @ApiResponse({
        status: 200,
        description: "Successfully retrieved all products.",
        schema: {
            type: "object",
            properties: {
                products: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ProductResponseDto" },
                },
                meta: {
                    type: "object",
                    properties: {
                        total: { type: "number" },
                        page: { type: "number" },
                        limit: { type: "number" },
                        totalPages: { type: "number" }
                    },
                },
            },
        } 
    })      
    async findAll(@Query() query: QueryProductDTO) {
        return this.productsService.findAll(query);
    }


    // ===== Get product by ID =====
    @Get(":id")
    @ApiOperation({ summary: "Get product by ID" })
    @ApiResponse({
        status: 200,
        description: "Product details",
        type: ProductResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: "Product not found.",
    })
    async getProductById(@Param("id") id: string): Promise<ProductResponseDto> {
        return this.productsService.findOne(id);
    }


    // ===== Update product (admin only) =====
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth("JWT-auth")
    @ApiOperation({ summary: "Update product (admin only)" })
    @ApiBody({ type: UpdateProductDTO })
    @ApiResponse({
        status: 200,
        description: "The product has been successfully updated.",
        type: ProductResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: "Bad request - invalid product data.",
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden - insufficient permissions.",
    })
    async update(
        @Param("id") id: string,
        @Body() updateData: UpdateProductDTO
    ): Promise<ProductResponseDto> {
        return this.productsService.update(id, updateData);
    }

    // ===== Update product stock (admin only) =====
    @Patch(':id/stock')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Update product stock (Admin Only)',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                quantity: {
                type: 'number',
                description:
                    'Stock adjustment ( positive to add, negative to subtract) ',
                example: 10,
                },
            },
            required: ['quantity'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Stock updated successfully',
        type: ProductResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Insufficient stock',
    })
    @ApiResponse({
        status: 404,
        description: 'Product not found',
    })
    async updateStock(
        @Param('id') id: string,
        @Body('quantity') quantity: number,
    ): Promise<ProductResponseDto> {
        return await this.productsService.updateStock(id, quantity);
    }

    // ===== Delete category =====
    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth("JWT-auth")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete a product (admin only)" })
    @ApiResponse({
        status: 200,
        description: "The product has been successfully deleted.",
    })
    @ApiResponse({
        status: 400,
        description: 'Cannot delete product in active orders',
    })
    @ApiResponse({
        status: 404,
        description: "Product not found.",
    })
    async deleteProduct(@Param("id") id: string): Promise<{ message: string }> {
        return await this.productsService.delete(id);
    }
}
