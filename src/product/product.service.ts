import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
    ) { }

    async create(data: any): Promise<Product> {
        try {
            const newProduct = new this.productModel(data);
            return await newProduct.save();
        } catch (error) {
            throw new RpcException({
                code: grpc.status.INTERNAL,
                message: 'Internal server error during creation',
            });
        }
    }

    async findAll(): Promise<Product[]> {
        return await this.productModel.find().exec();
    }

    async findOne(id: string): Promise<Product> {
        try {
            const product = await this.productModel.findById(id).exec();
            if (!product) {
                throw new RpcException({
                    code: grpc.status.NOT_FOUND,
                    message: 'Product ' + id + ' not found',
                });
            }
            return product;
        } catch (error) {
            if (error instanceof RpcException) throw error;
            throw new RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'The provided ID format is not valid',
            });
        }
    }

    async update(id: string, data: any): Promise<Product> {
        try {
            const updatedProduct = await this.productModel
                .findByIdAndUpdate(id, data, { new: true })
                .exec();

            if (!updatedProduct) {
                throw new RpcException({
                    code: grpc.status.NOT_FOUND,
                    message: 'Product ' + id + ' not found',
                });
            }
            return updatedProduct;
        } catch (error) {
            if (error instanceof RpcException) throw error;
            throw new RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Error processing data update',
            });
        }
    }

    async remove(id: string): Promise<Product> {
        try {
            const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
            if (!deletedProduct) {
                throw new RpcException({
                    code: grpc.status.NOT_FOUND,
                    message: 'Product ' + id + ' not found',
                });
            }
            return deletedProduct;
        } catch (error) {
            if (error instanceof RpcException) throw error;
            throw new RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Error processing deletion',
            });
        }
    }
}