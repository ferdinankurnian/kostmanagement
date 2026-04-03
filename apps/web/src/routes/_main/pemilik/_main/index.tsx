import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";
import { NotificationPromptBanner } from "@/components/notification-prompt-banner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getAllKamar } from "@/lib/kamar";
import { getKeluhanList } from "@/lib/keluhan";
import { getSettings } from "@/lib/settings";
import { getTagihan } from "@/lib/tagihan";
import { useNotificationFeed } from "@/lib/use-notification-feed";

export const Route = createFileRoute("/_main/pemilik/_main/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  const { unreadCount } = useNotificationFeed("pemilik");

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const { data: tagihanList } = useQuery({
    queryKey: ["tagihan"],
    queryFn: getTagihan,
  });

  const { data: kamarList } = useQuery({
    queryKey: ["rooms"],
    queryFn: getAllKamar,
  });

  const isDefaultPin = settings?.is_default_pin === "true";

  const totalPenghuni =
    kamarList?.filter((k) => k.penghuni !== null).length ?? 0;

  const tagihanBelumLunas =
    tagihanList?.filter((t) => t.status === "belum_dibayar").length ?? 0;

  const pembayaranMasuk =
    tagihanList?.sort(
      (a, b) =>
        new Date(b.tanggalBayar ?? b.createdAt).getTime() -
        new Date(a.tanggalBayar ?? a.createdAt).getTime(),
    ) ?? [];

  const pembayaranHariIni = pembayaranMasuk.filter((t) => {
    if (!t.tanggalBayar) return false;
    const d = new Date(t.tanggalBayar);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const pembayaranSebelumnya = pembayaranMasuk.filter((t) => {
    if (!t.tanggalBayar) return true;
    const d = new Date(t.tanggalBayar);
    const now = new Date();
    return !(
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const formatTanggal = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const { data: keluhanList = [] } = useQuery({
    queryKey: ["keluhan"],
    queryFn: getKeluhanList,
  });

  const laporan = keluhanList
    .filter((item) => item.status !== "selesai")
    .slice(0, 5);

  const getTagihanIconColor = (status: string) => {
    if (status === "belum_dibayar") return "text-red-600";
    if (status === "lunas" || status === "menunggu_verifikasi")
      return "text-green-600";
    return "text-muted-foreground";
  };
  return (
    <div className="pt-6 space-y-6">
      <div className="flex flex-row justify-between items-center px-4">
        <div className="flex flex-col">
          <h1 className="text-md text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">{formatted}</p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Link to="/pemilik/notification">
            <Button
              size="icon-lg"
              variant="outline"
              className="rounded-full relative"
            >
              <Bell />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/pemilik/profile">
            <Avatar className="size-9">
              <AvatarImage src={session?.user.image ?? ""} />
              <AvatarFallback>
                {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
      <div className="space-y-3">
        <NotificationPromptBanner />
        {isDefaultPin && (
          <div className="mx-4 flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-3">
            <ShieldAlert className="size-5 text-yellow-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-800">
                PIN Keamanan Masih Default
              </p>
              <p className="text-xs text-yellow-700">
                PIN Anda masih <strong>1234</strong>. Segera ganti di pengaturan
                untuk keamanan.
              </p>
              <Link to="/pemilik/pengaturan/pin">
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 h-7 text-xs border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                >
                  Ganti PIN
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 px-4">
        <Link to="/pemilik/kamar">
          <div className="bg-primary text-white p-3 rounded-xl space-y-4 active:scale-95 transition-all">
            <div className="flex flex-row justify-between">
              <p className="text-sm">Total Penghuni</p>
              <ChevronRight className="size-4" />
            </div>
            <div className="flex flex-row items-end gap-2">
              <p className="text-2xl leading-none">{totalPenghuni}</p>
              <p className="text-sm">Kamar</p>
            </div>
          </div>
        </Link>
        <Link to="/pemilik/tagihan">
          <div className="bg-primary text-white p-3 rounded-xl space-y-4 active:scale-95 transition-all">
            <div className="flex flex-row justify-between">
              <p className="text-sm">Tagihan</p>
              <ChevronRight className="size-4" />
            </div>
            <div className="flex flex-row items-end gap-2">
              <p className="text-2xl leading-none">{tagihanBelumLunas}</p>
              <p className="text-sm">Tidak Lunas</p>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between px-4">
          <h1 className="text-lg">Laporan Kost</h1>
          <Link href="/pemilik/keluhan">
            <p className="text-sm text-muted-foreground hover:text-foreground">
              Lihat Semua
            </p>
          </Link>
        </div>

        <div className="flex flex-row gap-4 overflow-x-auto px-4 pb-2 scrollbar-none">
          {laporan.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada laporan keluhan
            </p>
          ) : (
            laporan.map((item) => (
              <Link
                key={item.id}
                to="/pemilik/keluhan/detail"
                search={{ id: item.id }}
                className="relative min-w-48 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
              >
                {item.fotoUrls[0] ? (
                  <img
                    src={item.fotoUrls[0]}
                    alt={item.judul}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-white font-semibold text-sm">
                    Kamar {item.noKamar}
                  </p>
                  <p className="text-white/80 text-xs truncate max-w-[120px]">
                    {item.judul}
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 text-white">
                  <ArrowUpRight size={18} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4">
        <div className="flex flex-row">
          <h1 className="text-lg">Tagihan</h1>
        </div>
        {pembayaranMasuk.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Belum ada pembayaran masuk
          </p>
        ) : (
          <div className="space-y-3">
            {pembayaranHariIni.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Hari Ini</p>
                <div className="space-y-2">
                  {pembayaranHariIni.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-row justify-between items-center rounded-xl border p-3"
                    >
                      <div className="flex flex-row gap-3">
                        <div className="p-2 border rounded-md">
                          <ReceiptText
                            className={`size-6 ${getTagihanIconColor(t.status)}`}
                            strokeWidth={1.3}
                          />
                        </div>
                        <div>
                          <p>Kamar {t.noKamar}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.periode}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg">{formatRupiah(t.jumlah)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pembayaranSebelumnya.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sebelumnya</p>
                <div className="space-y-2">
                  {pembayaranSebelumnya.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-row justify-between items-center rounded-xl border p-3"
                    >
                      <div className="flex flex-row gap-3">
                        <div className="p-2 border rounded-md">
                          <ReceiptText
                            className={`size-6 ${getTagihanIconColor(t.status)}`}
                            strokeWidth={1.3}
                          />
                        </div>
                        <div>
                          <p>Kamar {t.noKamar}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.tanggalBayar
                              ? formatTanggal(t.tanggalBayar)
                              : t.periode}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg">{formatRupiah(t.jumlah)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
