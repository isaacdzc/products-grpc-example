import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
@UsePipes(
    new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: (errors) => {
            const messages = errors.map(
                (err) => `${err.property}: ${Object.values(err.constraints || {}).join(', ')}`
            );
            return new RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `Validation failed: ${messages.join(' | ')}`,
            });
        },
    }),
)
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @GrpcMethod('ProductService', 'CreateProduct')
    async createProduct(data: CreateProductDto) {
        const product = await this.productService.create(data);
        return this.mapProductToResponse(product);
    }

    @GrpcMethod('ProductService', 'FindAllProducts')
    async findAllProducts() {
        const products = await this.productService.findAll();
        return {
            products: products.map((p) => this.mapProductToResponse(p)),
        };
    }

    @GrpcMethod('ProductService', 'FindOneProduct')
    async findOneProduct(data: { id: string }) {
        const product = await this.productService.findOne(data.id);
        return this.mapProductToResponse(product);
    }

    @GrpcMethod('ProductService', 'UpdateProduct')
    async updateProduct(data: UpdateProductDto) {
        const { id, ...updateData } = data;
        const product = await this.productService.update(id, updateData);
        return this.mapProductToResponse(product);
    }

    @GrpcMethod('ProductService', 'RemoveProduct')
    async removeProduct(data: { id: string }) {
        const product = await this.productService.remove(data.id);
        return this.mapProductToResponse(product);
    }

    private mapProductToResponse(product: any) {
        return {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            createdAt: product.createdAt?.toISOString() || '',
            updatedAt: product.updatedAt?.toISOString() || '',
        };
    }
}