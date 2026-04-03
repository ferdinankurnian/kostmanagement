import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, FileText, Loader2, XCircle } from "lucide-react";
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

function StatusBadge({ status }: { status: Tagihan["status"] }) {
  const map = {
    belum_dibayar: {
      label: "Belum Dibayar",
      variant: "outline" as const,
      icon: Clock,
    },
    menunggu_verifikasi: {
      label: "Menunggu Verifikasi",
      variant: "secondary" as const,
      icon: Clock,
    },
    lunas: {
      label: "Lunas",
      variant: "default" as const,
      icon: CheckCircle2,
    },
    ditolak: {
      label: "Ditolak",
      variant: "destructive" as const,
      icon: XCircle,
    },
  };
  const config = map[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
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

  return (
    <div className="pt-20 space-y-4">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Tagihan</h1>
        </TopBarCenter>
      </TopBar>

      {tagihan.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Belum ada tagihan</EmptyTitle>
            <EmptyDescription>
              Tagihan bulanan akan muncul di sini setelah dibuat.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="px-4 space-y-3">
        {tagihan.map((t) => (
          <Link
            key={t.id}
            to="/pemilik/tagihan/detail"
            search={{ id: t.id }}
            className="block rounded-xl border bg-card p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{t.periode}</span>
              <StatusBadge status={t.status} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kamar {t.noKamar}</span>
              <span className="font-semibold">{formatRupiah(t.jumlah)}</span>
            </div>

            <div className="text-xs text-muted-foreground">
              Jatuh tempo:{" "}
              {new Date(t.tanggalJatuhTempo).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            {t.namaPenghuni && (
              <div className="text-xs text-muted-foreground">
                Penghuni: {t.namaPenghuni}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
