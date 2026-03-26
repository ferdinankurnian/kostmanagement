import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bell, Clipboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_main/penghuni/_main/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const laporan = [
    {
      id: 1,
      kamar: "Kamar 2",
      deskripsi: "Dinding Retak",
      image: "/img/kamar2.jpg",
    },
    {
      id: 2,
      kamar: "Kamar 8",
      deskripsi: "Air keran ga bisa mati",
      image: "/img/kamar8.jpg",
    },
  ];
  return (
    <div className="pt-6 space-y-6">
      <div className="flex flex-row justify-between items-center px-4">
        <div className="flex flex-col">
          <h1 className="text-md text-foreground">
            {session?.user.name ?? "..."}
          </h1>
          <p className="text-xs text-muted-foreground">{formatted}</p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Link to="/penghuni/notification">
            <Button size="icon-lg" variant="outline" className="rounded-full">
              <Bell />
            </Button>
          </Link>
          <Avatar className="size-9">
            <AvatarImage src={session?.user.image ?? ""} />
            <AvatarFallback>
              {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4">
        <div className="bg-primary text-white p-3 rounded-xl space-y-4">
          <div className="flex flex-row justify-between">
            <p className="text-sm">Tagihan</p>
            <span className="p-1 bg-white rounded-sm">
              <Clipboard className="size-4 text-primary" />
            </span>
          </div>
          <div className="flex flex-row items-end gap-2">
            <p className="text-2xl leading-none">10</p>
            <p className="text-sm">Kamar</p>
          </div>
        </div>
        <div className="bg-primary text-white p-3 rounded-xl space-y-4">
          <div className="flex flex-row justify-between">
            <p className="text-sm">Pemberithuan</p>
            <span className="p-1 bg-white rounded-sm">
              <Clipboard className="size-4 text-primary" />
            </span>
          </div>
          <div className="flex flex-row items-end gap-2">
            <p className="text-2xl leading-none">1</p>
            <p className="text-sm">Tidak Lunas</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between px-4">
          <h1 className="text-lg">Informasi Kost</h1>
          <p className="text-sm text-muted-foreground">Lihat Semua</p>
        </div>

        <div className="flex flex-row gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
          {laporan.map((item) => (
            <div
              key={item.id}
              className="relative min-w-48 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
            >
              {/* background image */}
              <img
                src={item.image}
                alt={item.kamar}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* dark overlay */}
              <div className="absolute inset-0 bg-black/40" />

              {/* content */}
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-white font-semibold text-sm">{item.kamar}</p>
                <p className="text-white/80 text-xs truncate max-w-[120px]">
                  {item.deskripsi}
                </p>
              </div>

              {/* arrow icon (optional) */}
              <div className="absolute bottom-4 right-4 text-white">
                <ArrowUpRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4">
        <div className="flex flex-row justify-between">
          <h1 className="text-lg">Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Lihat Semua</p>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex flex-row justify-between items-center rounded-xl border p-3">
              <div className="flex flex-row gap-3">
                <div className="p-2 border rounded-md">
                  <img
                    src="/icon/clipboard-text.png"
                    alt="icon"
                    className="size-6"
                  />
                </div>
                <div>
                  <p>Kamar 5</p>
                  <p className="text-xs text-muted-foreground">17 Mar 2026</p>
                </div>
              </div>
              <p className="text-lg">Rp 1.000.000</p>
            </div>
            <div className="flex flex-row justify-between items-center rounded-xl border p-3">
              <div className="flex flex-row gap-3">
                <div className="p-2 border rounded-md">
                  <img
                    src="/icon/clipboard-text.png"
                    alt="icon"
                    className="size-6"
                  />
                </div>
                <div>
                  <p>Kamar 5</p>
                  <p className="text-xs text-muted-foreground">17 Mar 2026</p>
                </div>
              </div>
              <p className="text-lg">Rp 1.000.000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
