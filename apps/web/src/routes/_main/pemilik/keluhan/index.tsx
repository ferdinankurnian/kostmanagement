import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Loader2, Wrench } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getKeluhanList } from "@/lib/keluhan";

export const Route = createFileRoute("/_main/pemilik/keluhan/")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["keluhan"],
    queryFn: getKeluhanList,
  });

  const aktif = data.filter((item) => item.status !== "selesai");
  const selesai = data.filter((item) => item.status === "selesai");

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
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
          <h1 className="text-lg whitespace-nowrap">Keluhan</h1>
        </TopBarCenter>
      </TopBar>

      {isLoading ? (
        <div className="flex items-center justify-center pt-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">Gagal memuat keluhan.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : data.length === 0 ? (
        <div className="pt-12 text-center space-y-3">
          <Wrench className="mx-auto size-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Belum ada keluhan masuk</h2>
          <p className="text-sm text-muted-foreground">
            Keluhan dari penghuni akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <KeluhanSection title="Aktif" items={aktif} />
          <KeluhanSection title="Selesai" items={selesai} />
        </div>
      )}
    </div>
  );
}

function KeluhanSection({
  title,
  items,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getKeluhanList>>;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground">{title}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to="/pemilik/keluhan/detail"
            search={{ id: item.id }}
            className="block rounded-xl border bg-card p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Kamar {item.noKamar} · {item.namaPenghuni}
                </p>
                <h2 className="font-semibold">{item.judul}</h2>
              </div>
              <Badge
                variant={
                  item.status === "selesai"
                    ? "default"
                    : item.status === "diproses"
                      ? "secondary"
                      : "outline"
                }
              >
                {item.status === "dibuka"
                  ? "Dibuka"
                  : item.status === "diproses"
                    ? "Diproses"
                    : "Selesai"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.deskripsi}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
