import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { RoomCard } from "@/components/room-card";

export const Route = createFileRoute("/admin/tambah-penghuni/pilih-kamar")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => navigate({ to: "/admin" })}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Pilih Kamar</h1>
        </TopBarCenter>
      </TopBar>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 justify-between">
          <div className="flex flex-col gap-3 py-4 w-5/6">
            <h1 className="text-sm mt-3">Lantai 1</h1>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Link to="/admin/tambah-penghuni/form" search={{ kamar: 1 }}>
                  <RoomCard roomNumber={1} status="terisi" />
                </Link>
                <Link to="/admin/tambah-penghuni/form" search={{ kamar: 2 }}>
                  <RoomCard roomNumber={2} status="kosong" />
                </Link>
              </div>
              <Link to="/admin/tambah-penghuni/form" search={{ kamar: 3 }}>
                <RoomCard roomNumber={3} status="bermasalah" />
              </Link>
            </div>
            <div className="flex flex-col gap-3 mt-12">
              <div className="flex flex-col gap-6">
                <Link to="/admin/tambah-penghuni/form" search={{ kamar: 4 }}>
                  <RoomCard roomNumber={4} status="kosong" />
                </Link>
                <Link to="/admin/tambah-penghuni/form" search={{ kamar: 5 }}>
                  <RoomCard roomNumber={5} status="terisi" />
                </Link>
              </div>
              <Link to="/admin/tambah-penghuni/form" search={{ kamar: 6 }}>
                <RoomCard roomNumber={6} status="terisi" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg text-end mb-5">Lantai 2</h1>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Link to="/admin/tambah-penghuni/form" search={{ kamar: 12 }}>
                  <RoomCard roomNumber={12} status="kosong" />
                </Link>
                <Link to="/admin/tambah-penghuni/form" search={{ kamar: 11 }}>
                  <RoomCard roomNumber={11} status="bermasalah" />
                </Link>
              </div>
              <Link to="/admin/tambah-penghuni/form" search={{ kamar: 10 }}>
                <RoomCard roomNumber={10} status="terisi" />
              </Link>
            </div>
            <div className="flex flex-col gap-3 mt-20">
              <div className="flex flex-col gap-6">
                <Link to="/admin/tambah-penghuni/form" search={{ kamar: 9 }}>
                  <RoomCard roomNumber={9} status="terisi" />
                </Link>
                <Link to="/admin/tambah-penghuni/form" search={{ kamar: 8 }}>
                  <RoomCard roomNumber={8} status="kosong" />
                </Link>
              </div>
              <Link to="/admin/tambah-penghuni/form" search={{ kamar: 7 }}>
                <RoomCard roomNumber={7} status="kosong" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
