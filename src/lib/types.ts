export interface CompressionOptions {
  format: 'jpg' | 'png' | 'webp';
  quality: number;
  alphaQuality?: number; // 用于WebP
  filter?: number;       // 用于PNG
  compression?: number;  // 用于PNG
}

export interface FileWithPath {
  name: string;
  path: string;
  size: number;
}
