import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';

@Controller()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateVideoDto,
  ) {
    return this.videoService.uploadFile(file, body, 20 * 1024 * 1024);
  }

  @Get('videos')
  getAllVideos() {
    return this.videoService.findAllVideos();
  }

  @Post('update/likes')
  updateLikes(@Body() body: any) {
    return this.videoService.updateLikes(body);
  }
}
