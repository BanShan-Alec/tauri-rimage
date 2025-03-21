export interface CompressionOptions {
  format: "jpg" | "png" | "webp";
  quality: number;
}

export interface FileWithPath {
  name: string;
  path: string;
  size: number;
}
