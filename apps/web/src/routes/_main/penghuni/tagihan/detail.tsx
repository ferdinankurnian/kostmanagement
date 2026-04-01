import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Separator } from "@/components/ui/separator";
import { getTagihanById, submitTagihan, type Tagihan } from "@/lib/tagihan";
import { uploadBukti } from "@/lib/upload";

export const Route = createFileRoute("/_main/penghuni/tagihan/detail")({
  validateSearch: z.object({
    id: z.string(),
  }),
  component: DetailTagihanPage,
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
    variant: "outline" | "secondary" | "default" | "destructive";
  }
> = {
  belum_dibayar: { label: "Belum Dibayar", variant: "outline" },
  menunggu_verifikasi: { label: "Menunggu Verifikasi", variant: "secondary" },
  lunas: { label: "Lunas", variant: "default" },
  ditolak: { label: "Ditolak", variant: "destructive" },
};

function DetailTagihanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = Route.useSearch();
  const [bukti, setBukti] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tagihan", id],
    queryFn: () => getTagihanById(id),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submitTagihan(id, {
        metodePembayaran: "transfer",
        buktiPembayaran: bukti ?? "",
      }),
    onSuccess: async () => {
      toast.success("Bukti pembayaran berhasil dikirim");
      setBukti(null);
      await queryClient.invalidateQueries({ queryKey: ["tagihan"] });
    },
    onError: () => {
      toast.error("Gagal mengirim bukti pembayaran");
    },
  });

  return (
    <div className="space-y-4 pt-20 pb-20">
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
          <h1 className="text-lg whitespace-nowrap">Detail Tagihan</h1>
        </TopBarCenter>
      </TopBar>

      {isLoading ? (
        <div className="flex items-center justify-center pt-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="px-4 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat detail tagihan.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Kamar {data.noKamar}
              </p>
              <h1 className="text-2xl font-semibold">
                {formatRupiah(data.jumlah)}
              </h1>
              <p className="text-sm text-muted-foreground">{data.periode}</p>
            </div>
            <Badge variant={statusMap[data.status].variant}>
              {statusMap[data.status].label}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jatuh Tempo</span>
              <span>
                {new Date(data.tanggalJatuhTempo).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {data.metodePembayaran && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metode Bayar</span>
                <span className="capitalize">{data.metodePembayaran}</span>
              </div>
            )}

            {data.tanggalBayar && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tanggal Bayar</span>
                <span>
                  {new Date(data.tanggalBayar).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            {data.monthsPaid && data.monthsPaid > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bulan Dibayar</span>
                <span>{data.monthsPaid} bulan</span>
              </div>
            )}
          </div>

          {data.buktiPembayaran && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Bukti Pembayaran</p>
              <img
                src={data.buktiPembayaran}
                alt="Bukti Pembayaran"
                className="w-full rounded-xl border object-contain max-h-96"
              />
            </div>
          )}

          {data.alasanPenolakan && (
            <div className="rounded-xl bg-destructive/10 p-4 space-y-1">
              <p className="text-sm font-medium text-destructive">
                Alasan Penolakan
              </p>
              <p className="text-sm text-destructive">{data.alasanPenolakan}</p>
            </div>
          )}

          {(data.status === "belum_dibayar" || data.status === "ditolak") && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <p className="text-sm font-medium">Kirim Bukti Pembayaran</p>
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
              <Button
                className="w-full gap-1.5"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || !bukti}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Kirim Bukti Pembayaran
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
