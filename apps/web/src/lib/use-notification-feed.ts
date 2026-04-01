import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInformasiList } from "@/lib/informasi";
import { getKeluhanList } from "@/lib/keluhan";
import {
  extractNotificationKey,
  getNotificationReadStatus,
  markNotificationAsRead,
  type ReadStatusMap,
} from "@/lib/notification";
import {
  type AppNotification,
  buildNotificationFeed,
} from "@/lib/notification-feed";
import type { NotificationRole } from "@/lib/pwa-notifications";
import { getTagihan } from "@/lib/tagihan";

export interface NotificationWithReadStatus extends AppNotification {
  key: string;
  isRead: boolean;
}

interface UseNotificationFeedOptions {
  enabled?: boolean;
  refetchInterval?: false | number;
}

export function useNotificationFeed(
  role: NotificationRole | null,
  options?: UseNotificationFeedOptions,
) {
  const enabled = Boolean(role) && (options?.enabled ?? true);
  const queryClient = useQueryClient();

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

  const readStatusQuery = useQuery({
    enabled,
    queryFn: getNotificationReadStatus,
    queryKey: ["notification-read-status"],
    refetchInterval: options?.refetchInterval,
  });

  const rawNotifications = role
    ? buildNotificationFeed(role, {
        informasi: informasiQuery.data ?? [],
        keluhan: keluhanQuery.data ?? [],
        tagihan: tagihanQuery.data ?? [],
      })
    : [];

  const readStatusMap: ReadStatusMap = readStatusQuery.data ?? {};
  const notifications: NotificationWithReadStatus[] = rawNotifications.map(
    (n) => {
      const key = extractNotificationKey(n.id) || n.id;
      return {
        ...n,
        key,
        isRead: !!readStatusMap[key],
      };
    },
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (keys: string[]) => markNotificationAsRead(keys),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification-read-status"],
      });
    },
  });

  return {
    isError:
      informasiQuery.isError ||
      keluhanQuery.isError ||
      tagihanQuery.isError ||
      readStatusQuery.isError,
    isLoading:
      enabled &&
      (informasiQuery.isLoading ||
        keluhanQuery.isLoading ||
        tagihanQuery.isLoading ||
        readStatusQuery.isLoading),
    notifications,
    unreadCount,
    refetch: async () => {
      await Promise.all([
        informasiQuery.refetch(),
        keluhanQuery.refetch(),
        tagihanQuery.refetch(),
        readStatusQuery.refetch(),
      ]);
    },
    markAsRead: (keys: string[]) => markReadMutation.mutateAsync(keys),
  };
}
