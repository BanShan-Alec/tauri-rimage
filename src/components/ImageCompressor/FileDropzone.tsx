import React, { memo } from 'react';
import { cn } from "../../lib/utils";

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
    );
};

// props类型定义
interface IProps {
    onSelect: () => void;
}
// @ts-expect-error
FileDropzone = memo(FileDropzone);
export { FileDropzone };
