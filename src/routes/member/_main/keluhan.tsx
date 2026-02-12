import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { TopBar, TopBarCenter, TopBarRight } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/member/_main/keluhan")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg">Keluhan</h1>
        </TopBarCenter>
        <TopBarRight>
          <Link to="/member/keluhan/buat">
            <Button variant="outline" size="icon-lg">
              <Plus className="size-5" />
            </Button>
          </Link>
        </TopBarRight>
      </TopBar>
      <div className="grid gap-4">
        <div className="space-y-3">
          <h1 className="text-md">Aktif</h1>
          <div className="grid gap-3">
            <Card className="rounded-sm p-4 gap-4 bg-[#F9F9F9] shadow-none">
              <CardHeader className="p-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-normal">Keran Air Bocor</h2>
                  <p className="text-sm text-yellow-500">Diproses</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Dibuat: 20 Januari 2025
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Keran air di kamar mandi bocor terus sejak kemarin malam.
                  Airnya terus menetes dan sudah menggenang di lantai.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-md">Riwayat</h1>
          <div className="grid gap-3">
            <Card className="rounded-sm p-4 gap-4 bg-[#F9F9F9] shadow-none">
              <CardHeader className="p-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-normal">Lampu Mati</h2>
                  <p className="text-sm text-green-500">Selesai</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Dibuat: 15 Januari 2025
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Lampu di kamar tidak menyala sejak semalam. Sudah dicek
                  saklarnya tapi tetap tidak bisa.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-sm p-4 gap-4 bg-[#F9F9F9] shadow-none">
              <CardHeader className="p-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-normal">AC Tidak Dingin</h2>
                  <p className="text-sm text-green-500">Selesai</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Dibuat: 10 Januari 2025
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  AC di kamar tidak dingin lagi, hanya keluar angin biasa. Sudah
                  dibersihkan filter tapi masih sama.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
