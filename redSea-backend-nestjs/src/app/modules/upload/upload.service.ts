import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePresignedUrlDto } from './dto/create-presignedUrl.dto';
import { MimeTypeMap } from 'src/core/enums/mime-type';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint?: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>('AWS_ENDPOINT'); // optional for MinIO
    const region = this.configService.getOrThrow<string>('AWS_REGION', { infer: true });
    this.bucket = this.configService.getOrThrow<string>('BUCKET_NAME');
    this.publicBaseUrl = this.configService.get<string>('AWS_PUBLIC_URL');

    this.s3Client = new S3Client({
      region,
      endpoint: this.endpoint || undefined,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true, // important for MinIO
    });
  }

  async generatePresignedUrl(
    dto: CreatePresignedUrlDto,
  ): Promise<Partial<CreatePresignedUrlDto> & { uploadUrl: string; fileUrl: string; url: string }> {
    const ext = this.getExtensionFromMime(dto.type);
    const key = this.generateObjectKey(dto.name, ext);
    const expiresIn = this.getExpiresInBasedOnFileSize(dto.size);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.type,
      Metadata: { 'expected-ext': ext },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    const fileUrl = this.buildFileUrl(key);

    // Keep `url` as uploadUrl for backward compatibility with older clients
    return { ...dto, uploadUrl, fileUrl, url: uploadUrl };
  }

  private buildFileUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    if (this.endpoint) {
      return `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  private getExtensionFromMime(mimeType: string): string {
    const entry = Object.entries(MimeTypeMap).find(([, mime]) => mime === mimeType);
    if (!entry) throw new BadRequestException(`Unsupported MIME type: ${mimeType}`);
    return entry[0].toLowerCase();
  }

  private generateObjectKey(filename: string, ext: string): string {
    const timestamp = Date.now();
    return `uploads/${ext}/${timestamp}_${filename}`;
  }

  private getExpiresInBasedOnFileSize(size: number): number {
    if (size <= 1_000_000) return 300; // 5 min
    if (size <= 10_000_000) return 600; // 10 min
    if (size <= 50_000_000) return 900; // 15 min
    if (size <= 100_000_000) return 1800; // 30 min
    return 3600; // 1 hour
  }
}
