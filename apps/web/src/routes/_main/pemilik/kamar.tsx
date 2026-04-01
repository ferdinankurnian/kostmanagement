import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, Clock } from "lucide-react";
import {
  RoomCardDrawerManagement,
  type RoomStatus,
} from "@/components/room-card-management";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getAllKamar, getOngoingOnboarding } from "@/lib/kamar";

export const Route = createFileRoute("/_main/pemilik/kamar")({
  component: KamarPage,
});

function KamarPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: getAllKamar,
  });

  const { data: ongoingData } = useQuery({
    queryKey: ["ongoing-onboarding"],
    queryFn: getOngoingOnboarding,
    refetchInterval: 5000,
  });

  const getRoomData = (nomor: number) =>
    data?.find((r) => r.nomor === nomor) ?? {
      status: "kosong" as RoomStatus,
      penghuni: null,
      catatan: null,
    };

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.history.back()}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Kelola Kamar</h1>
        </TopBarCenter>
      </TopBar>

      {ongoingData && ongoingData.length > 0 && (
        <div className="space-y-2">
          {ongoingData.map((item) => (
            <Link
              key={item.code}
              to="/pemilik/penghuni/created"
              search={{ code: item.code }}
            >
              <div className="flex items-center gap-3 rounded-xl border bg-yellow-500/10 p-4 border-yellow-500/20">
                <div className="flex size-10 items-center justify-center rounded-full bg-yellow-500/20">
                  <Clock className="size-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Setup belum selesai</p>
                  <p className="text-xs text-muted-foreground">
                    {item.name} - Kamar {item.noKamar}
                  </p>
                </div>
                <ArrowRight className="size-5 text-yellow-600" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 justify-between">
            <div className="flex flex-col gap-3 py-4 w-9/10">
              <h1 className="text-sm mt-3">Lantai 1</h1>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <RoomCardDrawerManagement
                    roomNumber={1}
                    status={getRoomData(1).status}
                    penghuni={getRoomData(1).penghuni}
                    catatan={getRoomData(1).catatan}
                  />
                  <RoomCardDrawerManagement
                    roomNumber={2}
                    status={getRoomData(2).status}
                    penghuni={getRoomData(2).penghuni}
                    catatan={getRoomData(2).catatan}
                  />
                </div>
                <RoomCardDrawerManagement
                  roomNumber={3}
                  status={getRoomData(3).status}
                  penghuni={getRoomData(3).penghuni}
                  catatan={getRoomData(3).catatan}
                />
              </div>
              <div className="flex flex-col gap-3 mt-12">
                <div className="flex flex-col gap-6">
                  <RoomCardDrawerManagement
                    roomNumber={4}
                    status={getRoomData(4).status}
                    penghuni={getRoomData(4).penghuni}
                    catatan={getRoomData(4).catatan}
                  />
                  <RoomCardDrawerManagement
                    roomNumber={5}
                    status={getRoomData(5).status}
                    penghuni={getRoomData(5).penghuni}
                    catatan={getRoomData(5).catatan}
                  />
                </div>
                <RoomCardDrawerManagement
                  roomNumber={6}
                  status={getRoomData(6).status}
                  penghuni={getRoomData(6).penghuni}
                  catatan={getRoomData(6).catatan}
                />
              </div>
            </div>
            <div className="flex flex-col ml-auto w-9/10">
              <h1 className="text-lg text-end mb-5">Lantai 2</h1>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <RoomCardDrawerManagement
                    roomNumber={12}
                    status={getRoomData(12).status}
                    penghuni={getRoomData(12).penghuni}
                    catatan={getRoomData(12).catatan}
                  />
                  <RoomCardDrawerManagement
                    roomNumber={11}
                    status={getRoomData(11).status}
                    penghuni={getRoomData(11).penghuni}
                    catatan={getRoomData(11).catatan}
                  />
                </div>
                <RoomCardDrawerManagement
                  roomNumber={10}
                  status={getRoomData(10).status}
                  penghuni={getRoomData(10).penghuni}
                  catatan={getRoomData(10).catatan}
                />
              </div>
              <div className="flex flex-col gap-3 mt-20">
                <div className="flex flex-col gap-6">
                  <RoomCardDrawerManagement
                    roomNumber={9}
                    status={getRoomData(9).status}
                    penghuni={getRoomData(9).penghuni}
                    catatan={getRoomData(9).catatan}
                  />
                  <RoomCardDrawerManagement
                    roomNumber={8}
                    status={getRoomData(8).status}
                    penghuni={getRoomData(8).penghuni}
                    catatan={getRoomData(8).catatan}
                  />
                </div>
                <RoomCardDrawerManagement
                  roomNumber={7}
                  status={getRoomData(7).status}
                  penghuni={getRoomData(7).penghuni}
                  catatan={getRoomData(7).catatan}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
