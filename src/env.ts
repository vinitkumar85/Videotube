import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  uri: process.env.MONGODB_CONNECTION_STRING,
  bucket: process.env.CLOUD_BUCKET,
  id: process.env.CLOUD_ID,
  key: process.env.CLOUD_KEY,
}));
