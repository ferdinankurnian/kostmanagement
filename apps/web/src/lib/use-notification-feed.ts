import { useQuery } from "@tanstack/react-query";
import { getInformasiList } from "@/lib/informasi";
import { getKeluhanList } from "@/lib/keluhan";
import { buildNotificationFeed } from "@/lib/notification-feed";
import type { NotificationRole } from "@/lib/pwa-notifications";
import { getTagihan } from "@/lib/tagihan";

interface UseNotificationFeedOptions {
  enabled?: boolean;
  refetchInterval?: false | number;
}

export function useNotificationFeed(
  role: NotificationRole | null,
  options?: UseNotificationFeedOptions,
) {
  const enabled = Boolean(role) && (options?.enabled ?? true);

  const informasiQuery = useQuery({
    enabled,
    queryFn: getInformasiList,
    queryKey: ["informasi"],
    refetchInterval: options?.refetchInterval,
  });

  const keluhanQuery = useQuery({
    enabled,
    queryFn: getKeluhanList,
    queryKey: ["keluhan"],
    refetchInterval: options?.refetchInterval,
  });

  const tagihanQuery = useQuery({
    enabled,
    queryFn: getTagihan,
    queryKey: ["tagihan"],
    refetchInterval: options?.refetchInterval,
  });

  const notifications = role
    ? buildNotificationFeed(role, {
        informasi: informasiQuery.data ?? [],
        keluhan: keluhanQuery.data ?? [],
        tagihan: tagihanQuery.data ?? [],
      })
    : [];

  return {
    isError:
      informasiQuery.isError || keluhanQuery.isError || tagihanQuery.isError,
    isLoading:
      enabled &&
      (informasiQuery.isLoading ||
        keluhanQuery.isLoading ||
        tagihanQuery.isLoading),
    notifications,
    refetch: async () => {
      await Promise.all([
        informasiQuery.refetch(),
        keluhanQuery.refetch(),
        tagihanQuery.refetch(),
      ]);
    },
  };
}
