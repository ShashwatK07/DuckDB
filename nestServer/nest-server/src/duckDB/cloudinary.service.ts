// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { v2 as cloudinary } from 'cloudinary';

// @Injectable()
// export class CloudinaryService {
//   constructor(private readonly configService: ConfigService) {
//     cloudinary.config({
//       cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
//       api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
//       api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
//       secure: true,
//     });
//   }

//   async uploadFile(filePath: string, originalName: string): Promise<string> {
//     try {
//       const uploadResult = await cloudinary.uploader.upload(filePath, {
//         resource_type: 'raw',
//         public_id: originalName.split('.')[0],
//       });
//       return uploadResult.secure_url;
//     } catch (error) {
//       throw new Error(`Cloudinary upload failed: ${error.message}`);
//     }
//   }
// }
