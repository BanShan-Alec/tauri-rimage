import React, { memo } from "react";
import { CompressionOptions as CompressionOptionsType } from "../../lib/types";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const QualitySlider = ({
  quality,
  onQualityChange,
}: {
  quality: number;
  onQualityChange: (value: number[]) => void;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <Label>质量</Label>
      <span className="text-sm text-muted-foreground">{quality}%</span>
    </div>
    <Slider
      value={[quality]}
      min={1}
      max={100}
      step={1}
      onValueChange={onQualityChange}
    />
  </div>
);

let CompressionOptions = (props: IProps) => {
  // 解构props
  const { options, onOptionsChange } = props;

  // 逻辑处理函数
  const handleFormatChange = (value: string) => {
    onOptionsChange({
      ...options,
      format: value as "jpg" | "png" | "webp",
    });
  };

  const handleQualityChange = (value: number[]) => {
    onOptionsChange({ ...options, quality: value[0] });
  };

  //   const handleCompressionChange = (value: number[]) => {
  //     onOptionsChange({ ...options, compression: value[0] });
  //   };

  //   const handleFilterChange = (value: string) => {
  //     onOptionsChange({ ...options, filter: parseInt(value) });
  //   };

  //   const handleAlphaQualityChange = (value: number[]) => {
  //     onOptionsChange({ ...options, alphaQuality: value[0] });
  //   };

  // 组件渲染
  return (
    <div>
      <Label className="my-4">输出格式</Label>
      <Tabs
        defaultValue={options.format}
        value={options.format}
        onValueChange={handleFormatChange}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jpg">JPG</TabsTrigger>
          <TabsTrigger value="png">PNG</TabsTrigger>
          <TabsTrigger value="webp">WebP</TabsTrigger>
        </TabsList>
        <TabsContent value="jpg" className="space-y-4 pt-4">
          <QualitySlider
            quality={options.quality}
            onQualityChange={handleQualityChange}
          />
        </TabsContent>
        <TabsContent value="png" className="space-y-4 pt-4">
          <QualitySlider
            quality={options.quality}
            onQualityChange={handleQualityChange}
          />
          {/* <div className="space-y-2">
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
                            onValueChange={handleCompressionChange}
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
                            onValueChange={handleFilterChange}
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
                    </div> */}
        </TabsContent>
        <TabsContent value="webp" className="space-y-4 pt-4">
          <QualitySlider
            quality={options.quality}
            onQualityChange={handleQualityChange}
          />
          {/* <div className="space-y-2">
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
                            onValueChange={handleAlphaQualityChange}
                        />
                    </div> */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// props类型定义
interface IProps {
  options: CompressionOptionsType;
  onOptionsChange: (options: CompressionOptionsType) => void;
}
// @ts-expect-error
CompressionOptions = memo(CompressionOptions);
export { CompressionOptions };
