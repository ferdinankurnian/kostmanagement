import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = Route.useSearch();
  const [alasan, setAlasan] = useState("");
  const [showReject, setShowReject] = useState(false);

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

          {data.status === "menunggu_verifikasi" && (
            <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-lg border-t bg-background p-4 space-y-3">
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
                      className="flex-1 gap-1.5"
                      onClick={() => rejectMutation.mutate()}
                      disabled={rejectMutation.isPending || !alasan.trim()}
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Tolak
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
                    className="flex-1 gap-1.5"
                    onClick={() => acceptMutation.mutate()}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Terima
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-1.5"
                    onClick={() => setShowReject(true)}
                  >
                    <XCircle className="size-4" />
                    Tolak
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
