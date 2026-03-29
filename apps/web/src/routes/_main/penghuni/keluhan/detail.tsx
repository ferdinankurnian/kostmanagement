import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getKeluhanById } from "@/lib/keluhan";

export const Route = createFileRoute("/_main/penghuni/keluhan/detail")({
  validateSearch: z.object({
    id: z.string(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["keluhan", id],
    queryFn: () => getKeluhanById(id),
  });

  return (
    <div>
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/penghuni/keluhan" })}
          >
            <ArrowLeft className="size-5" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-base font-semibold">Detail Keluhan</h1>
        </TopBarCenter>
      </TopBar>

      {isLoading ? (
        <div className="flex items-center justify-center pt-28">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="px-4 pt-24 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat detail keluhan.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : (
        <div className="px-4 pt-20 pb-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Kamar {data.noKamar}
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

          <div className="text-sm text-muted-foreground">
            Dibuat{" "}
            {new Date(data.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

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

          <div className="space-y-2">
            <h2 className="font-medium">Deskripsi</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.deskripsi}
            </p>
          </div>

          {data.catatanPemilik ? (
            <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
              <h2 className="font-medium">Catatan Pemilik</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {data.catatanPemilik}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
