import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateVideoDto } from './dto/create-video.dto';
import { ConfigService } from '@nestjs/config';
import { IVideo } from './schemas/video.schema';
import { Model } from 'mongoose';
import * as AWS from 'aws-sdk';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel('Video') private videoModel: Model<IVideo>,
    private readonly configService: ConfigService,
  ) {}

  AWS_S3_BUCKET = this.configService.get<string>('config.bucket');
  s3 = new AWS.S3({
    accessKeyId: this.configService.get<string>('config.id'),
    secretAccessKey: this.configService.get<string>('config.key'),
  });

  async findAllVideos(): Promise<IVideo[]> {
    return await this.videoModel.find().exec();
  }

  async createVideo(createVideoDto: CreateVideoDto): Promise<IVideo> {
    const newVideo = await new this.videoModel(createVideoDto);
    return newVideo.save();
  }

  async uploadFile(file, body) {
    console.log(file);
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
      body,
    );
  }

  async s3_upload(file, bucket, name, mimetype, body) {
    const params = {
      Bucket: bucket,
      Key: String(name.toLowerCase()),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'us-east-1',
      },
    };

    try {
      const s3Response = await this.s3.upload(params).promise();
      const { Location } = s3Response;
      const { title, likes, userId, category, desc } = body;
      this.createVideo({
        path: Location,
        VideoTitle: title,
        likes: likes,
        UserID: userId,
        Category: category,
        Description: desc,
      });
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }
}
