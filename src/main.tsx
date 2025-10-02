/**
 * The entry file for the normal browser environment, not the extension environment.
 */
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Box, Theme } from "@radix-ui/themes";
import { BookmarkManager } from "@/src/components/BookmarkManager";
import { FileSelector } from "@/src/components/FileSelector";
import "./style.css";

import { BookmarksParser } from "netscape-bookmark-parser/web";
import type { BookmarkTreeNode } from "./types/bookmark";

function parseBookmark(htmlContent: string): BookmarkTreeNode[] {
  interface NetscapeBookmarkNode {
    [key: string]: NetscapeBookmarkNode | string;
  }

  const bookmarksTree = BookmarksParser.parse(htmlContent).toJSON() as NetscapeBookmarkNode;
  console.log(bookmarksTree);
  let idCounter = 0;

  function generateId(): string {
    return (++idCounter).toString();
  }

  function convertNode(node: NetscapeBookmarkNode | string, title: string, parentId?: string): BookmarkTreeNode {
    const id = generateId();

    if (typeof node === "string") {
      return {
        id,
        title,
        url: node,
        parentId,
      };
    } else {
      const children: BookmarkTreeNode[] = [];
      for (const [childTitle, childNode] of Object.entries(node)) {
        children.push(convertNode(childNode, childTitle, id));
      }

      return {
        id,
        title,
        parentId,
        children,
      };
    }
  }

  const rootId = generateId();
  const root: BookmarkTreeNode = {
    id: rootId,
    title: "收藏夹栏",
    children: [],
  };

  for (const [title, node] of Object.entries(bookmarksTree)) {
    root.children!.push(convertNode(node, title, rootId));
  }

  return [root];
}

function App() {
  const [data, setData] = useState<BookmarkTreeNode[]>([]);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const htmlContent = e.target?.result as string;
      setData(parseBookmark(htmlContent));
    };
    reader.readAsText(file);
  };

  return (
    <Box className="w-screen h-screen">
      {data.length ? (
        <BookmarkManager bookmarkTree={data} />
      ) : (
        <FileSelector onFileSelect={handleFileSelect} accept=".html" />
      )}
    </Box>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="95%">
      <App />
    </Theme>
  </StrictMode>
);
