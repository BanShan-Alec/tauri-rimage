import React, { memo } from "react";
import { useState, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { openUrl } from "@tauri-apps/plugin-opener";
import { downloadDir } from "@tauri-apps/api/path";
import { CompressionOptions, FileWithPath } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useMount, useUnmount } from "react-use";
import { toast } from "sonner";
import { FileDropzone } from "./FileDropzone";
import { FileList } from "./FileList";
import { CompressionOptions as CompressionOptionsComponent } from "./CompressionOptions";
import { CompressResults } from "./CompressResults";
import { stat } from "@tauri-apps/plugin-fs";
//私有常量

//可抽离的逻辑处理函数/组件

let ImageCompressor = (props: IProps) => {
  //变量声明、解构

  //组件状态
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [outputDir, setOutputDir] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [options, setOptions] = useState<CompressionOptions>({
    format: "jpg",
    quality: 80,
  });
  const unlistenRef = useRef<(() => void) | undefined>();

  //网络IO

  //数据转换

  //逻辑处理函数
  const setFilesByPaths = async (paths: string[]) => {
    if (isLoading) {
      toast.error("操作频繁，请稍候再试");
      return;
    }
    setIsLoading(true);
    try {
      const existingPaths = new Set(files.map((f) => f.path));
      const newFiles = await Promise.all(
        paths
          .filter((path) => !existingPaths.has(path))
          .map(async (path) => {
            try {
              const stats = await stat(path);
              return {
                name: path.split(/[\\/]/).pop() || "",
                path,
                size: stats.size || 0,
              };
            } catch (error) {
              console.error("获取文件信息出错:", error);
              return {
                name: path.split(/[\\/]/).pop() || "",
                path,
                size: 0,
              };
            }
          })
      );
      setFiles((prev) => [...prev, ...newFiles]);
    } finally {
      setIsLoading(false);
    }
  };

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
      selected && setFilesByPaths(selected);
    } catch (error) {
      console.error("选择文件出错:", error);
    }
  };

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

  const compressImages = async () => {
    if (files.length === 0 || !outputDir) {
      alert("请选择图片和输出目录");
      return;
    }

    setIsCompressing(true);
    setProgress(0);
    setResults([]);

    try {
      const filePaths = files.map((file) => file.path);
      const compressionResults = (await invoke("batch_compress_images", {
        srcPaths: filePaths,
        destDir: outputDir,
        options: {
          format: options.format,
          quality: options.quality,
        },
      })) as string[];

      setResults(compressionResults);
    } catch (error) {
      console.error("压缩图片出错:", error);
      setResults([`错误: ${error}`]);
    } finally {
      setIsCompressing(false);
      setProgress(100);
      toast.info("压缩完成");
      requestAnimationFrame(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  };

  const clearFiles = useCallback(() => {
    setFiles([]);
    setResults([]);
    setProgress(0);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  //组件Effect
  useMount(async () => {
    try {
      const defaultOutputDir = await downloadDir();
      setOutputDir(defaultOutputDir);
    } catch (error) {
      console.error("获取下载目录失败:", error);
    }

    unlistenRef.current = await getCurrentWebview().onDragDropEvent((event) => {
      if (event.payload.type === "drop") {
        const selected = event.payload.paths;
        // 过滤掉非图片文件
        const imageFiles = selected.filter((path) =>
          /\.(png|jpg|jpeg|webp)$/i.test(path)
        );
        if (imageFiles.length !== selected.length) {
          toast.error("仅支持PNG、JPG和WebP格式的图片");
          return;
        }
        setFilesByPaths(imageFiles);
      }
    });
  });

  useUnmount(() => {
    if (unlistenRef.current) {
      unlistenRef.current();
    }
  });

  //组件渲染
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
          <FileDropzone onSelect={handleFileSelect} />

          {files.length > 0 && (
            <FileList
              files={files}
              onRemove={removeFile}
              onClearAll={clearFiles}
            />
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

          <CompressionOptionsComponent
            options={options}
            onOptionsChange={setOptions}
          />

          <Separator className="mt-8" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="secondary"
            onClick={clearFiles}
            disabled={isCompressing}
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
      {results.length > 0 && <CompressResults results={results} />}
    </div>
  );
};

//props类型定义
interface IProps {}

// @ts-expect-error
ImageCompressor = memo(ImageCompressor);
export { ImageCompressor };
