import React, { memo } from 'react';
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

let CompressResults = (props: IProps) => {
    // 解构props
    const { results } = props;

    // 组件渲染
    return (
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
    );
};

// props类型定义
interface IProps {
    results: string[];
}

// @ts-expect-error
CompressResults = memo(CompressResults);
export { CompressResults };
