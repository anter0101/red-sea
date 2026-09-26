import client from '@/lib/client';

export type PresignedUploadRequest = {
  name: string;
  type: string;
  size: number;
};

export type PresignedUploadResponse = {
  name: string;
  type: string;
  size: number;
  uploadUrl: string;
  fileUrl: string;
  /** @deprecated prefer uploadUrl */
  url: string;
};

export async function createPresignedUrl(
  fileMeta: PresignedUploadRequest,
): Promise<PresignedUploadResponse> {
  const res = await client.post<PresignedUploadResponse>('/api/v1/upload/presigned-url', fileMeta);
  return res.data;
}
