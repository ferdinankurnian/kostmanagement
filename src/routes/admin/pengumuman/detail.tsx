import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar, TopBarLeft, TopBarCenter } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/pengumuman/detail")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarLeft>
          <Link to="/admin/pengumuman">
            <Button variant="ghost" size="icon-lg">
              <ChevronLeft className="size-6" />
            </Button>
          </Link>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg">Detail</h1>
        </TopBarCenter>
      </TopBar>
      <div className="space-y-4 flex flex-col">
        {/* Image placeholder - shows if pengumuman has image */}
        <div className="bg-gray-200 h-48 rounded-md flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Foto Pengumuman</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-500">Dipublish</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              20 Januari 2025
            </span>
          </div>
          <h1 className="text-2xl font-semibold">Maintenance Air</h1>
        </div>
        <Card className="rounded-sm bg-[#F9F9F9] shadow-none border-none">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Akan ada pemadaman air pada hari Sabtu, 25 Januari 2025 mulai
              pukul 09.00 - 12.00 WIB. Mohon disediakan cadangan air untuk
              kebutuhan selama pemeliharaan berlangsung.
              <br />
              <br />
              Tim teknis akan melakukan perbaikan pada pipa utama di lantai 1.
              Selama pemeliharaan, air di seluruh kamar akan terhenti sementara.
              Kami mohon maaf atas ketidaknyamanan ini.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F2F2F2] to-transparent">
        <Link to="/admin/pengumuman">
          <Button type="submit" size="lg" className="w-full">
            Kembali
          </Button>
        </Link>
      </div>
    </div>
  );
}
