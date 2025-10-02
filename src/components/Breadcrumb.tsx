import { Fragment } from "react";
import { Box, Flex, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import type { BookmarkTreeNode } from "../types/bookmark";

interface BreadcrumbProps {
  path: BookmarkTreeNode[];
  onNavigate: (folderId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Breadcrumb({ path, onNavigate, searchQuery, onSearchChange }: BreadcrumbProps) {
  const handleNavigate = (folderId: string | null) => {
    // Clear search query when navigating
    if (searchQuery) {
      onSearchChange("");
    }
    onNavigate(folderId);
  };

  return (
    <Box className="border-b border-gray-200 bg-white px-3 py-1.5">
      <Flex align="center" justify="between" gap="4">
        {/* Breadcrumb Navigation */}
        <Flex align="center" gap="2" className="flex-1 min-w-0">
          <button
            onClick={() => handleNavigate(null)}
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors whitespace-nowrap border-none bg-transparent cursor-pointer p-0"
          >
            <Text size="1" weight="medium">
              书签
            </Text>
          </button>
          {path.map((node, index) => {
            const isLast = index === path.length - 1;
            return (
              <Fragment key={node.id}>
                <ChevronRightIcon width={12} height={12} color="gray" />
                <button
                  onClick={() => {
                    if (!isLast) {
                      handleNavigate(node.id);
                    }
                  }}
                  className={`
                    transition-colors truncate border-none bg-transparent p-0
                    ${isLast ? "cursor-default" : "cursor-pointer hover:text-blue-600"}
                  `}
                  disabled={isLast}
                >
                  <Text
                    size="1"
                    weight={isLast ? "bold" : "medium"}
                    className={isLast ? "text-gray-900" : "text-gray-600"}
                  >
                    {node.title}
                  </Text>
                </button>
              </Fragment>
            );
          })}
        </Flex>

        {/* Search Input */}
        <Box className="flex-shrink-0 w-64">
          <TextField.Root
            placeholder="搜索书签..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            size="1"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={14} height={14} />
            </TextField.Slot>
          </TextField.Root>
        </Box>
      </Flex>
    </Box>
  );
}
