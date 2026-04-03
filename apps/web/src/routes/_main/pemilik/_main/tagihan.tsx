import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Loader2 } from "lucide-react";
import { TopBar, TopBarCenter } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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

const statusMap: Record<
  Tagihan["status"],
  {
    label: string;
    color: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "ghost"
      | "link";
  }
> = {
  belum_dibayar: {
    label: "Belum Dibayar",
    color: "text-muted-foreground",
    variant: "outline",
  },
  menunggu_verifikasi: {
    label: "Menunggu",
    color: "text-yellow-500",
    variant: "outline",
  },
  lunas: { label: "Lunas", color: "text-green-500", variant: "secondary" },
  ditolak: { label: "Ditolak", color: "text-red-500", variant: "destructive" },
};

function StatusText({ status }: { status: Tagihan["status"] }) {
  const { label, variant } = statusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
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
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Belum ada tagihan</EmptyTitle>
            <EmptyDescription>
              Tagihan bulanan akan muncul di sini setelah dibuat.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4 px-4">
          {menungguVerifikasi.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground">Menunggu Verifikasi</p>
              <div className="flex flex-col gap-2">
                {menungguVerifikasi.map((t) => (
                  <Link
                    key={t.id}
                    to="/pemilik/tagihan/detail"
                    search={{ id: t.id }}
                    className="block border rounded-xl p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h1 className="text-lg">Kamar {t.noKamar}</h1>
                        <p className="text-sm text-muted-foreground">
                          {t.periode}
                        </p>
                      </div>
                      <StatusText status="menunggu_verifikasi" />
                    </div>
                    <Separator />
                    <h1 className="text-xl">{formatRupiah(t.jumlah)}</h1>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {lainnya.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground">Semua Tagihan</p>
              <div className="flex flex-col gap-2">
                {lainnya.map((t) => (
                  <Link
                    key={t.id}
                    to="/pemilik/tagihan/detail"
                    search={{ id: t.id }}
                    className="block border rounded-xl p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h1 className="text-lg">Kamar {t.noKamar}</h1>
                        <p className="text-sm text-muted-foreground">
                          {t.periode}
                        </p>
                      </div>
                      <StatusText status={t.status} />
                    </div>
                    <Separator />
                    <h1 className="text-xl">{formatRupiah(t.jumlah)}</h1>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
