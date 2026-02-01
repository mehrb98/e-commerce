import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProductDTO } from "./dto/create-product.dto";
import { ProductResponseDto } from "./dto/product-response.dto";
import { Category, Prisma, Product } from "@prisma/client";
import { QueryProductDTO } from "./dto/query-product.dto";
import { UpdateProductDTO } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}


    // ===== Create product =====
    async create(createProductDTO: CreateProductDTO): Promise<ProductResponseDto> {
        const existingSku = await this.prisma.product.findUnique({
            where: { sku: createProductDTO.sku },
        });
        
        if (existingSku) {
            throw new ConflictException(
                `Product with this SKU ${createProductDTO.sku} already exists`
            );
        }

        const product = await this.prisma.product.create({
            data: {
                ...createProductDTO,
                price: new Prisma.Decimal(createProductDTO.price),
            },
            include: { category: true },
        });

        return this.formatProduct(product);
    }

    // ===== Get all products =====
    async findAll(query: QueryProductDTO): Promise<{ 
        products: ProductResponseDto[]; 
        meta: { 
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        } 
    }> {
        const { category, isActive, search, page = 1, limit = 10 } = query;

        const where: Prisma.ProductWhereInput = {};

        console.log('Initial where clause:', where.categoryId);
        console.log('Category', category);

        if (category) {
            where.categoryId = category;
        }

        if (isActive !== undefined) {
            where.isActive = isActive ;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const total = await this.prisma.product.count({ where });
    
        const products = await this.prisma.product.findMany({
            where,
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { createdAt: "desc" },
            include: { category: true },
        });

        const formattedProducts = products
            .map((product) => this.formatProduct(product));

        return {
            products: formattedProducts,
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===== Get product by ID =====
    async findOne(id: string): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return this.formatProduct(product);
    }

    // ===== Update product =====
    async update(
        id: string,
        updateProductDto: UpdateProductDTO,
    ): Promise<ProductResponseDto> {
        const existingProduct = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            throw new NotFoundException("Product not found");
        }

        if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
            const skuTaken = await this.prisma.product.findUnique({
                where: { sku: updateProductDto.sku },
            });

            if (skuTaken) {
                throw new ConflictException(
                    `Product with SKU ${updateProductDto.sku} already exists`,
                );
            }
        }

        const updateData: any = { ...updateProductDto };

        if (updateProductDto.price && updateProductDto.price !== undefined) {
            updateData.price = new Prisma.Decimal(updateProductDto.price);
        }

        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
            },
        });

        return this.formatProduct(updatedProduct);
    }

    // ===== Update product stock =====
    async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        const newStock = product.stock + quantity;

        if (newStock < 0) {
            throw new BadRequestException("Insufficient stock");
        }

        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: { stock: newStock },
            include: { category: true },
        });

        return this.formatProduct(updatedProduct);
    }

    // ===== Delete product =====
    async delete(id: string): Promise<{ message: string }> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                orderItems: true,
                cartItems: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.orderItems.length > 0) {
            throw new BadRequestException(
                'Cannot delete product that is part of existing orders. Consider marking it as inactive only',
            );
        }

        await this.prisma.product.delete({
            where: { id },
        });

        return { message: 'Product deleted successfully' };
    }


    private formatProduct(product: Product & { category: Category }): ProductResponseDto {
        return {
            ...product,
            price: Number(product.price),
            category: product.category.name,
        };
    }
}
