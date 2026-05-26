import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}