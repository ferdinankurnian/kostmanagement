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

      <div className="pt-24 px-4 space-y-4">
        {/* Status Icon */}
        <div className="flex justify-center pt-4">
          <div
            className={`size-16 rounded-full flex items-center justify-center ${statusConfig[data.status].color}`}
          >
            <StatusIcon className="size-8" strokeWidth={2.5} />
          </div>
        </div>

        {/* Amount & Period */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold">{formatRupiah(data.jumlah)}</h2>
          <p className="text-sm text-muted-foreground">{data.periode}</p>
        </div>

        {/* Bukti Pembayaran Button (if exists) */}
        {data.buktiPembayaran && (
          <Button variant="default" className="w-full">
            Bukti Pembayaran
          </Button>
        )}

        {/* Info Grid */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-sm">Invoice ID</span>
            <span className="text-sm text-right">{data.id.slice(0, 10)}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-sm">Nama Penghuni</span>
            <span className="text-sm text-right">
              {data.namaPenghuni || "-"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-sm">No Kamar</span>
            <span className="text-sm text-right">{data.noKamar}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-sm">Periode</span>
            <span className="text-sm text-right">{data.periode}</span>
          </div>
        </div>

        {/* Upload Bukti Section or Foto Button */}
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
              <>
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
                  <div className="rounded-lg bg-muted h-48 overflow-hidden">
                    <img
                      src={bukti}
                      alt="Preview"
                      className="w-full h-full object-cover"
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
              </>
            )}
          </div>
        )}

        {/* Show bukti if already uploaded */}
        {data.buktiPembayaran && (
          <div className="rounded-lg bg-muted h-48 overflow-hidden">
            <img
              src={data.buktiPembayaran}
              alt="Bukti Pembayaran"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Alasan Penolakan */}
        {data.alasanPenolakan && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
            <p className="text-sm font-medium text-red-900">Alasan Penolakan</p>
            <p className="text-sm text-red-700">{data.alasanPenolakan}</p>
          </div>
        )}
      </div>
    </div>
  );
}
