import { Box, Flex, Text, SegmentedControl } from "@radix-ui/themes";
import type { ViewMode } from "../types/bookmark";

interface ViewModeSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeSwitcher({ viewMode, onViewModeChange }: ViewModeSwitcherProps) {
  return (
    <Box className="border-b border-gray-200 bg-white px-4 py-2">
      <Flex align="center" justify="between">
        <Flex align="center" gap="2">
          <Text size="2" weight="medium" className="text-gray-600">
            视图模式:
          </Text>
          <SegmentedControl.Root
            value={viewMode.toString()}
            onValueChange={(value) => onViewModeChange(parseInt(value) as ViewMode)}
            size="1"
          >
            <SegmentedControl.Item value="1">单列</SegmentedControl.Item>
            <SegmentedControl.Item value="2">双列</SegmentedControl.Item>
            <SegmentedControl.Item value="4">四列</SegmentedControl.Item>
          </SegmentedControl.Root>
        </Flex>
      </Flex>
    </Box>
  );
}
