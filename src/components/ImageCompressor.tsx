import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { openUrl } from "@tauri-apps/plugin-opener";
// import { writeBinaryFile, BaseDirectory, createDir } from "@tauri-apps/api/fs";
import { CompressionOptions, FileWithPath } from "../lib/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

const ImageCompressor = () => {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [outputDir, setOutputDir] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [options, setOptions] = useState<CompressionOptions>({
    format: "jpg",
    quality: 80,
    alphaQuality: 80,
    filter: 0,
    compression: 6,
  });

  // 处理文件拖放
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles: FileWithPath[] = [];
    const items = e.dataTransfer.items;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            // @ts-ignore - Tauri adds path property to File objects
            const path = file.path || "";
            droppedFiles.push({
              name: file.name,
              path,
              size: file.size,
            });
          }
        }
      }
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "webp"],
          },
        ],
      });

      if (Array.isArray(selected)) {
        const newFiles = selected.map((path) => {
          const name = path.split(/[\\\/]/).pop() || "";
          return { name, path, size: 0 };
        });
        setFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error("选择文件出错:", error);
    }
  };

  // 选择输出目录
  const selectOutputDir = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (typeof selected === "string") {
        setOutputDir(selected);
      }
    } catch (error) {
      console.error("选择输出目录出错:", error);
    }
  };

  // 批量压缩图片
  const compressImages = async () => {
    if (files.length === 0 || !outputDir) {
      alert("请选择图片和输出目录");
      return;
    }

    setIsCompressing(true);
    setProgress(0);
    setResults([]);

    try {
      // 确保输出目录存在
      // 注意：这里使用Tauri的API，不需要创建目录，因为outputDir是用户选择的已存在目录

      const filePaths = files.map((file) => file.path);
      const compressionResults = (await invoke("batch_compress_images", {
        srcPaths: filePaths,
        destDir: outputDir,
        options: {
          format: options.format,
          quality: options.quality,
          alphaQuality: options.alphaQuality,
          filter: options.filter,
          compression: options.compression,
        },
      })) as string[];

      setResults(compressionResults);
    } catch (error) {
      console.error("压缩图片出错:", error);
      setResults([`错误: ${error}`]);
    } finally {
      setIsCompressing(false);
      setProgress(100);
    }
  };

  // 清除所有选择的文件
  const clearFiles = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
  };

  // 移除单个文件
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>图片批量压缩工具</CardTitle>
          <CardDescription className="flex justify-between">
            支持PNG、JPG和WebP格式的图片压缩{" "}
            <b
              className="cursor-pointer"
              onClick={() => {
                openUrl("https://github.com/SalOne22/rimage");
              }}
            >
              Power By Rimage
            </b>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 拖放区域 */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              "hover:border-primary hover:bg-primary/5"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleFileSelect}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-10 mb-2 text-muted-foreground"
              >
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                <line x1="16" x2="22" y1="5" y2="5"></line>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              <p className="text-lg font-medium">
                拖放图片到此处，或点击选择图片
              </p>
              <p className="text-sm text-muted-foreground">
                支持PNG、JPG和WebP格式
              </p>
            </div>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">
                  已选择 {files.length} 个文件
                </h3>
                <Button variant="outline" size="sm" onClick={clearFiles}>
                  清除全部
                </Button>
              </div>
              <ScrollArea className="h-[200px] rounded-md border p-2">
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-4"
                        >
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* 输出目录选择 */}
          <div className="mt-6 flex items-center gap-4">
            <Button onClick={selectOutputDir} variant="outline">
              选择输出目录
            </Button>
            {outputDir && (
              <p className="text-sm text-muted-foreground truncate flex-1">
                输出到: {outputDir}
              </p>
            )}
          </div>

          <Separator className="my-6" />

          {/* 压缩选项 */}
          <div>
            <h3 className="text-lg font-medium mb-4">压缩选项</h3>
            <Tabs
              defaultValue="jpg"
              onValueChange={(value) =>
                setOptions({
                  ...options,
                  format: value as "jpg" | "png" | "webp",
                })
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="jpg">JPG</TabsTrigger>
                <TabsTrigger value="png">PNG</TabsTrigger>
                <TabsTrigger value="webp">WebP</TabsTrigger>
              </TabsList>
              <TabsContent value="jpg" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>质量</Label>
                    <span className="text-sm text-muted-foreground">
                      {options.quality}%
                    </span>
                  </div>
                  <Slider
                    value={[options.quality]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setOptions({ ...options, quality: value[0] })
                    }
                  />
                </div>
              </TabsContent>
              <TabsContent value="png" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>压缩级别</Label>
                    <span className="text-sm text-muted-foreground">
                      {options.compression}
                    </span>
                  </div>
                  <Slider
                    value={[options.compression || 6]}
                    min={0}
                    max={9}
                    step={1}
                    onValueChange={(value) =>
                      setOptions({ ...options, compression: value[0] })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>过滤器</Label>
                    <span className="text-sm text-muted-foreground">
                      {options.filter}
                    </span>
                  </div>
                  <Select
                    value={String(options.filter || 0)}
                    onValueChange={(value) =>
                      setOptions({ ...options, filter: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择过滤器" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">无</SelectItem>
                      <SelectItem value="1">Sub</SelectItem>
                      <SelectItem value="2">Up</SelectItem>
                      <SelectItem value="3">Avg</SelectItem>
                      <SelectItem value="4">Paeth</SelectItem>
                      <SelectItem value="5">自适应</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="webp" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>质量</Label>
                    <span className="text-sm text-muted-foreground">
                      {options.quality}%
                    </span>
                  </div>
                  <Slider
                    value={[options.quality]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setOptions({ ...options, quality: value[0] })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Alpha通道质量</Label>
                    <span className="text-sm text-muted-foreground">
                      {options.alphaQuality}%
                    </span>
                  </div>
                  <Slider
                    value={[options.alphaQuality || 80]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setOptions({ ...options, alphaQuality: value[0] })
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={clearFiles}
            disabled={isCompressing || files.length === 0}
          >
            清除
          </Button>
          <Button
            onClick={compressImages}
            disabled={isCompressing || files.length === 0 || !outputDir}
          >
            {isCompressing ? "压缩中..." : "开始压缩"}
          </Button>
        </CardFooter>
      </Card>

      {/* 压缩进度 */}
      {isCompressing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>压缩进度</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* 压缩结果 */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>压缩结果</CardTitle>
            <CardDescription>共 {results.length} 个结果</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-md",
                      result.startsWith("成功")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    )}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageCompressor;
