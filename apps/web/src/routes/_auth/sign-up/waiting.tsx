import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2, Upload, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadKTP } from "@/lib/upload";
import { connectOnboardingWS, type OnboardingStatus } from "@/lib/ws";

export const Route = createFileRoute("/_auth/sign-up/waiting")({
  validateSearch: z.object({
    inviteCode: z.string(),
  }),
  beforeLoad: async ({ context }) => {
    // If KTP is already approved, go straight to onboarding
    if ((context as any).user?.ktpStatus === "approved") {
      throw redirect({ to: "/penghuni/onboarding" });
    }
  },
  component: WaitingPage,
});

function WaitingPage() {
  const { inviteCode } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [connected, setConnected] = useState(false);
  const [reuploading, setReuploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ktpFile, setKtpFile] = useState<File | undefined>();
  const wsRef = useRef<{ close: () => void } | null>(null);

  const handleStatus = useCallback(
    (data: OnboardingStatus) => {
      setStatus(data);
      setConnected(true);

      // If KTP approved, go to onboarding
      if (data.user?.ktpStatus === "approved") {
        toast.success("KTP diverifikasi!");
        navigate({ to: "/penghuni/onboarding" });
      }

      // If KTP rejected, show re-upload form
      if (data.user?.ktpStatus === "rejected") {
        setReuploading(true);
      }
    },
    [navigate],
  );

  useEffect(() => {
    const ws = connectOnboardingWS(inviteCode, handleStatus);
    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [inviteCode, handleStatus]);

  const handleReupload = async () => {
    if (!ktpFile) return;

    setIsUploading(true);
    try {
      await uploadKTP(ktpFile);
      toast.success("KTP berhasil diunggah kembali!");
      setReuploading(false);
      setKtpFile(undefined);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah KTP.";

      // If unauthorized, session might be expired — force re-login
      if (message.includes("Unauthorized") || message.includes("401")) {
        toast.error("Sesi telah habis. Silakan login kembali.");
        // Close WebSocket and redirect to login
        wsRef.current?.close();
        navigate({ to: "/login" });
        return;
      }

      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Still connecting
  if (!connected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <TopBar>
          <TopBarCenter>
            <h1 className="text-lg">Verifikasi KTP</h1>
          </TopBarCenter>
        </TopBar>
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Menghubungkan...</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Menunggu koneksi ke server.
        </p>
      </div>
    );
  }

  // KTP rejected — show re-upload form
  if (reuploading || status?.user?.ktpStatus === "rejected") {
    return (
      <div className="flex min-h-screen flex-col items-center px-6 pt-20 text-center">
        <TopBar>
          <TopBarCenter>
            <h1 className="text-lg">Unggah Ulang KTP</h1>
          </TopBarCenter>
        </TopBar>

        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="size-10 text-destructive" />
        </div>

        <h1 className="text-xl font-semibold">KTP Ditolak</h1>
        {status?.user?.ktpRejectionReason && (
          <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Alasan: {status.user.ktpRejectionReason}
          </div>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          Silakan unggah kembali foto KTP Anda.
        </p>

        <div className="mt-6 w-full max-w-sm space-y-4">
          <Field className="gap-4">
            <FileUpload
              id="ktp-reupload"
              accept="image/jpeg,image/png,image/webp"
              description="Format: JPG, PNG, atau WebP"
              maxSize={2}
              onFilesSelected={(files) => setKtpFile(files[0])}
              value={ktpFile ? [ktpFile] : []}
            />
          </Field>

          <Button
            onClick={handleReupload}
            disabled={isUploading || !ktpFile}
            className="w-full rounded-full"
            size="lg"
          >
            {isUploading ? (
              <Loader2 className="animate-spin mr-2 size-4" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            Unggah Ulang KTP
          </Button>
        </div>
      </div>
    );
  }

  // KTP approved
  if (status?.user?.ktpStatus === "approved") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="size-10 text-green-500" />
        </div>
        <h1 className="text-xl font-semibold">KTP Diverifikasi!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Mengalihkan ke onboarding...
        </p>
      </div>
    );
  }

  // Default: waiting for KTP verification
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg">Verifikasi KTP</h1>
        </TopBarCenter>
      </TopBar>

      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-yellow-500/10">
        <Clock className="size-10 text-yellow-500" />
      </div>

      <h1 className="text-xl font-semibold">Menunggu Verifikasi</h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        KTP Anda sedang menunggu verifikasi dari pemilik kost. Mohon tunggu
        sebentar.
      </p>

      <div className="mt-8 w-full max-w-sm rounded-xl border bg-card p-4 text-left">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-yellow-600">
              Menunggu verifikasi
            </span>
          </div>
          {status?.user?.ktp && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">
                KTP yang diunggah:
              </p>
              <img
                src={status.user.ktp}
                alt="KTP"
                className="rounded-lg border max-h-48 w-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
