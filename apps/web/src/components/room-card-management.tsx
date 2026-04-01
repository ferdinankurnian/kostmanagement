import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  KeyRound,
  ShieldAlert,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerNestedRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  removePenghuni,
  resetPenghuniPassword,
  updateKamar,
} from "@/lib/kamar";

export type RoomStatus =
  | "kosong"
  | "terisi"
  | "bermasalah"
  | "bermasalah-terisi"
  | "booked";

interface RoomCardManagementProps {
  roomNumber: number;
  status: RoomStatus;
  penghuni: {
    nama: string;
    noTelepon: string | null;
    tanggalMasuk: Date | string;
  } | null;
  catatan: string | null;
}

function RoomCard({
  roomNumber,
  status,
}: {
  roomNumber: number;
  status: RoomStatus;
}) {
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

function isBermasalah(status: RoomStatus) {
  return status === "bermasalah" || status === "bermasalah-terisi";
}

function computeStatus(bermasalah: boolean, hasPenghuni: boolean): RoomStatus {
  if (bermasalah) {
    return hasPenghuni ? "bermasalah-terisi" : "bermasalah";
  }
  return hasPenghuni ? "terisi" : "kosong";
}

function getStatusBadge(s: RoomStatus) {
  switch (s) {
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
}

function KickPenghuniDrawer({
  roomNumber,
  penghuniNama,
}: {
  roomNumber: number;
  penghuniNama: string;
}) {
  const queryClient = useQueryClient();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const removeMutation = useMutation({
    mutationFn: () => removePenghuni(roomNumber, pin),
    onSuccess: () => {
      toast.success("Penghuni berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Gagal menghapus penghuni");
      setError(e.message || "PIN salah");
    },
  });

  return (
    <DrawerNestedRoot>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="size-4 mr-2" />
          Hapus Penghuni
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="size-5 text-red-600" />
          </div>
          <DrawerTitle>Hapus Penghuni?</DrawerTitle>
          <DrawerDescription>
            <strong>{penghuniNama}</strong> akan dihapus dari Kamar {roomNumber}
            . Masukkan PIN keamanan untuk melanjutkan.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 space-y-5 pb-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={(v) => {
                setPin(v);
                setError("");
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="size-12 text-lg" />
                <InputOTPSlot index={1} className="size-12 text-lg" />
                <InputOTPSlot index={2} className="size-12 text-lg" />
                <InputOTPSlot index={3} className="size-12 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <SlideToConfirm
            onConfirm={() => removeMutation.mutate()}
            isLoading={removeMutation.isPending}
            disabled={pin.length < 4}
            text="Geser untuk hapus penghuni"
          />
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </DrawerNestedRoot>
  );
}

function ResetPasswordDrawer({
  roomNumber,
  penghuniNama,
}: {
  roomNumber: number;
  penghuniNama: string;
}) {
  const queryClient = useQueryClient();
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [drawer2Open, setDrawer2Open] = useState(false);
  const [drawer3Open, setDrawer3Open] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => resetPenghuniPassword(roomNumber, pin, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setDrawer3Open(false);
      setDrawer2Open(false);
      setPin("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: Error) => {
      setError(e.message || "Gagal mereset password");
    },
  });

  const passwordValid =
    newPassword.length >= 8 && newPassword === confirmPassword;

  return (
    <DrawerNestedRoot open={drawer2Open} onOpenChange={setDrawer2Open}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full">
          <KeyRound className="size-4 mr-2" />
          Reset Password
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-blue-100">
            <KeyRound className="size-5 text-blue-600" />
          </div>
          <DrawerTitle>Reset Password</DrawerTitle>
          <DrawerDescription>
            Reset password untuk <strong>{penghuniNama}</strong> di Kamar{" "}
            {roomNumber}.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 space-y-4 pb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="new-password">
              Password Baru
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="confirm-password">
              Konfirmasi Password
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">Password tidak cocok</p>
            )}
          </div>

          <DrawerNestedRoot open={drawer3Open} onOpenChange={setDrawer3Open}>
            <DrawerTrigger asChild>
              <Button className="w-full" disabled={!passwordValid}>
                Lanjut
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-center">
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-blue-100">
                  <KeyRound className="size-5 text-blue-600" />
                </div>
                <DrawerTitle>Konfirmasi Reset</DrawerTitle>
                <DrawerDescription>
                  Masukkan PIN keamanan untuk melanjutkan.
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-6 space-y-5 pb-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={(v) => {
                      setPin(v);
                      setError("");
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="size-12 text-lg" />
                      <InputOTPSlot index={1} className="size-12 text-lg" />
                      <InputOTPSlot index={2} className="size-12 text-lg" />
                      <InputOTPSlot index={3} className="size-12 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <SlideToConfirm
                  onConfirm={() => resetMutation.mutate()}
                  isLoading={resetMutation.isPending}
                  disabled={pin.length < 4}
                  text="Geser untuk reset password"
                />
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Batal</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </DrawerNestedRoot>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </DrawerNestedRoot>
  );
}

export function RoomCardDrawerManagement({
  roomNumber,
  status,
  penghuni,
  catatan,
}: RoomCardManagementProps) {
  const queryClient = useQueryClient();
  const [bermasalah, setBermasalah] = useState(isBermasalah(status));
  const [editCatatan, setEditCatatan] = useState(catatan ?? "");
  const [isOpen, setIsOpen] = useState(false);

  const hasChanges =
    bermasalah !== isBermasalah(status) || editCatatan !== (catatan ?? "");

  const newStatus = computeStatus(bermasalah, !!penghuni);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateKamar(roomNumber, {
        status: newStatus,
        catatan: editCatatan.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const badge = getStatusBadge(status);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button type="button" className="text-left">
          <RoomCard roomNumber={roomNumber} status={status} />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6 mb-2 flex flex-row justify-between items-center">
          <div className="text-left">
            <DrawerTitle>Kamar {roomNumber}</DrawerTitle>
            <DrawerDescription>Kelola detail kamar</DrawerDescription>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge?.color}`}
          >
            {badge?.icon}
            <span className="text-sm font-medium">{badge?.text}</span>
          </div>
        </DrawerHeader>

        <div className="px-6 space-y-5 pb-4">
          {penghuni && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nama</span>
                <span className="font-medium">{penghuni.nama}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  No. Telepon
                </span>
                <span className="font-medium">{penghuni.noTelepon ?? "-"}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tanggal Masuk
                </span>
                <span className="font-medium">
                  {new Date(penghuni.tanggalMasuk).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Separator />
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm">Tandai Bermasalah</span>
            <Switch checked={bermasalah} onCheckedChange={setBermasalah} />
          </div>

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Catatan</span>
            <Textarea
              placeholder="Tambahkan catatan untuk kamar ini..."
              value={editCatatan}
              onChange={(e) => setEditCatatan(e.target.value)}
              rows={3}
            />
          </div>

          {penghuni && (
            <div className="space-y-2">
              <ResetPasswordDrawer
                roomNumber={roomNumber}
                penghuniNama={penghuni.nama}
              />
              <KickPenghuniDrawer
                roomNumber={roomNumber}
                penghuniNama={penghuni.nama}
              />
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Tutup</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
