import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2, Upload, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar, TopBarCenter } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { authClient } from "@/lib/auth-client";
import { uploadKTP } from "@/lib/upload";

export const Route = createFileRoute("/_main/penghuni/status")({
  beforeLoad: async ({ context }) => {
    // If KTP is approved, redirect to dashboard
    if ((context.user as any).ktpStatus === "approved") {
      throw redirect({ to: "/penghuni" });
    }
  },
  component: StatusPage,
});

function StatusPage() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const [isUploading, setIsUploading] = useState(false);
  const [ktpFile, setKtpFile] = useState<File | undefined>();

  const handleReupload = async () => {
    if (!ktpFile) return;

    setIsUploading(true);
    try {
      await uploadKTP(ktpFile);
      toast.success("KTP berhasil diunggah!");
      setKtpFile(undefined);
      // Refresh session to get updated status
      await authClient.getSession();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah KTP.";

      if (message.includes("Unauthorized") || message.includes("401")) {
        toast.error("Sesi telah habis. Silakan login kembali.");
        navigate({ to: "/login" });
        return;
      }

      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  // KTP rejected — show re-upload form
  if (user.ktpStatus === "rejected") {
    return (
      <div className="flex min-h-screen flex-col items-center px-6 pt-20 text-center">
        <TopBar>
          <TopBarCenter>
            <h1 className="text-lg">Status KTP</h1>
          </TopBarCenter>
        </TopBar>

        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="size-10 text-destructive" />
        </div>

        <h1 className="text-xl font-semibold">KTP Ditolak</h1>
        {user.ktpRejectionReason && (
          <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Alasan: {user.ktpRejectionReason}
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
              <Loader2 className="mr-2 size-4 animate-spin" />
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
  if (user.ktpStatus === "approved") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="size-10 text-green-500" />
        </div>
        <h1 className="text-xl font-semibold">KTP Diverifikasi!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Mengalihkan ke dashboard...
        </p>
      </div>
    );
  }

  // Default: waiting for KTP verification
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <TopBar>
        <TopBarCenter>
          <h1 className="text-lg">Status KTP</h1>
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
          {user.ktp && (
            <div className="mt-3">
              <p className="mb-2 text-xs text-muted-foreground">
                KTP yang diunggah:
              </p>
              <img
                src={user.ktp}
                alt="KTP"
                className="max-h-48 w-full rounded-lg border object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
