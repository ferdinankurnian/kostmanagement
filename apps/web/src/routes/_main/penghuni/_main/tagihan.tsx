import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { FileUpload } from "@/components/ui/file-upload";
import { getTagihan, submitTagihan, type Tagihan } from "@/lib/tagihan";
import { uploadBukti } from "@/lib/upload";

export const Route = createFileRoute("/_main/penghuni/_main/tagihan")({
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
      icon: AlertCircle,
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
  const queryClient = useQueryClient();
  const [reuploadId, setReuploadId] = useState<string | null>(null);
  const [bukti, setBukti] = useState<string | null>(null);

  const {
    data: tagihan = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tagihan"],
    queryFn: getTagihan,
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) =>
      submitTagihan(id, {
        metodePembayaran: "transfer",
        buktiPembayaran: bukti ?? "",
      }),
    onSuccess: async () => {
      toast.success("Bukti berhasil diunggah kembali");
      setReuploadId(null);
      setBukti(null);
      await queryClient.invalidateQueries({ queryKey: ["tagihan"] });
    },
    onError: () => {
      toast.error("Gagal mengunggah kembali");
    },
  });

  const handleReupload = async (id: string) => {
    if (!bukti) {
      toast.error("Unggah bukti pembayaran terlebih dahulu");
      return;
    }

    await submitMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-6 space-y-4">
        <h1 className="text-xl font-semibold">Tagihan</h1>
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
              <Clock className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Belum ada tagihan</EmptyTitle>
            <EmptyDescription>
              Tagihan bulanan akan muncul di sini saat sudah dibuat pemilik.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="px-4 space-y-3">
        {tagihan.map((t) => (
          <div key={t.id} className="rounded-xl border bg-card space-y-3">
            <Link
              to="/penghuni/tagihan/detail"
              search={{ id: t.id }}
              className="block p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
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

              {t.status === "ditolak" && t.alasanPenolakan && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  Ditolak: {t.alasanPenolakan}
                </div>
              )}

              {t.buktiPembayaran && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Bukti Pembayaran:
                  </p>
                  <img
                    src={t.buktiPembayaran}
                    alt="Bukti"
                    className="max-h-32 rounded-lg object-contain"
                  />
                </div>
              )}
            </Link>

            {(t.status === "belum_dibayar" || t.status === "ditolak") &&
              (reuploadId === t.id ? (
                <div className="px-4 pb-4 space-y-3">
                  <FileUpload
                    onFilesSelected={async (files: File[]) => {
                      if (files.length > 0) {
                        const url = await uploadBukti(files[0]);
                        setBukti(url);
                      }
                    }}
                    accept="image/*"
                  />
                  {bukti && (
                    <img
                      src={bukti}
                      alt="Preview"
                      className="max-h-32 rounded-lg object-contain"
                    />
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReupload(t.id)}
                      disabled={submitMutation.isPending || !bukti}
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="animate-spin mr-1 size-3" />
                      ) : null}
                      Kirim
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReuploadId(null);
                        setBukti(null);
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="px-4 pb-4">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setReuploadId(t.id);
                    }}
                    className="gap-1.5"
                  >
                    <Upload className="size-3.5" />
                    {t.status === "ditolak" ? "Unggah Ulang" : "Bayar"}
                  </Button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
