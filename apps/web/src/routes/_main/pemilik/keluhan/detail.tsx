import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteKeluhan,
  getKeluhanById,
  type KeluhanStatus,
  updateStatusKeluhan,
} from "@/lib/keluhan";

export const Route = createFileRoute("/_main/pemilik/keluhan/detail")({
  validateSearch: z.object({
    id: z.string(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = Route.useSearch();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["keluhan", id],
    queryFn: () => getKeluhanById(id),
  });
  const [status, setStatus] = useState<KeluhanStatus>("dibuka");
  const [catatanPemilik, setCatatanPemilik] = useState("");

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setCatatanPemilik(data.catatanPemilik ?? "");
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      updateStatusKeluhan(id, {
        status,
        catatanPemilik: catatanPemilik.trim() || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["keluhan"] });
      await queryClient.invalidateQueries({ queryKey: ["keluhan", id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteKeluhan(id),
    onSuccess: async () => {
      toast.success("Keluhan berhasil dihapus");
      await queryClient.invalidateQueries({ queryKey: ["keluhan"] });
      router.history.back();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus keluhan");
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
          <h1 className="text-lg whitespace-nowrap">Detail Keluhan</h1>
        </TopBarCenter>
      </TopBar>

      {isLoading ? (
        <div className="flex items-center justify-center pt-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="px-4 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat detail keluhan.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : (
        <>
          <div className="px-4 space-y-5">
            {data.fotoUrls.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {data.fotoUrls.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt={data.judul}
                    className="w-full rounded-xl border object-cover"
                  />
                ))}
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Kamar {data.noKamar} · {data.namaPenghuni}
                </p>
                <h1 className="text-2xl font-semibold">{data.judul}</h1>
              </div>
              <Badge
                variant={
                  data.status === "selesai"
                    ? "default"
                    : data.status === "diproses"
                      ? "secondary"
                      : "outline"
                }
              >
                {data.status === "dibuka"
                  ? "Dibuka"
                  : data.status === "diproses"
                    ? "Diproses"
                    : "Selesai"}
              </Badge>
            </div>

            <div className="space-y-2">
              <h2 className="font-medium">Deskripsi</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {data.deskripsi}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-medium">Status</h2>
              <div className="grid grid-cols-3 gap-2">
                {(["dibuka", "diproses", "selesai"] as KeluhanStatus[]).map(
                  (item) => (
                    <Button
                      key={item}
                      type="button"
                      variant={status === item ? "default" : "outline"}
                      onClick={() => setStatus(item)}
                    >
                      {item === "dibuka"
                        ? "Dibuka"
                        : item === "diproses"
                          ? "Diproses"
                          : "Selesai"}
                    </Button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-medium">Catatan Pemilik</h2>
              <Textarea
                value={catatanPemilik}
                onChange={(e) => setCatatanPemilik(e.target.value)}
                rows={4}
                placeholder="Tambahkan catatan progres atau penyelesaian"
              />
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-lg border-t bg-background p-4 space-y-2">
            <Button
              type="button"
              className="w-full gap-2"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Simpan Status
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm("Hapus keluhan ini?")) {
                  deleteMutation.mutate();
                }
              }}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Hapus Keluhan
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
