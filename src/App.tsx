import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Flex, Spinner, Text } from "@radix-ui/themes";
import { useQueryBookmarksTree } from "@/src/hooks/bookmark";
import { BookmarkManager } from "@/src/components/BookmarkManager";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Bookmark />
    </QueryClientProvider>
  );
}

function Bookmark() {
  const { data, isLoading, error } = useQueryBookmarksTree(queryClient);

  if (isLoading) {
    return (
      <Flex align="center" justify="center" gap="3" className="w-screen h-screen">
        <Spinner size="3" />
        <Text size="3" color="gray">
          加载书签中...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex align="center" justify="center" className="w-screen h-screen">
        <Text size="3" color="red">
          错误: {(error as Error).message}
        </Text>
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Flex align="center" justify="center" className="w-screen h-screen">
        <Text size="3" color="gray">
          暂无书签数据
        </Text>
      </Flex>
    );
  }
  console.log(data);

  return (
    <Box className="w-screen h-screen">
      <BookmarkManager bookmarkTree={data} />
    </Box>
  );
}
