import { Injectable, BadRequestException } from '@nestjs/common';
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

  async uploadFile(file, body, maxSize: number) {
    if (!this.isFileSizeValid(file.size, maxSize)) {
      throw new BadRequestException(
        `File size exceeds the limit of ${maxSize / (1024 * 1024)} MB.`,
      );
    }

    if (!this.isValidVideoFormat(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file format. Only AVI and MPEG video files are allowed.',
      );
    }

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

  isValidVideoFormat(mimetype: string): boolean {
    return (
      mimetype === 'video/avi' ||
      mimetype === 'video/mpeg' ||
      mimetype === 'video/mp4'
    );
  }

  isFileSizeValid(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize;
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

  async updateLikes(body: any): Promise<any> {
    const { videoId, userId } = body;
    try {
      // Find the video by its ID and update the 'likes' array
      await this.videoModel.updateOne(
        { _id: videoId },
        { $push: { likes: userId } },
      );
      return { message: `Video is liked by ${userId}` };
    } catch (error) {
      console.error('Error updating likes:', error);
      throw new BadRequestException('Could not update likes.');
    }
  }
}
