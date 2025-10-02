import { useState } from "react";
import { Box, ScrollArea, Text, Flex } from "@radix-ui/themes";
import { ChevronRightIcon, CubeIcon } from "@radix-ui/react-icons";
import { useTree } from "@headless-tree/react";
import { syncDataLoaderFeature, hotkeysCoreFeature } from "@headless-tree/core";
import type { BookmarkTreeNode, FlatBookmark } from "../types/bookmark";
import { createTreeDataStructure } from "../utils/bookmarkUtils";
import { GlobalSearch } from "./GlobalSearch";

interface SidebarProps {
  folders: BookmarkTreeNode[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
  allBookmarks: FlatBookmark[];
  onBookmarkSelect: (bookmark: FlatBookmark) => void;
}

export function Sidebar({ folders, currentFolderId, onFolderSelect, allBookmarks, onBookmarkSelect }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (folders.length === 0) {
    return (
      <Box className="w-60 border-r border-gray-200 bg-gray-50 p-4">
        <Text size="2" color="gray">
          暂无书签文件夹
        </Text>
      </Box>
    );
  }

  const { data, getItem, getChildren } = createTreeDataStructure(folders);

  // Create a virtual root
  const rootId = "virtual-root";
  const rootItem: BookmarkTreeNode = {
    id: rootId,
    title: "书签",
    children: folders,
  };

  const extendedData: Record<string, BookmarkTreeNode> = { ...data, [rootId]: rootItem };
  const extendedGetChildren = (itemId: string) => {
    if (itemId === rootId) {
      return folders.map((f) => f.id);
    }
    return getChildren(itemId);
  };

  const tree = useTree<BookmarkTreeNode>({
    rootItemId: rootId,
    state: { expandedItems, focusedItem: currentFolderId },
    setExpandedItems,
    getItemName: (item) => item.getItemData()?.title || "",
    isItemFolder: (item) => {
      const itemData = item.getItemData();
      return !itemData?.url && !!itemData?.children;
    },
    dataLoader: {
      getItem: (itemId: string) => extendedData[itemId],
      getChildren: extendedGetChildren,
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });

  return (
    <Flex direction="column" className="w-60 border-r border-gray-200 bg-gray-50 h-full">
      <Flex align="center" justify="between" className="p-3 border-b border-gray-200">
        <Text size="2" weight="bold" className="text-gray-700">
          书签文件夹
        </Text>
        <GlobalSearch allBookmarks={allBookmarks} onBookmarkSelect={onBookmarkSelect} />
      </Flex>
      <ScrollArea>
        <Box {...tree.getContainerProps()} className="p-2">
          {tree.getItems().map((item) => {
            const itemId = item.getId();
            const isSelected = itemId === currentFolderId;
            const isRoot = itemId === rootId;

            // Skip rendering the virtual root
            if (isRoot) return null;

            // Check if the folder has sub-folders (not just bookmarks)
            const childFolderIds = extendedGetChildren(itemId);
            const hasSubFolders = childFolderIds.length > 0;

            return (
              <button
                {...item.getProps()}
                key={itemId}
                onClick={() => {
                  if (item.isFolder() && hasSubFolders) {
                    if (item.isExpanded()) {
                      item.collapse();
                    } else {
                      item.expand();
                    }
                  }
                  onFolderSelect(itemId);
                }}
                className={`
                  w-full text-left px-2 py-1.5 rounded text-sm cursor-pointer
                  hover:bg-gray-200 transition-colors
                  flex items-center gap-1
                  ${isSelected ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"}
                `}
                style={{
                  paddingLeft: `${(item.getItemMeta().level - 1) * 12 + 8}px`,
                }}
              >
                {item.isFolder() &&
                  (hasSubFolders ? (
                    <ChevronRightIcon
                      width={16}
                      height={16}
                      className={`text-gray-400 transition-transform duration-200 ease-in-out ${
                        item.isExpanded() ? "rotate-90" : ""
                      }`}
                    />
                  ) : (
                    <CubeIcon width={16} height={16} className="text-gray-400" />
                  ))}
                <Text size="2" className="truncate">
                  {item.getItemName()}
                </Text>
              </button>
            );
          })}
        </Box>
      </ScrollArea>
    </Flex>
  );
}
