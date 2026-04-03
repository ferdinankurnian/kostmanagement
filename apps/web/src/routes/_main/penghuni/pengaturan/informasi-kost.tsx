import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";

export const Route = createFileRoute(
  "/_main/penghuni/pengaturan/informasi-kost",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
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
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat informasi kost.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

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

      <div className="rounded-2xl border bg-card p-5 space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">Nama Kost</p>
          <p>{settings?.nama_kost || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Harga per bulan</p>
          <p>{settings?.harga_sewa ? `Rp ${settings.harga_sewa}` : "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Alamat</p>
          <p className="whitespace-pre-wrap">{settings?.alamat || "-"}</p>
        </div>
      </div>
    </div>
  );
}
