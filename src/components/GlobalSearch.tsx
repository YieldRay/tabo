import { useState } from "react";
import { Dialog, Flex, TextField, Select, Text, Box, IconButton, ScrollArea, Card, Tooltip } from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross2Icon, LetterCaseCapitalizeIcon, CodeIcon } from "@radix-ui/react-icons";
import type { FlatBookmark } from "../types/bookmark";

interface GlobalSearchProps {
  allBookmarks: FlatBookmark[];
  onBookmarkSelect: (bookmark: FlatBookmark) => void;
}

type SearchMode = "title" | "url" | "all";

export function GlobalSearch({ allBookmarks, onBookmarkSelect }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const filteredBookmarks = allBookmarks.filter((bookmark) => {
    if (!query.trim()) return false;

    const searchTexts =
      searchMode === "all"
        ? [bookmark.title, bookmark.url]
        : searchMode === "title"
        ? [bookmark.title]
        : [bookmark.url];

    try {
      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(query, flags);
        return searchTexts.some((text) => regex.test(text));
      } else {
        const q = caseSensitive ? query : query.toLowerCase();
        return searchTexts.some((searchText) => {
          const text = caseSensitive ? searchText : searchText.toLowerCase();
          return text.includes(q);
        });
      }
    } catch (error) {
      // Invalid regex, fall back to string search
      return searchTexts.some((text) => text.toLowerCase().includes(query.toLowerCase()));
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Tooltip content="全局搜索">
        <Dialog.Trigger>
          <IconButton size="2" variant="ghost" color="gray">
            <MagnifyingGlassIcon width={16} height={16} />
          </IconButton>
        </Dialog.Trigger>
      </Tooltip>

      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>全局搜索</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          在所有书签中搜索
        </Dialog.Description>

        <Flex direction="column" gap="3">
          {/* Search Bar: Select + Input with toggle buttons */}
          <Flex gap="2" align="center">
            {/* Search Mode Select */}
            <Select.Root value={searchMode} onValueChange={(value) => setSearchMode(value as SearchMode)}>
              <Select.Trigger style={{ width: "auto", minWidth: 100 }} />
              <Select.Content>
                <Select.Item value="all">全部</Select.Item>
                <Select.Item value="title">按标题</Select.Item>
                <Select.Item value="url">按网址</Select.Item>
              </Select.Content>
            </Select.Root>

            {/* Search Input with toggle buttons inside */}
            <Box style={{ flex: 1 }}>
              <TextField.Root
                placeholder={`搜索${searchMode === "all" ? "标题或网址" : searchMode === "title" ? "标题" : "网址"}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="2"
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon width={16} height={16} />
                </TextField.Slot>
                <TextField.Slot>
                  <Flex gap="3" align="center">
                    <Tooltip content="区分大小写">
                      <IconButton
                        size="1"
                        variant={caseSensitive ? "solid" : "ghost"}
                        color={caseSensitive ? "blue" : "gray"}
                        onClick={() => setCaseSensitive(!caseSensitive)}
                      >
                        <LetterCaseCapitalizeIcon width={14} height={14} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="使用正则表达式">
                      <IconButton
                        size="1"
                        variant={useRegex ? "solid" : "ghost"}
                        color={useRegex ? "blue" : "gray"}
                        onClick={() => setUseRegex(!useRegex)}
                      >
                        <CodeIcon width={14} height={14} />
                      </IconButton>
                    </Tooltip>
                  </Flex>
                </TextField.Slot>
              </TextField.Root>
            </Box>
          </Flex>

          {/* Results */}
          <Box>
            <Text size="1" weight="medium" className="mb-2 block text-gray-600">
              找到 {filteredBookmarks.length} 个结果
            </Text>
            <ScrollArea
              scrollbars="vertical"
              style={{ maxHeight: "400px" }}
              className="[&>[data-radix-scroll-area-viewport]>*]:max-w-full"
            >
              <Flex direction="column" gap="2">
                {filteredBookmarks.length === 0 && query.trim() && (
                  <Text size="2" color="gray" align="center" className="py-8 overflow-ellipsis">
                    没有找到匹配的书签
                  </Text>
                )}
                {filteredBookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="p-3 hover:bg-gray-50 transition-colors overflow-hidden">
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block">
                      <Flex direction="column" gap="1" className="min-w-0">
                        <Text size="2" weight="medium" className="text-blue-600 truncate hover:underline">
                          {bookmark.title}
                        </Text>
                        <Text size="1" className="text-gray-500 truncate">
                          {bookmark.url}
                        </Text>
                      </Flex>
                    </a>
                  </Card>
                ))}
              </Flex>
            </ScrollArea>
          </Box>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
