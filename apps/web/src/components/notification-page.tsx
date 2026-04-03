import {
  BellRing,
  CheckCheck,
  ChevronRight,
  Info,
  Loader2,
  ReceiptText,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  TopBar,
  TopBarCenter,
  TopBarLeft,
  TopBarRight,
} from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  getNotificationPermission,
  isNotificationEnabled,
  isNotificationSupported,
  type NotificationRole,
  requestNotificationAccess,
} from "@/lib/pwa-notifications";
import { useNotificationFeed } from "@/lib/use-notification-feed";

function getNotificationMeta(kind: "informasi" | "keluhan" | "tagihan") {
  switch (kind) {
    case "informasi":
      return {
        icon: Info,
        label: "Informasi",
      };
    case "keluhan":
      return {
        icon: Wrench,
        label: "Keluhan",
      };
    case "tagihan":
      return {
        icon: ReceiptText,
        label: "Tagihan",
      };
  }
}

function formatNotificationDate(date: string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface NotificationPageProps {
  audience: NotificationRole;
  onBack: () => void;
}

export function NotificationPage({ audience, onBack }: NotificationPageProps) {
  const { isError, isLoading, notifications, refetch, markAsRead } =
    useNotificationFeed(audience);
  const [permission, setPermission] = useState(getNotificationPermission());
  const [enabled, setEnabled] = useState(isNotificationEnabled());
  const notificationSupported = isNotificationSupported();

  useEffect(() => {
    setPermission(getNotificationPermission());
    setEnabled(isNotificationEnabled());
  }, []);

  const handleEnableNotification = async () => {
    const nextPermission = await requestNotificationAccess();
    setPermission(nextPermission);
    setEnabled(isNotificationEnabled());
  };

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
      <TopBar>
        <TopBarLeft>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronRight className="size-6 rotate-180" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Notifikasi</h1>
        </TopBarCenter>
        <TopBarRight>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const unreadKeys = notifications
                  .filter((n) => !n.isRead)
                  .map((n) => n.key);
                if (unreadKeys.length > 0) {
                  void markAsRead(unreadKeys);
                }
              }}
              disabled={notifications.every((n) => n.isRead)}
            >
              <CheckCheck className="size-5" />
            </Button>
          )}
        </TopBarRight>
      </TopBar>

      {!enabled && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
              <BellRing className="size-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-semibold">Notifikasi perangkat</h2>
              <p className="text-sm text-muted-foreground">
                Aktifkan izin notifikasi supaya update tagihan, keluhan, dan
                informasi bisa muncul di device. Supaya terasa seperti app HP,
                install juga web ini ke home screen.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {!notificationSupported
              ? "Browser ini belum mendukung notification service worker."
              : permission === "denied"
                ? "Status: diblokir browser. Izinkan lagi dari setting browser."
                : "Status: belum aktif."}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void handleEnableNotification()}
              disabled={!notificationSupported || permission === "denied"}
            >
              Aktifkan notif
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center pt-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">Gagal memuat notifikasi.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BellRing className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Belum ada notifikasi</EmptyTitle>
            <EmptyDescription>
              Saat ada update baru, daftar notifikasi akan muncul di sini.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup className="gap-3">
          {notifications.map((notification) => {
            const meta = getNotificationMeta(notification.kind);
            const Icon = meta.icon;

            return (
              <Item
                key={notification.id}
                variant="outline"
                asChild
                role="listitem"
                className={
                  notification.isRead
                    ? ""
                    : "border-l-4 border-l-yellow-500 bg-yellow-50"
                }
              >
                <a
                  href={notification.href}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead([notification.key]);
                    }
                  }}
                >
                  <ItemMedia variant="icon">
                    <Icon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="flex items-center gap-2">
                      {notification.title}
                      <span className="text-xs font-normal text-muted-foreground">
                        {meta.label}
                      </span>
                    </ItemTitle>
                    <ItemDescription>
                      {notification.description}
                    </ItemDescription>
                    <p className="text-xs text-muted-foreground">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRight className="size-4" />
                  </ItemActions>
                </a>
              </Item>
            );
          })}
        </ItemGroup>
      )}
    </div>
  );
}
