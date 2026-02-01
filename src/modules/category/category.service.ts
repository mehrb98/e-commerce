import { Category, Prisma } from "@prisma/client";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";;
import { CategoryDTO } from "./dto/category.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { CategoryResponse } from "./dto/category-response.dto";
import { QueryCategoryDTO } from "./dto/query-category.dto";
import { UpdateCategoryDTO } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
    constructor(private readonly prismaService: PrismaService) {}

    async createCategory(categoryData: CategoryDTO): Promise<CategoryResponse> {
        const { name, slug, ...rest } = categoryData;

        const categorySlug = slug ?? 
            name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')

        const existingCategory = await this.prismaService.category.findUnique({
            where: { slug: categorySlug }
        });

        if (existingCategory) {
            throw new Error(
                    `Category with this slug already exists: ${categorySlug}`
            );
        }

        const category = await this.prismaService.category.create({
            data: {
                name,
                slug: categorySlug,
                ...rest
            }
        });

        return this.formatCategory(category, 0);
    }

    async findAll(query: QueryCategoryDTO): Promise<{ 
        categories: CategoryResponse[]; 
        meta: { total: number; page: number; limit: number; totalPages: number; }
    }> {

        const { isActive, search, page = 1, limit = 10 } = query;

        const where: Prisma.CategoryWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = { equals: isActive };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [totalItems, categories] = await Promise.all([
            this.prismaService.category.count({ where }),

            this.prismaService.category.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { 
                        select: { products: true } 
                    },
                },
            }),
        ]);

        const formattedCategories = await Promise.all(
            categories.map(async (category) => {
                const productCount = await this.prismaService.product.count({
                    where: { categoryId: category.id },
                });
                return this.formatCategory(category, productCount);
            })
        );

        const totalPages = Math.ceil(totalItems / limit);

        return {
            categories: formattedCategories,
            meta: {
                total: totalItems,
                page,
                limit,
                totalPages,
            },
        };
    }

    async findOne(id: string): Promise<CategoryResponse> {
        const category = await this.prismaService.category.findUnique({
            where: { id },
            include: {
                _count: { 
                    select: { products: true } 
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found.`);
        }

        return this.formatCategory(
            category, 
            Number(category._count.products)
        );
    }

    async findBySlug(slug: string): Promise<CategoryResponse> {
        const category = await this.prismaService.category.findUnique({
            where: { slug },
            include: {
                _count: { 
                    select: { 
                        products: true 
                    } 
                }
            }
        })

        if(!category) {
            throw new NotFoundException(`Category with ID ${slug} not found.`);
        }

        return this.formatCategory(
            category, 
            Number(category._count.products)
        );
    }

    async update(id: string, updateData: UpdateCategoryDTO): Promise<CategoryResponse> {
        const existingCategory = await this.prismaService.category.findUnique({
            where: { id }
        });

        if (!existingCategory) {
            throw new NotFoundException(`Category with ID ${id} not found.`);
        }

        if (updateData.slug && updateData.slug !== existingCategory.slug) {
            const slugExists = await this.prismaService.category.findUnique({
                where: { slug: updateData.slug }
            });

            if (slugExists) {
                throw new Error(
                    `Category with this slug already exists: ${updateData.slug}`
                );
            }
        }

        const updatedCategory = await this.prismaService.category.update({
            where: { id },
            data: updateData,
            include: {
                _count: { 
                    select: { products: true } 
                }
            }
        });

        return this.formatCategory(
            updatedCategory, 
            Number(updatedCategory._count.products)
        );
    }

    async delete(id: string): Promise<{ message: string }> {
        const category = await this.prismaService.category.findUnique({
            where: { id },
            include: {
                _count: { 
                    select: { products: true } 
                }
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found.`);
        }

        if (category._count.products > 0) {
            throw new BadRequestException(
                `Cannot delete category with ID ${id} because it has associated products.`
            );
        }

        await this.prismaService.category.delete({
            where: { id }
        });

        return { message: "Category deleted successfully." };
    }

    private formatCategory(category: Category, productCount: number): CategoryResponse {
        return {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            imageUrl: category.imageUrl,
            isActive: category.isActive,
            productCount,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
}