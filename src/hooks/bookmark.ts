import { useEffect } from "react";
import { useQuery, type QueryClient } from "@tanstack/react-query";

export function useQueryBookmarksTree(queryClient: QueryClient) {
  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["bookmarksTree"] });
    const events = [
      browser.bookmarks.onCreated,
      browser.bookmarks.onRemoved,
      browser.bookmarks.onChanged,
      browser.bookmarks.onMoved,
    ];
    events.forEach((ev) => ev.addListener(invalidate));
    return () => events.forEach((ev) => ev.removeListener(invalidate));
  }, [queryClient]);

  return useQuery({
    queryKey: ["bookmarksTree"],
    queryFn: () => browser.bookmarks.getTree(),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}
