import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getNotificationPermission,
  isNotificationEnabled,
  isNotificationSupported,
  requestNotificationAccess,
  setNotificationEnabled,
  showDeviceNotification,
} from "@/lib/pwa-notifications";

export const Route = createFileRoute("/_main/penghuni/pengaturan/notification")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  const router = useRouter();
  const [permission, setPermission] = useState(getNotificationPermission());
  const [enabled, setEnabled] = useState(isNotificationEnabled());
  const [toggling, setToggling] = useState(false);
  const notificationSupported = isNotificationSupported();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      setToggling(true);
      const result = await requestNotificationAccess();
      setToggling(false);
      setPermission(result);
      const nowEnabled = isNotificationEnabled();
      setEnabled(nowEnabled);

      if (nowEnabled) {
        await showDeviceNotification({
          body: "Notifikasi device untuk Kost Management sudah aktif.",
          tag: "test:pengaturan",
          title: "Tes notifikasi",
          url: "/penghuni/notification",
        });
      }
    } else {
      setNotificationEnabled(false);
      setEnabled(false);
    }
  };

  const handleTest = async () => {
    await showDeviceNotification({
      body: "Notifikasi device untuk Kost Management sudah aktif.",
      tag: "test:pengaturan",
      title: "Tes notifikasi",
      url: "/penghuni/notification",
    });
  };

  const statusText = !notificationSupported
    ? "Browser ini belum mendukung notification service worker."
    : permission === "denied"
      ? "Diblokir browser. Izinkan lagi dari setting browser."
      : enabled
        ? "Notifikasi aktif."
        : "Notifikasi tidak aktif.";

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.history.back()}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Notifikasi</h1>
        </TopBarCenter>
      </TopBar>

      <div className="rounded-2xl border bg-card divide-y">
        <div className="flex items-center justify-between p-4">
          <div className="space-y-0.5">
            <Label htmlFor="notif-toggle" className="text-sm font-medium">
              Notifikasi perangkat
            </Label>
            <p className="text-xs text-muted-foreground">
              Update tagihan, kamar, dan informasi kost
            </p>
          </div>
          {toggling ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              id="notif-toggle"
              checked={enabled}
              onCheckedChange={(checked) => void handleToggle(checked)}
              disabled={!notificationSupported || permission === "denied"}
            />
          )}
        </div>

        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground">{statusText}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card divide-y">
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => void handleTest()}
            disabled={!notificationSupported || !enabled}
          >
            Kirim notifikasi tes
          </Button>
        </div>
      </div>
    </div>
  );
}
