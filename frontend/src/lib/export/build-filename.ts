export function buildExportFilename(moduleSlug: string, extension = 'xlsx'): string {
  const date = new Date().toISOString().split('T')[0];
  const safeSlug = moduleSlug.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safeSlug}_${date}.${extension}`;
}
