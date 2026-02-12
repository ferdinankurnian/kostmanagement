import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { TopBar, TopBarLeft, TopBarRight } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin/_main/pengumuman")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarLeft>
          <h1 className="text-2xl font-semibold">Pengumuman</h1>
        </TopBarLeft>
        <TopBarRight>
          <Button variant="outline" size="lg">
            <Plus className="size-5" /> Tambah
          </Button>
        </TopBarRight>
      </TopBar>
      <div className="grid gap-4">
        <div className="space-y-3">
          <h1 className="text-md">Aktif</h1>
          <div className="grid gap-3">
            <Link to="/admin/pengumuman/detail">
              <Card className="rounded-sm p-4 gap-4 bg-[#F9F9F9] shadow-none cursor-pointer hover:bg-[#EFEFEF] transition-colors">
                <CardHeader className="p-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-normal">Maintenance Air</h2>
                    <p className="text-sm text-green-500">Dipublish</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dibuat: 20 Januari 2025
                  </p>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Akan ada pemadaman air pada hari Sabtu, 25 Januari 2025
                    mulai pukul 09.00 - 12.00 WIB. Mohon disediakan cadangan
                    air.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-md">Riwayat</h1>
          <div className="grid gap-3">
            <Link to="/admin/pengumuman/detail">
              <Card className="rounded-sm p-4 gap-4 bg-[#F9F9F9] shadow-none cursor-pointer hover:bg-[#EFEFEF] transition-colors">
                <CardHeader className="p-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-normal">
                      Kenaikan Harga Listrik
                    </h2>
                    <p className="text-sm text-gray-500">Diarsipkan</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dibuat: 15 Januari 2025
                  </p>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Informasi kenaikan biaya listrik per kWh mulai bulan
                    Februari 2025. Rincian lebih lanjut dapat dilihat di kantor
                    pengelola.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/pengumuman/detail">
              <Card className="rounded-sm p-4 gap-4 bg-[#F9F9F9] shadow-none cursor-pointer hover:bg-[#EFEFEF] transition-colors">
                <CardHeader className="p-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-normal">Peraturan Baru</h2>
                    <p className="text-sm text-gray-500">Diarsipkan</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dibuat: 10 Januari 2025
                  </p>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Dilarang merokok di dalam kamar dan area bersama.
                    Pelanggaran dikenakan sanksi sesuai peraturan yang berlaku.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
