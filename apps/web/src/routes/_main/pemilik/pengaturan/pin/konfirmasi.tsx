import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { changePin } from "@/lib/settings";

export const Route = createFileRoute(
  "/_main/pemilik/pengaturan/pin/konfirmasi",
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      pin: search.pin as string,
      oldPin: search.oldPin as string,
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { pin, oldPin } = Route.useSearch();
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const canConfirm = confirmPin.length === 4;

  const handleConfirm = async () => {
    if (confirmPin !== pin) {
      setError("PIN tidak sama");
      return;
    }

    setIsLoading(true);
    try {
      await changePin(oldPin, pin);
      toast.success("PIN berhasil diubah");
      setIsSuccess(true);
      setTimeout(() => {
        navigate({ to: "/pemilik", replace: true });
      }, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengubah PIN");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 space-y-6">
        <CheckCircle className="size-20 text-green-500" />
        <h1 className="text-2xl font-semibold text-center">
          PIN Berhasil Diubah
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Kembali ke profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigate({
                to: "/pemilik/pengaturan/pin/baru",
                search: { oldPin: oldPin ?? "" },
              })
            }
            disabled={isLoading}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Konfirmasi</h1>
        </TopBarCenter>
      </TopBar>

      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label className="text-center block">Masukkan PIN Baru Lagi</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={confirmPin}
              onChange={(v) => {
                setConfirmPin(v);
                setError("");
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="size-11 text-lg" />
                <InputOTPSlot index={1} className="size-11 text-lg" />
                <InputOTPSlot index={2} className="size-11 text-lg" />
                <InputOTPSlot index={3} className="size-11 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="pt-4">
          <SlideToConfirm
            onConfirm={handleConfirm}
            isLoading={isLoading}
            disabled={!canConfirm}
            text="Slide untuk konfirmasi"
          />
        </div>
      </div>
    </div>
  );
}
