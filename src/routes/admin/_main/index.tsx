import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomCard } from "@/components/room-card";

export const Route = createFileRoute("/admin/_main/")({
  component: Home,
});

function Home() {
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
            <Button variant="outline" size="lg">
              <Plus /> Tambah
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Card className="rounded-sm p-4 shadow-none border-none gap-2">
          <CardHeader className="p-0 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-normal">Total Kamar</CardTitle>
            <ArrowUpRight />
          </CardHeader>
          <CardContent className="flex flex-row items-end p-0 gap-2">
            <h1 className="text-2xl">12</h1>
            <p className="text-sm font-normal">Kamar</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm p-4 shadow-none border-none gap-2">
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
          <Card className="rounded-sm p-4 shadow-none border-none gap-2">
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
        <Card className="rounded-sm p-4 shadow-none border-none gap-2">
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
          <div className="flex flex-col gap-3 py-4 w-5/6">
            <h1 className="text-sm mt-3">Lantai 1</h1>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <RoomCard roomNumber={1} status="terisi" />
                <RoomCard roomNumber={2} status="kosong" />
              </div>
              <RoomCard roomNumber={3} status="bermasalah" />
            </div>
            <div className="flex flex-col gap-3 mt-12">
              <div className="flex flex-col gap-6">
                <RoomCard roomNumber={4} status="kosong" />
                <RoomCard roomNumber={5} status="terisi" />
              </div>
              <RoomCard roomNumber={6} status="terisi" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg text-end mb-5">Lantai 2</h1>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <RoomCard roomNumber={12} status="kosong" />
                <RoomCard roomNumber={11} status="bermasalah" />
              </div>
              <RoomCard roomNumber={10} status="terisi" />
            </div>
            <div className="flex flex-col gap-3 mt-20">
              <div className="flex flex-col gap-6">
                <RoomCard roomNumber={9} status="terisi" />
                <RoomCard roomNumber={8} status="kosong" />
              </div>
              <RoomCard roomNumber={7} status="kosong" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
