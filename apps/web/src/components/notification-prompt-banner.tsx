import { BellRing, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationAccess,
} from "@/lib/pwa-notifications";

const DISMISSED_KEY = "kost-management:notif-prompt:dismissed";

export function NotificationPromptBanner() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;
    if (getNotificationPermission() === "granted") return;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;
    setVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  }, []);

  const handleEnable = useCallback(async () => {
    setLoading(true);
    const result = await requestNotificationAccess();
    setLoading(false);
    if (result === "granted") {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="mx-4 flex items-start gap-3 rounded-xl border border-blue-300 bg-blue-50 p-3">
      <BellRing className="size-5 text-blue-600 mt-0.5 shrink-0" />
      <div className="space-y-1 flex-1">
        <p className="text-sm font-medium text-blue-800">Aktifkan Notifikasi</p>
        <p className="text-xs text-blue-700">
          Dapatkan notifikasi untuk tagihan, keluhan, dan informasi terbaru
          langsung di perangkat Anda.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-1 h-7 text-xs border-blue-400 text-blue-800 hover:bg-blue-100"
          onClick={() => void handleEnable()}
          disabled={loading}
        >
          {loading ? "Meminta izin..." : "Aktifkan"}
        </Button>
      </div>
    </div>
  );
}
