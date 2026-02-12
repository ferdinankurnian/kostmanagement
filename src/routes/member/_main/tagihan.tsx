import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { TopBar, TopBarCenter, TopBarRight } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/member/_main/tagihan")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg">Tagihan</h1>
        </TopBarCenter>
        <TopBarRight>
          <Button variant="secondary" size="sm">
            Minggu <ChevronDown />
          </Button>
        </TopBarRight>
      </TopBar>
      <div className="grid gap-4">
        <div className="space-y-3">
          <h1 className="text-md">Sekarang</h1>
          <div className="grid gap-3">
            <Card className="rounded-sm p-4 gap-4 bg-[#F9F9F9] shadow-none">
              <CardHeader className="p-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-normal">Tagihan</CardTitle>
                  <p className="text-sm text-yellow-500">Belum Lunas</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  24 Januari - Februari 2026
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="p-0 flex justify-between items-center">
                <h1 className="text-xl font-normal">Rp 1.000.000</h1>
                <Link to="/member/tagihan/detail">
                  <Button size="sm">Bayar</Button>
                </Link>
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
                  <CardTitle className="text-xl font-normal">Tagihan</CardTitle>
                  <p className="text-sm text-green-500">Lunas</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  24 Desember 2025 - Januari 2026
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="p-0 flex justify-between items-center">
                <h1 className="text-xl font-normal">Rp 1.000.000</h1>
                <Link to="/member/pembayaran/detail">
                  <Button size="sm" variant="outline">
                    Detail
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="rounded-sm p-4 gap-4 bg-[#F9F9F9] shadow-none">
              <CardHeader className="p-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-normal">Tagihan</CardTitle>
                  <p className="text-sm text-green-500">Lunas</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  24 November - Desember 2025
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="p-0 flex justify-between items-center">
                <h1 className="text-xl font-normal">Rp 1.000.000</h1>
                <Link to="/member/pembayaran/detail">
                  <Button size="sm" variant="outline">
                    Detail
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
