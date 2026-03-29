import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_main/pemilik/pengaturan/pin/baru")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      oldPin: search.oldPin as string,
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { oldPin } = Route.useSearch();
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");

  const canSubmit = newPin.length === 4;

  const handleSubmit = () => {
    if (newPin === oldPin) {
      setError("PIN baru harus berbeda dari PIN lama");
      return;
    }

    navigate({
      to: "/pemilik/pengaturan/pin/konfirmasi",
      search: { pin: newPin, oldPin },
    });
  };

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/pemilik/pengaturan/pin" })}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">PIN Baru</h1>
        </TopBarCenter>
      </TopBar>

      <div className="space-y-6 pt-4">
        <p className="text-sm text-muted-foreground">Buat PIN baru 4 digit.</p>

        <div className="space-y-2">
          <Label className="text-center block">PIN Baru</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={newPin}
              onChange={(v) => {
                setNewPin(v);
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

        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
          Lanjut
        </Button>
      </div>
    </div>
  );
}
