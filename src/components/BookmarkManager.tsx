import { useState, useMemo, useEffect, useRef } from "react";
import { Box, Flex } from "@radix-ui/themes";
import type { SortingState } from "@tanstack/react-table";
import { Sidebar } from "./Sidebar";
import { Breadcrumb } from "./Breadcrumb";
import { BookmarkList } from "./BookmarkList";
import type { BookmarkTreeNode, ViewMode, FlatBookmark } from "../types/bookmark";
import { getTopLevelFolders, getNodePath, getBookmarksInFolder, searchBookmarks } from "../utils/bookmarkUtils";

interface BookmarkManagerProps {
  bookmarkTree: BookmarkTreeNode[];
}

export function BookmarkManager({ bookmarkTree }: BookmarkManagerProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(2);
  const [sorting, setSorting] = useState<SortingState>([]);
  const hasInitialized = useRef(false);

  // Process bookmark tree data
  const folders = useMemo(() => {
    if (!bookmarkTree || bookmarkTree.length === 0) return [];
    return getTopLevelFolders(bookmarkTree);
  }, [bookmarkTree]);

  // Initialize with first folder if root has no bookmarks (only once)
  useEffect(() => {
    if (bookmarkTree && !hasInitialized.current && folders.length > 0) {
      // Check if root node (id: "0") has direct bookmark children (not in folders)
      const root = bookmarkTree[0];
      const directBookmarks = root.children?.filter((node) => node.url) || [];

      if (directBookmarks.length === 0) {
        // Root has no direct bookmarks, auto-select first folder
        setCurrentFolderId(folders[0].id);
      }
      hasInitialized.current = true;
    }
  }, [bookmarkTree, folders]);

  const currentPath = useMemo(() => {
    if (!bookmarkTree || !currentFolderId) return [];
    return getNodePath(bookmarkTree, currentFolderId);
  }, [bookmarkTree, currentFolderId]);

  // All bookmarks in current folder
  const currentFolderBookmarks = useMemo(() => {
    if (!bookmarkTree) return [];
    return getBookmarksInFolder(bookmarkTree, currentFolderId);
  }, [bookmarkTree, currentFolderId]);

  // All bookmarks across all folders (for global search)
  const allBookmarks = useMemo(() => {
    if (!bookmarkTree) return [];
    return getBookmarksInFolder(bookmarkTree, null);
  }, [bookmarkTree]);

  const filteredBookmarks = useMemo(() => {
    return searchBookmarks(currentFolderBookmarks, searchQuery);
  }, [currentFolderBookmarks, searchQuery]);

  // Handle bookmark selection from global search
  const handleBookmarkSelect = (bookmark: FlatBookmark) => {
    // Navigate to the bookmark's parent folder
    if (bookmark.parentId) {
      setCurrentFolderId(bookmark.parentId);
    }
    // Clear search query
    setSearchQuery("");
  };

  if (!bookmarkTree || bookmarkTree.length === 0) {
    return (
      <Flex align="center" justify="center" className="w-full h-full">
        <Box className="text-lg text-gray-600">暂无书签数据</Box>
      </Flex>
    );
  }

  return (
    <Flex className="w-full h-full overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        folders={folders}
        currentFolderId={currentFolderId}
        onFolderSelect={setCurrentFolderId}
        allBookmarks={allBookmarks}
        onBookmarkSelect={handleBookmarkSelect}
      />

      {/* Main Content Area */}
      <Flex direction="column" className="flex-1 overflow-hidden">
        {/* Breadcrumb with Search */}
        <Breadcrumb
          path={currentPath}
          onNavigate={setCurrentFolderId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Bookmark List with integrated view mode switcher */}
        <BookmarkList
          bookmarks={filteredBookmarks}
          viewMode={viewMode}
          sorting={sorting}
          onSortingChange={setSorting}
          onViewModeChange={setViewMode}
          currentFolderId={currentFolderId}
        />
      </Flex>
    </Flex>
  );
}
