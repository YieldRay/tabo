import { useState, useRef, useCallback } from "react";
import { Card, Box, Text, Button, Flex } from "@radix-ui/themes";
import { FileIcon, UploadIcon } from "@radix-ui/react-icons";

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}

export function FileSelector({ onFileSelect, accept = ".html", className = "" }: FileSelectorProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // 检查文件类型
      if (accept === ".html" && !file.name.toLowerCase().endsWith(".html")) {
        alert("请选择 HTML 文件");
        return;
      }
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box
      className={`
        fixed inset-0 
        flex items-center justify-center 
        bg-gradient-to-br from-slate-50 to-slate-100 
        p-6 
        ${className}
      `}
    >
      <Card
        className={`
          relative w-full max-w-lg mx-auto
          p-12 
          transition-all duration-300 ease-in-out
          cursor-pointer
          border-2 border-dashed
          backdrop-blur-sm
          ${
            isDragOver
              ? "border-blue-400 bg-blue-50/50 scale-105 shadow-2xl"
              : isHovered
              ? "border-slate-300 bg-white/90 shadow-xl"
              : "border-slate-200 bg-white/70 hover:bg-white/90"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 隐藏的文件输入 */}
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleInputChange} className="hidden" />

        <Flex direction="column" align="center" gap="6">
          {/* 图标区域 */}
          <Box
            className={`
              p-6 rounded-full 
              transition-all duration-300 ease-in-out
              ${isDragOver ? "bg-blue-100 text-blue-600 scale-110" : "bg-slate-100 text-slate-600 hover:bg-slate-150"}
            `}
          >
            {isDragOver ? <UploadIcon className="w-10 h-10" /> : <FileIcon className="w-10 h-10" />}
          </Box>

          {/* 文本内容 */}
          <Box className="text-center space-y-3">
            <Text
              size="5"
              weight="medium"
              className={`
                block
                transition-colors duration-300
                ${isDragOver ? "text-blue-700" : "text-slate-700"}
              `}
            >
              {isDragOver ? "释放文件以上传" : "选择或拖拽文件上传"}
            </Text>

            <Text size="3" className="text-slate-500 leading-relaxed">
              支持 HTML 文件格式
            </Text>
          </Box>

          {/* 按钮 */}
          <Button
            variant={isDragOver ? "solid" : "outline"}
            color={isDragOver ? "blue" : "gray"}
            size="3"
            className={`
              mt-4 px-8 py-3
              transition-all duration-300 ease-in-out
              font-medium
              ${isDragOver ? "shadow-lg scale-105" : "hover:shadow-md hover:scale-105"}
            `}
          >
            {isDragOver ? "上传文件" : "浏览文件"}
          </Button>
        </Flex>

        {/* 装饰性边框动画 */}
        {isDragOver && (
          <Box className="absolute inset-0 rounded-[inherit] border-2 border-blue-400 animate-pulse pointer-events-none" />
        )}
      </Card>
    </Box>
  );
}
