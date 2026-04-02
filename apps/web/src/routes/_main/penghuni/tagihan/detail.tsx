import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { getTagihanById, submitTagihan, type Tagihan } from "@/lib/tagihan";
import { uploadBukti } from "@/lib/upload";

export const Route = createFileRoute("/_main/penghuni/tagihan/detail")({
  validateSearch: z.object({
    id: z.string(),
  }),
  component: DetailTagihanPage,
});

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

const statusConfig: Record<
  Tagihan["status"],
  {
    label: string;
    icon: typeof Check;
    color: string;
  }
> = {
  belum_dibayar: {
    label: "Belum Dibayar",
    icon: Clock,
    color: "bg-gray-100 text-gray-600",
  },
  menunggu_verifikasi: {
    label: "Menunggu Verifikasi",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-600",
  },
  lunas: { label: "Lunas", icon: Check, color: "bg-blue-500 text-white" },
  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    color: "bg-red-100 text-red-600",
  },
};

function DetailTagihanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = Route.useSearch();
  const [bukti, setBukti] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

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
      setShowUpload(false);
      await queryClient.invalidateQueries({ queryKey: ["tagihan"] });
    },
    onError: () => {
      toast.error("Gagal mengirim bukti pembayaran");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-4">
        <p className="text-sm text-destructive">Gagal memuat detail tagihan.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  const StatusIcon = statusConfig[data.status].icon;

  return (
    <div className="min-h-screen bg-background pb-24">
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
          <h1 className="text-lg whitespace-nowrap">Detail Pembayaran</h1>
        </TopBarCenter>
      </TopBar>

      <div className="pt-24 px-4 space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          <div
            className={`size-16 rounded-full flex items-center justify-center ${statusConfig[data.status].color}`}
          >
            <StatusIcon className="size-8" strokeWidth={2.5} />
          </div>
        </div>

        {/* Amount & Period */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-semibold">
            {formatRupiah(data.jumlah)}
          </h2>
          <p className="text-sm text-muted-foreground">{data.periode}</p>
        </div>

        {/* Bukti Pembayaran Card */}
        {data.buktiPembayaran && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Foto Bukti Pembayaran</p>
            <div className="rounded-xl border bg-muted/30 p-2">
              <img
                src={data.buktiPembayaran}
                alt="Bukti Pembayaran"
                className="w-full rounded-lg object-contain max-h-96"
              />
            </div>
          </div>
        )}

        {/* Info Rows */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm text-muted-foreground">Invoice ID</span>
            <span className="text-sm font-medium">{data.id.slice(0, 8)}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm text-muted-foreground">Nama Penghuni</span>
            <span className="text-sm font-medium">
              {data.namaPenghuni || "-"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm text-muted-foreground">No Kamar</span>
            <span className="text-sm font-medium">{data.noKamar}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm text-muted-foreground">Periode</span>
            <span className="text-sm font-medium">{data.periode}</span>
          </div>

          {data.tanggalJatuhTempo && (
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm text-muted-foreground">Jatuh Tempo</span>
              <span className="text-sm font-medium">
                {new Date(data.tanggalJatuhTempo).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {data.tanggalBayar && (
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm text-muted-foreground">
                Tanggal Bayar
              </span>
              <span className="text-sm font-medium">
                {new Date(data.tanggalBayar).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {data.metodePembayaran && (
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm text-muted-foreground">
                Metode Bayar
              </span>
              <span className="text-sm font-medium capitalize">
                {data.metodePembayaran}
              </span>
            </div>
          )}

          {data.monthsPaid && data.monthsPaid > 1 && (
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm text-muted-foreground">
                Bulan Dibayar
              </span>
              <span className="text-sm font-medium">
                {data.monthsPaid} bulan
              </span>
            </div>
          )}
        </div>

        {/* Alasan Penolakan */}
        {data.alasanPenolakan && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
            <p className="text-sm font-medium text-red-900">Alasan Penolakan</p>
            <p className="text-sm text-red-700">{data.alasanPenolakan}</p>
          </div>
        )}

        {/* Upload Bukti Section */}
        {(data.status === "belum_dibayar" || data.status === "ditolak") && (
          <div className="space-y-3">
            {!showUpload ? (
              <Button
                variant="default"
                className="w-full"
                onClick={() => setShowUpload(true)}
              >
                Foto Bukti Pembayaran
              </Button>
            ) : (
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <p className="text-sm font-medium">Upload Bukti Pembayaran</p>
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
                  <div className="rounded-lg border bg-muted/50 p-2">
                    <img
                      src={bukti}
                      alt="Preview"
                      className="w-full rounded object-contain max-h-48"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending || !bukti}
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="size-4 mr-2" />
                        Kirim
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUpload(false);
                      setBukti(null);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
