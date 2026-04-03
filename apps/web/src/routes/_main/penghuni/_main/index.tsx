import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bell, Clipboard, ReceiptText } from "lucide-react";
import { NotificationPromptBanner } from "@/components/notification-prompt-banner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getInformasiList } from "@/lib/informasi";
import { getTagihan } from "@/lib/tagihan";
import { useNotificationFeed } from "@/lib/use-notification-feed";

export const Route = createFileRoute("/_main/penghuni/_main/")({
  component: RouteComponent,
});

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function RouteComponent() {
  const { data: session } = authClient.useSession();

  const { unreadCount } = useNotificationFeed("penghuni");

  const { data: informasiList = [] } = useQuery({
    queryKey: ["informasi"],
    queryFn: getInformasiList,
  });

  const { data: tagihanList = [] } = useQuery({
    queryKey: ["tagihan"],
    queryFn: getTagihan,
  });

  const noKamar = (session?.user as { noKamar?: number })?.noKamar;
  const tagihanBelumLunas = tagihanList.filter(
    (t) => t.status === "belum_dibayar" || t.status === "ditolak",
  ).length;

  const tagihanTerbaru = tagihanList
    .filter(
      (t) =>
        t.status === "belum_dibayar" ||
        t.status === "menunggu_verifikasi" ||
        t.status === "ditolak",
    )
    .slice(0, 5);

  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="pt-6 space-y-6">
      <div
        data-tour="header"
        className="flex flex-row justify-between items-center px-4"
      >
        <div className="flex flex-col">
          <h1 className="text-md text-foreground">
            {session?.user.name ?? "..."}
          </h1>
          <p className="text-xs text-muted-foreground">{formatted}</p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Link to="/penghuni/notification">
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
          <Link to="/penghuni/profile">
            <Avatar className="size-9">
              <AvatarImage src={session?.user.image ?? ""} />
              <AvatarFallback>
                {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {(session?.user as { onboarding?: string | null })?.onboarding !==
        "tour" && <NotificationPromptBanner />}

      <div data-tour="stats" className="grid grid-cols-2 gap-2 px-4">
        <div className="bg-primary text-white p-3 rounded-xl space-y-4">
          <div className="flex flex-row justify-between">
            <p className="text-sm">Kamar Saya</p>
            <span className="p-1 bg-white rounded-sm">
              <Clipboard className="size-4 text-primary" />
            </span>
          </div>
          <div className="flex flex-row items-end gap-2">
            <p className="text-2xl leading-none">{noKamar ?? "-"}</p>
            <p className="text-sm">Kamar</p>
          </div>
        </div>
        <div className="bg-primary text-white p-3 rounded-xl space-y-4">
          <div className="flex flex-row justify-between">
            <p className="text-sm">Tagihan</p>
            <span className="p-1 bg-white rounded-sm">
              <Clipboard className="size-4 text-primary" />
            </span>
          </div>
          <div className="flex flex-row items-end gap-2">
            <p className="text-2xl leading-none">{tagihanBelumLunas}</p>
            <p className="text-sm">Belum Lunas</p>
          </div>
        </div>
      </div>

      <div data-tour="informasi" className="flex flex-col gap-2">
        <div className="flex flex-row justify-between px-4">
          <h1 className="text-lg">Informasi Kost</h1>
          <Link to="/penghuni/informasi">
            <p className="text-sm text-muted-foreground hover:text-foreground">
              Lihat Semua
            </p>
          </Link>
        </div>

        <div className="flex flex-row gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
          {informasiList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada informasi</p>
          ) : (
            informasiList.map((item) => (
              <Link
                key={item.id}
                to="/penghuni/informasi/detail"
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
                    {item.judul}
                  </p>
                  <p className="text-white/80 text-xs truncate max-w-[120px]">
                    {item.deskripsi}
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

      <div data-tour="pembayaran" className="flex flex-col gap-2 px-4">
        <div className="flex flex-row justify-between">
          <h1 className="text-lg">Tagihan</h1>
          <Link to="/penghuni/tagihan">
            <p className="text-sm text-muted-foreground hover:text-foreground">
              Lihat Semua
            </p>
          </Link>
        </div>
        {tagihanTerbaru.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Tidak ada tagihan aktif
          </p>
        ) : (
          <div className="space-y-2">
            {tagihanTerbaru.map((t) => (
              <Link
                key={t.id}
                to="/penghuni/tagihan"
                className="flex flex-row justify-between items-center rounded-xl border p-3"
              >
                <div className="flex flex-row gap-3">
                  <div className="p-2 border rounded-md">
                    <ReceiptText className="size-6" strokeWidth={1.3} />
                  </div>
                  <div>
                    <p>Kamar {t.noKamar}</p>
                    <p className="text-xs text-muted-foreground">{t.periode}</p>
                  </div>
                </div>
                <p className="text-lg">{formatRupiah(t.jumlah)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
