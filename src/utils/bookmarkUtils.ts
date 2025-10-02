import type { BookmarkTreeNode, FlatBookmark, SortField, SortOrder } from "../types/bookmark";

/**
 * Get all top-level folders from bookmark tree
 */
export function getTopLevelFolders(tree: BookmarkTreeNode[]): BookmarkTreeNode[] {
  if (!tree || tree.length === 0) return [];

  const root = tree[0];
  if (!root.children) return [];

  return root.children.filter((node) => !node.url && node.children);
}

/**
 * Find a bookmark node by ID in the tree
 */
export function findNodeById(tree: BookmarkTreeNode[], id: string): BookmarkTreeNode | null {
  if (!tree || tree.length === 0) return null;

  const search = (nodes: BookmarkTreeNode[]): BookmarkTreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  return search(tree);
}

/**
 * Get path to a node (list of parent IDs)
 */
export function getNodePath(tree: BookmarkTreeNode[], nodeId: string): BookmarkTreeNode[] {
  if (!tree || tree.length === 0) return [];

  const path: BookmarkTreeNode[] = [];

  const search = (nodes: BookmarkTreeNode[], currentPath: BookmarkTreeNode[]): boolean => {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === nodeId) {
        path.push(...newPath);
        return true;
      }
      if (node.children && search(node.children, newPath)) {
        return true;
      }
    }
    return false;
  };

  search(tree, []);

  // Filter out root node (id: "0") and nodes with empty titles
  return path.filter((node) => node.id !== "0" && node.title && node.title.trim() !== "");
}

/**
 * Flatten bookmark tree to get all bookmarks (with URLs only)
 */
export function flattenBookmarks(tree: BookmarkTreeNode[], parentPath: BookmarkTreeNode[] = []): FlatBookmark[] {
  if (!tree || tree.length === 0) return [];

  const result: FlatBookmark[] = [];

  const traverse = (nodes: BookmarkTreeNode[], path: BookmarkTreeNode[]) => {
    for (const node of nodes) {
      if (node.url) {
        // This is a bookmark (has URL)
        result.push({
          id: node.id,
          title: node.title,
          url: node.url,
          dateAdded: node.dateAdded || 0,
          parentId: node.parentId || "",
          parentPath: path.map((p) => p.id),
        });
      } else if (node.children) {
        // This is a folder, traverse its children
        traverse(node.children, [...path, node]);
      }
    }
  };

  traverse(tree, parentPath);
  return result;
}

/**
 * Get bookmarks for a specific folder
 */
export function getBookmarksInFolder(tree: BookmarkTreeNode[], folderId: string | null): FlatBookmark[] {
  if (!folderId) {
    // Return all bookmarks
    return flattenBookmarks(tree);
  }

  const folder = findNodeById(tree, folderId);
  if (!folder || !folder.children) return [];

  const path = getNodePath(tree, folderId);
  return flattenBookmarks(folder.children, path);
}

/**
 * Search bookmarks by query
 */
export function searchBookmarks(bookmarks: FlatBookmark[], query: string): FlatBookmark[] {
  if (!query.trim()) return bookmarks;

  const lowerQuery = query.toLowerCase();
  return bookmarks.filter(
    (bookmark) => bookmark.title.toLowerCase().includes(lowerQuery) || bookmark.url.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort bookmarks by field and order
 */
export function sortBookmarks(bookmarks: FlatBookmark[], field: SortField, order: SortOrder): FlatBookmark[] {
  const sorted = [...bookmarks].sort((a, b) => {
    let comparison = 0;

    if (field === "title") {
      comparison = a.title.localeCompare(b.title, "zh-CN");
    } else if (field === "dateAdded") {
      comparison = a.dateAdded - b.dateAdded;
    }

    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Create a data structure for headless-tree
 */
export function createTreeDataStructure(folders: BookmarkTreeNode[]) {
  const dataMap: Record<string, BookmarkTreeNode> = {};

  const processNode = (node: BookmarkTreeNode) => {
    dataMap[node.id] = node;
    if (node.children) {
      node.children.forEach(processNode);
    }
  };

  folders.forEach(processNode);

  return {
    data: dataMap,
    getItem: (itemId: string) => dataMap[itemId],
    getChildren: (itemId: string) => {
      const item = dataMap[itemId];
      if (!item || !item.children) return [];
      return item.children.filter((child) => !child.url).map((child) => child.id);
    },
  };
}
