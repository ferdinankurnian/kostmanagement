import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_main/pemilik/pengaturan/pin/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [oldPin, setOldPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = oldPin.length === 4;

  const handleVerify = () => {
    setIsLoading(true);
    setError("");

    navigate({
      to: "/pemilik/pengaturan/pin/baru",
      search: { oldPin },
    });
  };

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Verifikasi PIN</h1>
        </TopBarCenter>
      </TopBar>

      <div className="space-y-6 pt-4">
        <p className="text-sm text-muted-foreground">
          Masukkan PIN lama untuk melanjutkan.
        </p>

        <div className="space-y-2">
          <Label className="text-center block">PIN Lama</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={oldPin}
              onChange={(v) => {
                setOldPin(v);
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

        <Button
          onClick={handleVerify}
          disabled={!canSubmit || isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="animate-spin mr-2 size-4" />}
          Lanjut
        </Button>
      </div>
    </div>
  );
}
