export interface BookmarkTreeNode {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
  dateGroupModified?: number;
  index?: number;
  parentId?: string;
  children?: BookmarkTreeNode[];
}

export interface FlatBookmark {
  id: string;
  title: string;
  url: string;
  dateAdded: number;
  parentId: string;
  parentPath: string[];
}

export type SortField = "title" | "dateAdded";
export type SortOrder = "asc" | "desc";
export type ViewMode = 1 | 2 | 4;

export interface AppState {
  currentFolderId: string | null;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  viewMode: ViewMode;
}
