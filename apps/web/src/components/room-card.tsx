import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

// Status kamar: 'kosong' | 'terisi' | 'bermasalah' | 'bermasalah-terisi' | 'booked'
export type RoomStatus =
  | "kosong"
  | "terisi"
  | "bermasalah"
  | "bermasalah-terisi"
  | "booked";

interface RoomCardProps {
  roomNumber: number;
  status: RoomStatus;
}

export function RoomCard({ roomNumber, status }: RoomCardProps) {
  const isLightBackground = status === "kosong";

  return (
    <Card
      className={`rounded-xl gap-1 p-3 cursor-pointer transition-all hover:brightness-95 ${
        status === "kosong"
          ? "bg-linear-to-br from-gray-100 to-gray-200 border-gray-300"
          : status === "bermasalah" || status === "bermasalah-terisi"
            ? "bg-red-500 text-white border-red-600"
            : status === "booked"
              ? "bg-yellow-400 text-gray-900 border-yellow-500"
              : "bg-primary text-white border-blue-500"
      }`}
    >
      <CardHeader className="p-0">
        <div className="flex justify-between items-center">
          <h1
            className={
              isLightBackground
                ? "text-muted-foreground"
                : status === "booked"
                  ? "text-gray-900"
                  : "text-white"
            }
          >
            Kamar
          </h1>
          <div className="flex items-center gap-1">
            {status === "bermasalah-terisi" && (
              <User className="w-4 h-4 text-white" />
            )}
            {(status === "bermasalah" || status === "bermasalah-terisi") && (
              <AlertCircle className="w-4 h-4 text-white" />
            )}
            {status === "terisi" && <User className="w-4 h-4 text-white" />}
            {status === "booked" && (
              <BookOpen className="w-4 h-4 text-gray-900" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <h1
          className={`text-2xl ${isLightBackground ? "" : status === "booked" ? "text-gray-900" : "text-white"}`}
        >
          {roomNumber}
        </h1>
      </CardContent>
    </Card>
  );
}

interface RoomCardDrawerProps {
  roomNumber: number;
  status: RoomStatus;
  penghuni: {
    nama: string;
    noTelepon: string | null;
    tanggalMasuk: Date | string;
  } | null;
  catatan: string | null;
}

export function RoomCardDrawer({
  roomNumber,
  status,
  penghuni,
  catatan,
}: RoomCardDrawerProps) {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (status) {
      case "kosong":
        return {
          icon: <div className="size-4 bg-gray-400 rounded-full" />,
          text: "Kosong",
          color: "bg-gray-100 text-gray-600",
        };
      case "terisi":
        return {
          icon: <User className="size-4 text-white" />,
          text: "Terisi",
          color: "bg-blue-600 text-white",
        };
      case "bermasalah":
        return {
          icon: <AlertCircle className="size-4 text-white" />,
          text: "Bermasalah",
          color: "bg-red-600 text-white",
        };
      case "bermasalah-terisi":
        return {
          icon: <AlertCircle className="size-4 text-white" />,
          text: "Bermasalah & Terisi",
          color: "bg-red-600 text-white",
        };
      case "booked":
        return {
          icon: <BookOpen className="size-4 text-gray-900" />,
          text: "Dibooking",
          color: "bg-yellow-400 text-gray-900",
        };
    }
  };

  const getDrawerContent = () => {
    switch (status) {
      case "kosong":
        return (
          <div className="px-6 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <p>Kamar kosong dan siap ditempati</p>
            </div>
            {catatan && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Catatan</span>
                  <p>{catatan}</p>
                </div>
              </>
            )}
          </div>
        );
      case "terisi":
        return (
          <div className="px-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Nama</span>
              <span className="font-medium">{penghuni?.nama ?? "-"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">No. Telepon</span>
              <span className="font-medium">{penghuni?.noTelepon ?? "-"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Tanggal Masuk
              </span>
              <span className="font-medium">
                {penghuni?.tanggalMasuk
                  ? new Date(penghuni.tanggalMasuk).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : "-"}
              </span>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Catatan</span>
              <p>{catatan ?? "Tidak ada catatan"}</p>
            </div>
          </div>
        );
      case "bermasalah":
        return (
          <div className="px-6 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Masalah</span>
              <p>Kerusakan struktural pada dinding</p>
            </div>
          </div>
        );
      case "bermasalah-terisi":
        return (
          <div className="px-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Nama Penghuni
              </span>
              <span className="font-medium">{penghuni?.nama ?? "-"}</span>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Masalah</span>
              <p>AC tidak berfungsi</p>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                Tanggal Dilaporkan
              </span>
              <p>28 Februari 2025</p>
            </div>
          </div>
        );
      case "booked":
        return (
          <div className="px-6 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <p>Kamar ini sudah dibooking oleh calon penghuni</p>
            </div>
            {penghuni && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Nama Pemesan
                  </span>
                  <span className="font-medium">{penghuni.nama}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    No. Telepon
                  </span>
                  <span className="font-medium">
                    {penghuni.noTelepon ?? "-"}
                  </span>
                </div>
              </>
            )}
            {catatan && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Catatan</span>
                  <p>{catatan}</p>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  const getFooterMessage = () => {
    switch (status) {
      case "kosong":
        return (
          <p className="mt-3 text-xs text-center text-green-600">
            Kamar ini tersedia untuk dipilih
          </p>
        );
      case "terisi":
        return (
          <p className="mt-3 text-xs text-center text-muted-foreground">
            Anda tidak bisa memilih kamar ini karena sudah terisi
          </p>
        );
      case "bermasalah":
        return (
          <p className="mt-3 text-xs text-center text-orange-600">
            Kamar bisa dipilih meskipun ada masalah
          </p>
        );
      case "bermasalah-terisi":
        return (
          <p className="mt-3 text-xs text-center text-red-600">
            Kamar bermasalah dan sudah terisi
          </p>
        );
      case "booked":
        return (
          <p className="mt-3 text-xs text-center text-yellow-700">
            Kamar ini sedang dalam proses booking
          </p>
        );
    }
  };

  const isSelectable = status === "kosong" || status === "bermasalah";
  const badge = getStatusBadge();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button type="button" className="text-left">
          <RoomCard roomNumber={roomNumber} status={status} />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6 mb-2 flex flex-row justify-between items-center">
          <div className="text-left">
            <DrawerTitle>Kamar {roomNumber}</DrawerTitle>
            <DrawerDescription>Detail kamar</DrawerDescription>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge?.color}`}
          >
            {badge?.icon}
            <span className="text-sm font-medium">{badge?.text}</span>
          </div>
        </DrawerHeader>
        {getDrawerContent()}
        <DrawerFooter>
          {getFooterMessage()}
          {isSelectable ? (
            <Button
              onClick={() =>
                navigate({
                  to: "/pemilik/penghuni/form",
                  search: { kamar: roomNumber },
                })
              }
            >
              Pilih
            </Button>
          ) : (
            <DrawerClose asChild>
              <Button variant="outline">Tutup</Button>
            </DrawerClose>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
