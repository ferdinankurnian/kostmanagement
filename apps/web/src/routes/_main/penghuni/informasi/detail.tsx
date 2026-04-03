import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
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
  const [api, setApi] = useState<CarouselApi>();
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["informasi", id],
    queryFn: () => getInformasiById(id),
  });

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!api || !data || data.fotoUrls.length <= 1) {
      return;
    }

    const startAutoScroll = () => {
      autoScrollTimerRef.current = setInterval(() => {
        api.scrollNext();
      }, 5000);
    };

    startAutoScroll();

    // Restart timer on user interaction
    const handleSelect = () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      startAutoScroll();
    };

    api.on("select", handleSelect);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      api.off("select", handleSelect);
    };
  }, [api, data]);

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setFullscreenOpen(false);
  };

  return (
    <>
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
              <div className="px-4">
                <Carousel className="w-full" setApi={setApi}>
                  <CarouselContent>
                    {data.fotoUrls.map((url, index) => (
                      <CarouselItem key={url}>
                        <button
                          type="button"
                          className="aspect-video w-full overflow-hidden rounded-xl border-0 p-0 bg-transparent"
                          onClick={() => openFullscreen(index)}
                        >
                          <img
                            src={url}
                            alt={data.judul}
                            className="h-full w-full object-cover cursor-pointer"
                          />
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
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
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreenOpen && data && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center border-0 p-0"
          onClick={closeFullscreen}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={closeFullscreen}
          >
            <X className="size-6" />
          </Button>
          <button
            type="button"
            className="border-0 p-0 bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={data.fotoUrls[fullscreenIndex]}
              alt={data.judul}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </button>
        </button>
      )}
    </>
  );
}
