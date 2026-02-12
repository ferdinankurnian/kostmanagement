import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Bell, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/member/_main/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <div className="w-full h-80 -z-10 absolute left-0 right-0 top-0 bg-linear-to-b from-[#55B5FF] to-transparent pointer-events-none"></div>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg text-white font-semibold">Admin</h1>
          </div>
        </div>
        <div>
          <Link to="/admin/tambah-penghuni/pilih-kamar">
            <Button variant="outline" size="icon-lg">
              <Bell />
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Card className="rounded-sm p-4 shadow-none border-none gap-2">
          <CardHeader className="p-0 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-normal">Tagihan</CardTitle>
            <ArrowUpRight />
          </CardHeader>
          <CardContent className="flex flex-row items-end p-0 gap-2">
            <h1 className="text-2xl">12</h1>
            <p className="text-sm font-normal">Kamar</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm p-4 shadow-none border-none gap-2">
          <CardHeader className="p-0 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-normal">Pemberitahuan</CardTitle>
            <ArrowUpRight />
          </CardHeader>
          <CardContent className="flex flex-row items-end  p-0 gap-2">
            <h1 className="text-2xl">12</h1>
            <p className="text-sm font-normal">Kamar</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h1 className="text-lg mb-4">Riwayat Pembayaran</h1>
        <div className="flex">
          {/* Kolom waktu */}
          <div className="flex flex-col">
            <div className="h-[72px] flex items-center">
              <span className="text-sm text-muted-foreground">09:12</span>
            </div>
            <div className="h-8 border-l-2 border-dashed border-gray-300 ml-4"></div>
            <div className="h-[72px] flex items-center">
              <span className="text-sm text-muted-foreground">08:42</span>
            </div>
            <div className="h-8 border-l-2 border-dashed border-gray-300 ml-4"></div>
            <div className="h-[72px] flex items-center">
              <span className="text-sm text-muted-foreground">07:20</span>
            </div>
          </div>

          {/* Kolom card */}
          <div className="flex-1 ml-4 flex flex-col">
            <Card className="rounded-xl p-4 bg-white border-0 shadow-sm h-[72px]">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">1.000.000</p>
                    <p className="text-sm text-muted-foreground">
                      24 Januari 2025
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-muted-foreground">Proses</span>
                </div>
              </div>
            </Card>
            <div className="h-8"></div>
            <Card className="rounded-xl p-4 bg-white border-0 shadow-sm h-[72px]">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Running</p>
                    <p className="text-sm text-muted-foreground">
                      24 Februari 2025
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Selesai</span>
                </div>
              </div>
            </Card>
            <div className="h-8"></div>
            <Card className="rounded-xl p-4 bg-white border-0 shadow-sm h-[72px]">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Running</p>
                    <p className="text-sm text-muted-foreground">
                      24 Maret 2025
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Selesai</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
