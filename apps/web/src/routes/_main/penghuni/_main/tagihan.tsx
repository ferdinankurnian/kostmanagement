import { createFileRoute } from "@tanstack/react-router";
import { TopBar, TopBarCenter } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_main/penghuni/_main/tagihan")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pt-20 space-y-6">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Tagihan</h1>
        </TopBarCenter>
      </TopBar>
      <div className="space-y-4 px-4">
        <div className="space-y-2">
          <p className="text-muted-foreground">Sekarang</p>
          <div className="flex flex-col gap-2">
            <div className="border rounded-xl p-4 space-y-3 relative">
              <div className="space-y-1">
                <h1 className="text-lg">Kamar 2</h1>
                <p className="text-sm text-muted-foreground">
                  24 Januari - Feburari 2026
                </p>
                <p className="text-yellow-500 text-sm absolute top-4 right-4">
                  Menunggu
                </p>
              </div>
              <Separator />
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-xl">Rp 1.500.000</h1>
                <Button size="sm" className="rounded-full">
                  Detail
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground">Sekarang</p>
          <div className="flex flex-col gap-2">
            <div className="border rounded-xl p-4 space-y-3 relative">
              <div className="space-y-1">
                <h1 className="text-lg">Kamar 2</h1>
                <p className="text-sm text-muted-foreground">
                  24 Januari - Feburari 2026
                </p>
                <p className="text-yellow-500 text-sm absolute top-4 right-4">
                  Menunggu
                </p>
              </div>
              <Separator />
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-xl">Rp 1.500.000</h1>
                <Button size="sm" className="rounded-full">
                  Detail
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
