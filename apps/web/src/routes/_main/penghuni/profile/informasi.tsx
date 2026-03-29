import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { getSettings, parseInformasiKostCards } from "@/lib/settings";

export const Route = createFileRoute("/_main/penghuni/profile/informasi")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const cards = parseInformasiKostCards(settings?.informasi_kost_cards);

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
          <h1 className="text-lg whitespace-nowrap">Informasi Kost</h1>
        </TopBarCenter>
      </TopBar>

      {isLoading ? (
        <div className="flex items-center justify-center pt-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {settings?.nama_kost && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-1">
              <p className="text-sm font-medium">Nama Kost</p>
              <p className="text-sm text-muted-foreground">
                {settings.nama_kost}
              </p>
            </div>
          )}

          {settings?.harga_sewa && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-1">
              <p className="text-sm font-medium">Harga Sewa</p>
              <p className="text-sm text-muted-foreground">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(parseInt(settings.harga_sewa, 10))}{" "}
                / bulan
              </p>
            </div>
          )}

          {(settings?.nama_bank || settings?.no_rekening) && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <p className="text-sm font-medium">Info Pembayaran</p>
              {settings.nama_bank && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank</span>
                  <span>{settings.nama_bank}</span>
                </div>
              )}
              {settings.no_rekening && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">No. Rekening</span>
                  <span>{settings.no_rekening}</span>
                </div>
              )}
              {settings.nama_pemilik_rekening && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Atas Nama</span>
                  <span>{settings.nama_pemilik_rekening}</span>
                </div>
              )}
            </div>
          )}

          {cards.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Informasi Tambahan</p>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border bg-card p-4 space-y-2"
                >
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
