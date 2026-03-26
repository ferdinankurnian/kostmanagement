import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
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
import { validateInvite } from "@/lib/invite";

export const Route = createFileRoute("/_auth/sign-up/")({
  validateSearch: (search) => ({
    code: (search.code as string) ?? undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { code: codeFromUrl } = Route.useSearch();
  const [code, setCode] = useState(codeFromUrl ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError("Kode harus 6 karakter");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await validateInvite({ code });
      toast.success(`Halo ${result.name}! Silakan isi data akun Anda.`);
      navigate({
        to: "/sign-up/form",
        search: {
          inviteCode: result.code.toUpperCase(),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kode tidak valid.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-lg whitespace-nowrap">Sign Up</h1>
        </TopBarCenter>
      </TopBar>
      <div className="space-y-4 px-4">
        <form
          id="code-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
          className="flex flex-col items-center"
        >
          <Label className="text-2xl font-normal mb-5">
            Silahkan masukkan kode:
          </Label>
          <div className="flex flex-col items-center gap-2">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(val) => {
                setCode(val);
                setError(null);
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot className="text-lg" index={0} />
                <InputOTPSlot className="text-lg" index={1} />
                <InputOTPSlot className="text-lg" index={2} />
                <InputOTPSlot className="text-lg" index={3} />
                <InputOTPSlot className="text-lg" index={4} />
                <InputOTPSlot className="text-lg" index={5} />
              </InputOTPGroup>
            </InputOTP>
            {error && <p className="text-xs text-destructive mt-2">{error}</p>}
          </div>
          <p className="text-sm text-foreground/80 text-center mt-5">
            Kode apa ini?
          </p>
          <p className="text-xs text-muted-foreground/80 text-center w-64 mt-1">
            Lihat kode yang ditampilkan pada layar pemilik kost, atau scan QR
            code yang diberikan.
          </p>
        </form>
        <Button
          type="submit"
          form="code-form"
          disabled={isLoading || code.length !== 6}
          className="max-w-lg rounded-full fixed bottom-0 left-4 right-4 mx-auto mb-4"
        >
          {isLoading ? <Loader2 className="animate-spin mr-2 inline" /> : null}
          Lanjut
        </Button>
      </div>
    </div>
  );
}
