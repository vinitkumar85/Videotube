import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoController } from './video/video.controller';
import { VideoService } from './video/video.service';
import { VideoSchema } from './video/schemas/video.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('config.uri'),
        dbName: 'vid-connect-media',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class AppModule {}
