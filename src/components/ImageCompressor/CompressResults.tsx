import React, { memo, useState } from "react";
import { cn } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown } from "lucide-react";

let CompressResults = (props: IProps) => {
  // 解构props
  const { results } = props;
  const [isOpen, setIsOpen] = useState(true);

  const successResults = results.filter((result) => result.startsWith("成功"));

  // 组件渲染
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>压缩结果</CardTitle>
              <CardDescription>
                成功 {successResults.length} 个，失败{" "}
                {results.length - successResults.length} 个
              </CardDescription>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "transform rotate-180"
              )}
            />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
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
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// props类型定义
interface IProps {
  results: string[];
}

// @ts-expect-error
CompressResults = memo(CompressResults);
export { CompressResults };
