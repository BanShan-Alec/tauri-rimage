import React, { memo } from "react";
import { FileWithPath } from "../../lib/types";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { X } from "lucide-react";

// 私有常量
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 组件定义
let FileList = (props: IProps) => {
  // 解构props
  const { files, onRemove, onClearAll } = props;

  // 组件渲染
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">已选择 {files.length} 个文件</h3>
        <Button variant="outline" size="sm" onClick={onClearAll}>
          清除全部
        </Button>
      </div>
      <ScrollArea className="h-[200px] rounded-md border p-2">
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
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
                onClick={() => onRemove(index)}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// props类型定义
interface IProps {
  files: FileWithPath[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
}
// @ts-expect-error
FileList = memo(FileList);
export { FileList };
