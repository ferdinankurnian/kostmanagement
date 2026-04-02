import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { getInformasiById } from "@/lib/informasi";

export const Route = createFileRoute("/_main/penghuni/informasi/detail")({
  validateSearch: z.object({
    id: z.string(),
  }),
  component: InformasiDetailPage,
});

function InformasiDetailPage() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["informasi", id],
    queryFn: () => getInformasiById(id),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/penghuni/informasi" })}
          >
            <ArrowLeft className="size-5" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-base font-semibold">Detail Informasi</h1>
        </TopBarCenter>
      </TopBar>

      {isLoading ? (
        <div className="flex items-center justify-center pt-28">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="px-4 pt-24 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat detail informasi.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : (
        <div className="flex-1 pt-20 pb-6">
          {/* Photo carousel */}
          {data.fotoUrls.length > 0 && (
            <div className="relative">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={data.fotoUrls[currentPhotoIndex]}
                  alt={data.judul}
                  className="h-full w-full object-cover"
                />
              </div>
              {data.fotoUrls.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {data.fotoUrls.map((_, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`size-2 rounded-full transition-colors ${
                        index === currentPhotoIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-4 pt-4 space-y-4">
            <div>
              <h1 className="text-xl font-semibold">{data.judul}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(data.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {data.deskripsi}
              </p>
            </div>

            {data.fotoUrls.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Foto Lainnya
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {data.fotoUrls.map((url, index) => (
                    <button
                      type="button"
                      key={url}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                        index === currentPhotoIndex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Foto ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
