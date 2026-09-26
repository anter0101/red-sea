import { createPresignedUrl } from './create-presigned-url';
import { putPresignedUrl } from './put-presigned-url';

/** Upload a file via S3/MinIO presigned URL and return the permanent file URL. */
export async function uploadFile(file: File): Promise<string> {
  const presigned = await createPresignedUrl({
    name: file.name,
    type: file.type,
    size: file.size,
  });

  const uploadUrl = presigned.uploadUrl || presigned.url;
  await putPresignedUrl({ uploadUrl, file });

  return presigned.fileUrl || uploadUrl.split('?')[0];
}
