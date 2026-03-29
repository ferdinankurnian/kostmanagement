import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { TopBar, TopBarCenter } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getTagihan, type Tagihan } from "@/lib/tagihan";

export const Route = createFileRoute("/_main/pemilik/_main/tagihan")({
  component: TagihanPage,
});

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

const statusMap: Record<Tagihan["status"], { label: string; color: string }> = {
  belum_dibayar: { label: "Belum Dibayar", color: "text-muted-foreground" },
  menunggu_verifikasi: { label: "Menunggu", color: "text-yellow-500" },
  lunas: { label: "Lunas", color: "text-green-500" },
  ditolak: { label: "Ditolak", color: "text-red-500" },
};

function StatusText({ status }: { status: Tagihan["status"] }) {
  const { label, color } = statusMap[status];
  return <p className={`${color} text-sm absolute top-4 right-4`}>{label}</p>;
}

function TagihanPage() {
  const {
    data: tagihan = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tagihan"],
    queryFn: getTagihan,
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
      <div className="pt-20 px-4 space-y-4">
        <TopBar>
          <TopBarCenter>
            <h1 className="text-lg whitespace-nowrap">Tagihan</h1>
          </TopBarCenter>
        </TopBar>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-destructive">Gagal memuat tagihan.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  const menungguVerifikasi = tagihan.filter(
    (t) => t.status === "menunggu_verifikasi",
  );
  const lainnya = tagihan.filter((t) => t.status !== "menunggu_verifikasi");

  return (
    <div className="pt-20 space-y-6">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Tagihan</h1>
        </TopBarCenter>
      </TopBar>

      {tagihan.length === 0 ? (
        <p className="text-sm text-muted-foreground px-4">Belum ada tagihan.</p>
      ) : (
        <div className="space-y-4 px-4">
          {menungguVerifikasi.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground">Menunggu Verifikasi</p>
              <div className="flex flex-col gap-2">
                {menungguVerifikasi.map((t) => (
                  <div
                    key={t.id}
                    className="border rounded-xl p-4 space-y-3 relative"
                  >
                    <div className="space-y-1">
                      <h1 className="text-lg">Kamar {t.noKamar}</h1>
                      <p className="text-sm text-muted-foreground">
                        {t.periode}
                      </p>
                      <p className="text-yellow-500 text-sm absolute top-4 right-4">
                        Menunggu
                      </p>
                    </div>
                    <Separator />
                    <div className="flex flex-row justify-between items-center">
                      <h1 className="text-xl">{formatRupiah(t.jumlah)}</h1>
                      <Link to="/pemilik/tagihan/detail" search={{ id: t.id }}>
                        <Button size="sm" className="rounded-full">
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lainnya.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground">Semua Tagihan</p>
              <div className="flex flex-col gap-2">
                {lainnya.map((t) => (
                  <div
                    key={t.id}
                    className="border rounded-xl p-4 space-y-3 relative"
                  >
                    <div className="space-y-1">
                      <h1 className="text-lg">Kamar {t.noKamar}</h1>
                      <p className="text-sm text-muted-foreground">
                        {t.periode}
                      </p>
                      <StatusText status={t.status} />
                    </div>
                    <Separator />
                    <div className="flex flex-row justify-between items-center">
                      <h1 className="text-xl">{formatRupiah(t.jumlah)}</h1>
                      <Link to="/pemilik/tagihan/detail" search={{ id: t.id }}>
                        <Button size="sm" className="rounded-full">
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
