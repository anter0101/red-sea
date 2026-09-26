import { FileExtensions } from './file-extension';

export const MimeTypeMap: Record<string, string> = {
  // Image Extensions
  [FileExtensions.JPG]: 'image/jpeg',
  [FileExtensions.JPEG]: 'image/jpeg',
  [FileExtensions.PNG]: 'image/png',
  [FileExtensions.GIF]: 'image/gif',
  [FileExtensions.WEBP]: 'image/webp',
  [FileExtensions.BMP]: 'image/bmp',

  // Document / File Extensions
  [FileExtensions.PDF]: 'application/pdf',
  [FileExtensions.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  [FileExtensions.XLSX]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  [FileExtensions.PPTX]:
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  [FileExtensions.TXT]: 'text/plain',
  [FileExtensions.CSV]: 'text/csv',
  [FileExtensions.ZIP]: 'application/zip',
  [FileExtensions.RAR]: 'application/vnd.rar',

  // Video Extensions
  [FileExtensions.MP4]: 'video/mp4',
  [FileExtensions.MOV]: 'video/quicktime',
  [FileExtensions.AVI]: 'video/x-msvideo',
  [FileExtensions.WMV]: 'video/x-ms-wmv',
  [FileExtensions.MKV]: 'video/x-matroska',
  [FileExtensions.WEBM]: 'video/webm',
  [FileExtensions.FLV]: 'video/x-flv',
  [FileExtensions.M4V]: 'video/x-m4v',
  [FileExtensions.TS]: 'video/mp2t',
  [FileExtensions.M2TS]: 'video/mp2t',
  [FileExtensions.MPEG]: 'video/mpeg',
  [FileExtensions.MPG]: 'video/mpeg',
  [FileExtensions.OGV]: 'video/ogg',
  [FileExtensions.VOB]: 'video/dvd',

  // Audio Extensions
  [FileExtensions.MP3]: 'audio/mpeg',
  [FileExtensions.WAV]: 'audio/wav',
  [FileExtensions.AAC]: 'audio/aac',
  [FileExtensions.OGG]: 'audio/ogg',
  [FileExtensions.AIFF]: 'audio/aiff',
  [FileExtensions.AIF]: 'audio/aiff',
  [FileExtensions.FLAC]: 'audio/flac',
  [FileExtensions.ALAC]: 'audio/alac',
  [FileExtensions.M4A]: 'audio/mp4',
  [FileExtensions.OGA]: 'audio/ogg',
  [FileExtensions.WMA]: 'audio/x-ms-wma',
  [FileExtensions.OPUS]: 'audio/opus',
  [FileExtensions.MIDI]: 'audio/midi',
  [FileExtensions.MID]: 'audio/midi',
  [FileExtensions.DSD]: 'audio/dsd',
};

// ✅ Derive a union type from the values of MimeTypeMap
export type MimeType = (typeof MimeTypeMap)[keyof typeof MimeTypeMap];

// Optional: array of MIME types for runtime validation
export const MimeTypes: MimeType[] = Object.values(MimeTypeMap);
