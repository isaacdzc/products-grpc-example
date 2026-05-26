import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const user = configService.get<string>('DB_USER');
        const password = configService.get<string>('DB_PASSWORD');
        const cluster = configService.get<string>('DB_CLUSTER');
        const dbName = configService.get<string>('DB_NAME');
        const uri = `mongodb+srv://${user}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
        return {
          uri,
        };
      },
    }),
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
