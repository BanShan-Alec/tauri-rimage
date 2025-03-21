import React, { memo } from "react";
import { cn } from "../../lib/utils";
import { ImageUp } from "lucide-react";

// 逻辑处理函数/组件
let FileDropzone = (props: IProps) => {
  // 组件渲染
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        "hover:border-primary hover:bg-primary/5"
      )}
      onClick={props.onSelect}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <ImageUp className="size-12 mb-2 text-muted-foreground" />
        <p className="text-lg font-medium">拖放图片到此处，或点击选择图片</p>
        <p className="text-sm text-muted-foreground">支持PNG、JPG和WebP格式</p>
      </div>
    </div>
  );
};

// props类型定义
interface IProps {
  onSelect: () => void;
}
// @ts-expect-error
FileDropzone = memo(FileDropzone);
export { FileDropzone };
