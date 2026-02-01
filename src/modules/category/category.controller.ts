import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { CategoryDTO } from "./dto/category.dto";
import { Role } from "@prisma/client";
import { CategoryResponse } from "./dto/category-response.dto";
import { QueryCategoryDTO } from "./dto/query-category.dto";
import { UpdateCategoryDTO } from "./dto/update-category.dto";

@ApiTags("Category")
@Controller("categories")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

     // ===== Create category =====
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth("JWT-auth")
    @ApiOperation({ summary: "Create a new category" })
    @ApiBody({ type: CategoryDTO })
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
    async create(@Body() categoryDTO: CategoryDTO): Promise<CategoryResponse> {
        return await this.categoryService.createCategory(categoryDTO);
    }

    // ===== Get all categories =====
    @Get("all")
    @ApiOperation({ summary: "Get all categories" })
    @ApiResponse({
        status: 200,
        description: "Successfully retrieved all categories.",
        schema: {
            type: "object",
            properties: {
                categories: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CategoryResponse" },
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
    async getAllCategories(@Query() query: QueryCategoryDTO) {
        return this.categoryService.findAll(query);
    }


    // ===== Get category by ID =====
    @Get(":id")
    @ApiOperation({ summary: "Get category by ID" })
    @ApiResponse({
        status: 200,
        description: "Category details",
        type: CategoryResponse,
    })
    @ApiResponse({
        status: 404,
        description: "Category not found.",
    })
    async getCategoryById(@Param("id") id: string): Promise<CategoryResponse> {
        return this.categoryService.findOne(id);
    }


    // ===== Get category by slug =====
    @Get("slug/:slug")
    @ApiOperation({ summary: "Get category by slug" })
    @ApiResponse({
        status: 200,
        description: "Category details",
        type: CategoryResponse,
    })
    @ApiResponse({
        status: 404,
        description: "Category not found.",
    })
    async findBySlug(@Param("slug") slug: string): Promise<CategoryResponse> {
        return this.categoryService.findBySlug(slug);
    }


    // ===== Update category (admin only) =====
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth("JWT-auth")
    @ApiOperation({ summary: "Update category (admin only)" })
    @ApiBody({ type: UpdateCategoryDTO })
    @ApiResponse({
        status: 200,
        description: "The category has been successfully updated.",
        type: CategoryResponse,
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
    async update(
        @Param("id") id: string,
        @Body() updateData: UpdateCategoryDTO
    ): Promise<CategoryResponse> {
        return this.categoryService.update(id, updateData);
    }

    // ===== Delete category =====
    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth("JWT-auth")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete a category (admin only)" })
    @ApiResponse({
        status: 200,
        description: "The category has been successfully deleted.",
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized.",
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden - insufficient permissions.",
    })
    @ApiResponse({
        status: 404,
        description: "Category not found.",
    })
    async deleteCategory(@Param("id") id: string): Promise<{ message: string }> {
        return await this.categoryService.delete(id);
    }
}