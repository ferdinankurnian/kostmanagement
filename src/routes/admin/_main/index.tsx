import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/_main/")({
  component: Home,
});

function Home() {
  return (
    <div className="space-y-4">
      <div className="w-full h-80 -z-10 fixed left-0 right-0 top-0 bg-linear-to-b from-[#55B5FF] to-transparent pointer-events-none"></div>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <Avatar className="size-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg">Admin</h1>
          </div>
        </div>
        <div>
          <Link to="/admin/tambah-penghuni/pilih-kamar">
            <Button variant="secondary">
              <Plus /> Tambah
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Card className="rounded-sm p-4">
          <CardHeader className="p-0 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-normal">Total Kamar</CardTitle>
            <ArrowUpRight />
          </CardHeader>
          <CardContent className="flex flex-row items-end p-0 gap-2">
            <h1 className="text-2xl">12</h1>
            <p className="text-sm font-normal">Kamar</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm p-4">
          <CardHeader className="p-0 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-normal">
              Total Penghuni
            </CardTitle>
            <ArrowUpRight />
          </CardHeader>
          <CardContent className="flex flex-row items-end  p-0 gap-2">
            <h1 className="text-2xl">12</h1>
            <p className="text-sm font-normal">Kamar</p>
          </CardContent>
        </Card>
        <Link to="/admin/laporan">
          <Card className="rounded-sm p-4">
            <CardHeader className="p-0 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-normal">Laporan</CardTitle>
              <ArrowUpRight />
            </CardHeader>
            <CardContent className="flex flex-row items-end  p-0 gap-2">
              <h1 className="text-2xl">12</h1>
              <p className="text-sm font-normal">Laporan</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="rounded-sm p-4">
          <CardHeader className="p-0 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-normal">Tagihan</CardTitle>
            <ArrowUpRight />
          </CardHeader>
          <CardContent className="flex flex-row items-end p-0 gap-2">
            <h1 className="text-2xl">12</h1>
            <p className="text-sm font-normal">Tidak Lunas</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <h1 className="text-lg mb-2">Kamar Kost yang tersedia</h1>
        <div className="grid grid-cols-2 gap-4 justify-between">
          <div className="flex flex-col gap-3 py-4 w-4/5">
            <h1 className="text-sm">Lantai 1</h1>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="rounded-sm gap-1 p-3 bg-linear-to-br from-white to-[#A7D9FF]"
                >
                  <CardHeader className="p-0">
                    <h1 className="text-muted-foreground">Kamar</h1>
                  </CardHeader>
                  <CardContent className="p-0">
                    <h1 className="text-2xl">{i + 1}</h1>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg">Lantai 2</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
