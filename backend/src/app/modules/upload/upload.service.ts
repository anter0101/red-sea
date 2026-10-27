import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePresignedUrlDto } from './dto/create-presignedUrl.dto';
import { MimeTypeMap } from 'src/core/enums/mime-type';

const VIEW_URL_TTL_SECONDS = 3600;

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicEndpoint?: string;

  constructor(private readonly configService: ConfigService) {
    const internalEndpoint = this.configService.get<string>('AWS_ENDPOINT');
    // Browser must reach this host. The signature includes it, so it cannot be rewritten later.
    this.publicEndpoint = this.configService.get<string>('AWS_PUBLIC_ENDPOINT') || internalEndpoint;
    const region = this.configService.getOrThrow<string>('AWS_REGION', { infer: true });
    this.bucket = this.configService.getOrThrow<string>('BUCKET_NAME');

    this.s3Client = new S3Client({
      region,
      endpoint: this.publicEndpoint || undefined,
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
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    const fileUrl = this.buildFileUrl(key);

    // Keep `url` as uploadUrl for backward compatibility with older clients
    return { ...dto, uploadUrl, fileUrl, url: uploadUrl };
  }

  async generateViewUrl(stored: string): Promise<{ url: string; expiresIn: number }> {
    const key = this.extractObjectKey(stored);
    const expiresIn = VIEW_URL_TTL_SECONDS;
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    return { url, expiresIn };
  }

  /** Stored rows may carry an old host (e.g. http://localhost:9000), so only the path after the bucket counts. */
  private extractObjectKey(stored: string): string {
    const value = stored.trim();
    let path = value;
    if (/^https?:\/\//i.test(value)) {
      try {
        path = new URL(value).pathname;
      } catch {
        throw new BadRequestException('Invalid file URL');
      }
      const marker = `/${this.bucket}/`;
      const at = path.indexOf(marker);
      if (at === -1) throw new BadRequestException('File is not in the storage bucket');
      path = path.slice(at + marker.length);
    }

    let key: string;
    try {
      key = path.replace(/^\/+/, '').split('/').map(decodeURIComponent).join('/');
    } catch {
      throw new BadRequestException('Invalid file URL');
    }
    if (!key.startsWith('uploads/') || key.split('/').includes('..')) {
      throw new BadRequestException('File is not in the storage bucket');
    }
    return key;
  }

  private buildFileUrl(key: string): string {
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    if (this.publicEndpoint) {
      return `${this.publicEndpoint.replace(/\/$/, '')}/${this.bucket}/${encodedKey}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${encodedKey}`;
  }

  private getExtensionFromMime(mimeType: string): string {
    const entry = Object.entries(MimeTypeMap).find(([, mime]) => mime === mimeType);
    if (!entry) throw new BadRequestException(`Unsupported MIME type: ${mimeType}`);
    return entry[0].toLowerCase();
  }

  private generateObjectKey(filename: string, ext: string): string {
    const timestamp = Date.now();
    const base = filename.replace(/\.[^.]+$/, '');
    const safeBase =
      base
        .replace(/[^a-zA-Z0-9._-]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 40) || 'file';
    return `uploads/${ext}/${timestamp}_${safeBase}.${ext}`;
  }

  private getExpiresInBasedOnFileSize(size: number): number {
    if (size <= 1_000_000) return 300; // 5 min
    if (size <= 10_000_000) return 600; // 10 min
    if (size <= 50_000_000) return 900; // 15 min
    if (size <= 100_000_000) return 1800; // 30 min
    return 3600; // 1 hour
  }
}
