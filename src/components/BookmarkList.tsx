import { useMemo, useRef, useEffect } from "react";
import { Box, Card, Flex, Text, Grid, Link, SegmentedControl } from "@radix-ui/themes";
import { BookmarkIcon, CaretSortIcon, CaretUpIcon, CaretDownIcon } from "@radix-ui/react-icons";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type Row,
  type Table,
} from "@tanstack/react-table";
import { useVirtualizer, type VirtualItem, type Virtualizer } from "@tanstack/react-virtual";
import type { FlatBookmark, ViewMode } from "../types/bookmark";

interface BookmarkListProps {
  bookmarks: FlatBookmark[];
  viewMode: ViewMode;
  sorting: SortingState;
  onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
  onViewModeChange: (mode: ViewMode) => void;
  currentFolderId: string | null;
}

const columnHelper = createColumnHelper<FlatBookmark>();

export function BookmarkList({
  bookmarks,
  viewMode,
  sorting,
  onSortingChange,
  onViewModeChange,
  currentFolderId,
}: BookmarkListProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when folder changes
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [currentFolderId]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "名称",
        cell: (info) => {
          const bookmark = info.row.original;
          const date = new Date(bookmark.dateAdded);
          return (
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="group block">
              <Flex gap="1.5" align="start">
                <BookmarkIcon width={14} height={14} className="flex-shrink-0 text-blue-500 mt-0.5" />
                <Box className="flex-1 min-w-0">
                  <Flex align="center" justify="between" gap="2" className="mb-0.5">
                    <Text
                      size="1"
                      weight="medium"
                      className="truncate text-blue-600 group-hover:text-blue-800 leading-tight"
                    >
                      {bookmark.title}
                    </Text>
                    <time
                      dateTime={date.toISOString()}
                      className="text-gray-500 text-[9px] whitespace-nowrap flex-shrink-0"
                    >
                      {date.toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </time>
                  </Flex>
                  <Text size="1" className="truncate block text-gray-400 text-xs leading-tight">
                    {bookmark.url}
                  </Text>
                </Box>
              </Flex>
            </a>
          );
        },
      }),
      columnHelper.accessor("dateAdded", {
        header: "添加时间",
        cell: () => null, // This column is only for sorting, display is handled in title cell
      }),
    ],
    []
  );

  const table = useReactTable({
    data: bookmarks,
    columns,
    state: {
      sorting,
    },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (bookmarks.length === 0) {
    return (
      <Flex align="center" justify="center" className="flex-1 p-8">
        <Text color="gray">此文件夹中没有书签</Text>
      </Flex>
    );
  }

  return (
    <Box ref={tableContainerRef} className="flex-1 overflow-auto relative h-full">
      {/* Table header with sorting controls and view mode switcher */}
      <Box className="sticky top-0 z-10 bg-white border-b border-gray-200 px-3 py-2">
        <Flex align="center" justify="between" gap="4">
          <Flex align="center" gap="2">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <button
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={`
                    flex items-center gap-1 transition-colors cursor-pointer
                    border-none bg-transparent p-0 text-xs
                    ${header.column.getIsSorted() ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}
                  `}
                >
                  <Text size="1" weight="medium">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Text>
                  {header.column.getIsSorted() ? (
                    header.column.getIsSorted() === "asc" ? (
                      <CaretUpIcon width={12} height={12} />
                    ) : (
                      <CaretDownIcon width={12} height={12} />
                    )
                  ) : (
                    <CaretSortIcon width={12} height={12} />
                  )}
                </button>
              ))
            )}
          </Flex>

          {/* View Mode Switcher */}
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
      </Box>

      {/* Virtualized bookmark grid */}
      <Box className="p-1">
        <BookmarkGridBody table={table} tableContainerRef={tableContainerRef} viewMode={viewMode} />
      </Box>
    </Box>
  );
}

interface BookmarkGridBodyProps {
  table: Table<FlatBookmark>;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  viewMode: ViewMode;
}

function BookmarkGridBody({ table, tableContainerRef, viewMode }: BookmarkGridBodyProps) {
  const { rows } = table.getRowModel();

  // Group rows by view mode for grid layout
  const groupedRows = useMemo(() => {
    const groups = [];
    for (let i = 0; i < rows.length; i += viewMode) {
      groups.push(rows.slice(i, i + viewMode));
    }
    return groups;
  }, [rows, viewMode]);

  // Keep the row virtualizer in the lowest component to avoid unnecessary re-renders
  // IMPORTANT: Pass viewMode as key to force re-initialization when view mode changes
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: groupedRows.length,
    estimateSize: () => 100, // Smaller estimate for compact layout
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 3,
  });

  return (
    <Box
      key={`view-${viewMode}`}
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: "relative",
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const rowGroup = groupedRows[virtualRow.index];
        if (!rowGroup) return null;
        return (
          <BookmarkGridRow
            key={virtualRow.index}
            virtualRow={virtualRow}
            rowVirtualizer={rowVirtualizer}
            rowGroup={rowGroup}
            viewMode={viewMode}
          />
        );
      })}
    </Box>
  );
}

interface BookmarkGridRowProps {
  virtualRow: VirtualItem;
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLDivElement>;
  rowGroup: Row<FlatBookmark>[];
  viewMode: ViewMode;
}

function BookmarkGridRow({ virtualRow, rowVirtualizer, rowGroup, viewMode }: BookmarkGridRowProps) {
  // Convert viewMode to string for Radix UI Grid columns prop
  const columns = String(viewMode);

  return (
    <Box
      data-index={virtualRow.index}
      ref={(node) => rowVirtualizer.measureElement(node)}
      className="absolute top-0 left-0 w-full"
      style={{
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      <Grid columns={columns} gap="1" width="auto">
        {rowGroup.map((row) => (
          <Card
            key={row.id}
            className="hover:shadow-xs transition-shadow border border-gray-100"
            title={`${row.original.title}\n${row.original.url}`}
          >
            {row.getVisibleCells().map((cell) => (
              <Box key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Box>
            ))}
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
