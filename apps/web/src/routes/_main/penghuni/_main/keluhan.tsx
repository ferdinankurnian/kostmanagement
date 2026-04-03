import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Plus, Wrench } from "lucide-react";
import { TopBar, TopBarCenter } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getKeluhanList, type KeluhanStatus } from "@/lib/keluhan";

export const Route = createFileRoute("/_main/penghuni/_main/keluhan")({
  component: RouteComponent,
});

function getStatusBadge(status: KeluhanStatus) {
  switch (status) {
    case "dibuka":
      return <Badge variant="outline">Dibuka</Badge>;
    case "diproses":
      return <Badge variant="secondary">Diproses</Badge>;
    case "selesai":
      return <Badge>Selesai</Badge>;
  }
}

function RouteComponent() {
  const {
    data: keluhan = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["keluhan"],
    queryFn: getKeluhanList,
  });

  return (
    <div className="pt-20 space-y-6">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Keluhan</h1>
        </TopBarCenter>
      </TopBar>

      <div className="fixed inset-x-0 bottom-14 z-50 mx-auto flex max-w-lg justify-end px-4 pointer-events-none">
        <Link to="/penghuni/keluhan/add">
          <Button
            size="icon-lg"
            className="pointer-events-auto h-12 w-20 rounded-xl border border-black/20"
          >
            <Plus className="size-6" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="px-4 text-sm text-muted-foreground">
          Memuat keluhan...
        </div>
      ) : isError ? (
        <div className="px-4 space-y-3">
          <p className="text-sm text-destructive">Gagal memuat keluhan.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : keluhan.length === 0 ? (
        <div className="px-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wrench className="size-4" />
              </EmptyMedia>
              <EmptyTitle>Belum ada keluhan</EmptyTitle>
              <EmptyDescription>
                Kalau ada kerusakan atau masalah, laporkan dari sini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="space-y-3 px-4">
          {keluhan.map((item) => (
            <Link
              key={item.id}
              to="/penghuni/keluhan/detail"
              search={{ id: item.id }}
              className="block rounded-xl border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Kamar {item.noKamar}
                  </p>
                  <h2 className="font-semibold">{item.judul}</h2>
                </div>
                {getStatusBadge(item.status)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.deskripsi}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {item.fotoUrls.length > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {item.fotoUrls.length} foto
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
