import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Check, ChevronLeft, Clock, Loader2, X, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  acceptTagihan,
  getTagihanById,
  rejectTagihan,
  type Tagihan,
} from "@/lib/tagihan";

export const Route = createFileRoute("/_main/pemilik/tagihan/detail")({
  validateSearch: z.object({
    id: z.string(),
  }),
  component: RouteComponent,
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

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = Route.useSearch();
  const [alasan, setAlasan] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tagihan", id],
    queryFn: () => getTagihanById(id),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptTagihan(id),
    onSuccess: async () => {
      toast.success("Pembayaran diterima");
      await queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      router.history.back();
    },
    onError: () => {
      toast.error("Gagal menerima pembayaran");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectTagihan(id, alasan),
    onSuccess: async () => {
      toast.success("Pembayaran ditolak");
      await queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      router.history.back();
    },
    onError: () => {
      toast.error("Gagal menolak pembayaran");
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
    <>
      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setFullscreenImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setFullscreenImage(null);
          }}
          role="dialog"
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="max-w-full max-h-full"
          />
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setFullscreenImage(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setFullscreenImage(null);
            }}
          >
            <X className="size-8" />
          </button>
        </div>
      )}

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

          {/* Bukti Pembayaran Card */}
          {data.buktiPembayaran && (
            <Card>
              <CardHeader>
                <CardTitle>Bukti Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="cursor-pointer hover:opacity-90 transition-opacity rounded-lg overflow-hidden"
                  onClick={() => setFullscreenImage(data.buktiPembayaran!)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setFullscreenImage(data.buktiPembayaran!);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={data.buktiPembayaran}
                    alt="Bukti Pembayaran"
                    className="w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Foto Bukti Pembayaran Card */}
          {data.buktiPembayaran && (
            <Card>
              <CardHeader>
                <CardTitle>Foto Bukti Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="cursor-pointer hover:opacity-90 transition-opacity rounded-lg overflow-hidden"
                  onClick={() => setFullscreenImage(data.buktiPembayaran!)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setFullscreenImage(data.buktiPembayaran!);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={data.buktiPembayaran}
                    alt="Foto Bukti Pembayaran"
                    className="w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>
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

          {/* Alasan Penolakan */}
          {data.alasanPenolakan && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
              <p className="text-sm font-medium text-red-900">
                Alasan Penolakan
              </p>
              <p className="text-sm text-red-700">{data.alasanPenolakan}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {data.status === "menunggu_verifikasi" && (
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent">
            <div className="mx-auto max-w-lg space-y-3">
              {showReject ? (
                <>
                  <Textarea
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Alasan penolakan..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => rejectMutation.mutate()}
                      disabled={rejectMutation.isPending || !alasan.trim()}
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Tolak"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReject(false);
                        setAlasan("");
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => acceptMutation.mutate()}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Terima"
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowReject(true)}
                  >
                    Tolak
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
