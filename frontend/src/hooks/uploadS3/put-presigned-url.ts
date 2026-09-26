export async function putPresignedUrl({
  uploadUrl,
  file,
}: {
  uploadUrl: string;
  file: File;
}): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to upload file (${res.status})`);
  }
}
