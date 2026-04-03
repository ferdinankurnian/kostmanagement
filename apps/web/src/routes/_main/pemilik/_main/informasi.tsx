import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { TopBar, TopBarCenter } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getInformasiList } from "@/lib/informasi";

export const Route = createFileRoute("/_main/pemilik/_main/informasi")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["informasi"],
    queryFn: getInformasiList,
  });

  return (
    <div className="pt-20 space-y-6">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Informasi</h1>
        </TopBarCenter>
      </TopBar>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent text-center">
        <Link to="/pemilik/informasi/add">
          <Button className="w-full max-w-lg rounded-full mx-auto">
            <Plus className="size-4 mr-2" />
            Tambah Informasi
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="px-4 text-sm text-muted-foreground">
          Memuat informasi...
        </div>
      ) : isError ? (
        <div className="px-4 space-y-3">
          <p className="text-sm text-destructive">Gagal memuat informasi.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : data.length === 0 ? (
        <div className="px-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>Belum ada informasi</EmptyTitle>
              <EmptyDescription>
                Pengumuman untuk penghuni akan muncul di sini setelah dibuat.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="space-y-3 px-4">
          {data.map((item) => (
            <Link
              key={item.id}
              to="/pemilik/informasi/detail"
              search={{ id: item.id }}
              className="block rounded-xl border bg-card p-4 space-y-3"
            >
              {item.fotoUrls[0] ? (
                <img
                  src={item.fotoUrls[0]}
                  alt={item.judul}
                  className="h-36 w-full rounded-lg object-cover"
                />
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{item.judul}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.deskripsi}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Prioritas{" "}
                  {item.prioritas === "tinggi"
                    ? "tinggi"
                    : item.prioritas === "normal"
                      ? "normal"
                      : "rendah"}
                </span>
                <span>
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
