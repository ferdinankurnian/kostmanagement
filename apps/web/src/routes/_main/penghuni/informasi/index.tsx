import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { getInformasiList, type Informasi } from "@/lib/informasi";

export const Route = createFileRoute("/_main/penghuni/informasi/")({
  component: InformasiPage,
});

function InformasiPage() {
  const navigate = useNavigate();
  const {
    data: informasiList = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["informasi"],
    queryFn: getInformasiList,
  });

  // Group by priority
  const tinggi = informasiList.filter((i) => i.prioritas === "tinggi");
  const normal = informasiList.filter((i) => i.prioritas === "normal");
  const rendah = informasiList.filter((i) => i.prioritas === "rendah");

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/penghuni" })}
          >
            <ArrowLeft className="size-5" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg font-semibold">Informasi</h1>
        </TopBarCenter>
      </TopBar>

      <div className="flex-1 px-4 pt-20 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center pt-28">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center pt-28 text-center">
            <h1 className="text-xl font-semibold">Gagal memuat informasi</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Data informasi belum bisa diambil.
            </p>
            <button
              type="button"
              className="mt-6 rounded-lg border px-4 py-2 text-sm"
              onClick={() => void refetch()}
            >
              Coba lagi
            </button>
          </div>
        ) : informasiList.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-28 text-center">
            <h1 className="text-xl font-semibold">Belum ada informasi</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Informasi dari pemilik kost akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tinggi.length > 0 && (
              <InformasiSection title="Penting" items={tinggi} />
            )}
            {normal.length > 0 && (
              <InformasiSection title="Informasi" items={normal} />
            )}
            {rendah.length > 0 && (
              <InformasiSection title="Lainnya" items={rendah} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InformasiSection({
  title,
  items,
}: {
  title: string;
  items: Informasi[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <InformasiCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function InformasiCard({ item }: { item: Informasi }) {
  return (
    <Link
      to="/penghuni/informasi/detail"
      search={{ id: item.id }}
      className="block rounded-xl border bg-card overflow-hidden active:scale-[0.98] transition-transform"
    >
      {item.fotoUrls[0] && (
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={item.fotoUrls[0]}
            alt={item.judul}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-base font-semibold text-white line-clamp-1">
              {item.judul}
            </h3>
          </div>
        </div>
      )}
      <div className="p-4 space-y-2">
        {!item.fotoUrls[0] && (
          <h3 className="text-base font-semibold">{item.judul}</h3>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.deskripsi}
        </p>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}
