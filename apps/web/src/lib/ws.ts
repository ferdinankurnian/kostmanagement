import { API_URL } from "@/lib/config";

export type OnboardingStatus = {
  inviteId: string;
  code: string;
  name: string;
  noKamar: number;
  isUsed: boolean;
  user: {
    id: string;
    name: string;
    ktp: string | null;
    ktpStatus: "pending" | "approved" | "rejected" | null;
    ktpRejectionReason: string | null;
  } | null;
  tagihan: {
    id: string;
    status: "belum_dibayar" | "menunggu_verifikasi" | "lunas" | "ditolak";
    periode: string;
    jumlah: number;
    monthsPaid: number;
    buktiPembayaran: string | null;
    alasanPenolakan: string | null;
  } | null;
};

export function connectOnboardingWS(
  inviteId: string,
  onStatus: (data: OnboardingStatus) => void,
  onError?: (err: Event) => void,
): { close: () => void } {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = API_URL ? new URL(API_URL).host : window.location.host;
  const url = `${protocol}//${host}/api/ws/invite/${inviteId}`;

  let ws: WebSocket | null = null;
  let closed = false;
  let attempt = 0;

  function connect() {
    if (closed) return;

    ws = new WebSocket(url);

    ws.onopen = () => {
      attempt = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as OnboardingStatus;
        onStatus(data);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = (err) => {
      onError?.(err);
    };

    ws.onclose = () => {
      if (closed) return;

      attempt++;
      const delay = Math.min(1000 * 2 ** attempt, 10_000);
      setTimeout(connect, delay);
    };
  }

  connect();

  return {
    close() {
      closed = true;
      ws?.close();
    },
  };
}
