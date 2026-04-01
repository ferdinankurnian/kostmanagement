import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  CheckIcon,
  Clock,
  Copy,
  Loader2,
  ReceiptText,
  UserCheck,
  UserCog,
  XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Textarea } from "@/components/ui/textarea";
import { getTagihan, type Tagihan } from "@/lib/tagihan";
import { verifyKTP } from "@/lib/upload";
import { connectOnboardingWS, type OnboardingStatus } from "@/lib/ws";

const searchSchema = z.object({
  code: z.coerce.string(),
});

export const Route = createFileRoute("/_main/pemilik/penghuni/created")({
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { code } = Route.useSearch();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const wsRef = useRef<{ close: () => void } | null>(null);

  const handleStatus = useCallback((data: OnboardingStatus) => {
    setStatus(data);
    setConnected(true);
  }, []);

  useEffect(() => {
    const ws = connectOnboardingWS(code, handleStatus);
    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [code, handleStatus]);

  const handleCopy = () => {
    if (!status) return;
    navigator.clipboard.writeText(status.code);
    setCopied(true);
    toast.success("Kode berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const approveMutation = useMutation({
    mutationFn: () =>
      verifyKTP({ noKamar: status!.noKamar, status: "approved" }),
    onSuccess: () => {
      toast.success("KTP diterima!");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: () => {
      toast.error("Gagal memverifikasi KTP");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      verifyKTP({
        noKamar: status!.noKamar,
        status: "rejected",
        reason: rejectReason,
      }),
    onSuccess: () => {
      toast.success("KTP ditolak, penghuni diminta mengunggah kembali");
      setShowReject(false);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: () => {
      toast.error("Gagal menolak KTP");
    },
  });

  // Loading state
  if (!connected || !status) {
    return (
      <div className="flex flex-col items-center justify-center p-4 py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Menghubungkan...</p>
      </div>
    );
  }

  // State: invite not used yet — show code + QR
  if (!status.isUsed) {
    const signUpUrl = `${window.location.origin}/sign-up?code=${status.code}`;

    return (
      <div className="flex flex-col p-4 pb-14">
        <div className="flex flex-col justify-center items-center gap-2 py-8">
          <div className="p-3 rounded-full bg-yellow-500">
            <UserCog size={28} className="text-white" />
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-xl font-semibold">
              Menunggu penghuni mendaftar...
            </h1>
            <p className="text-muted-foreground text-sm">
              {status.name} di Kamar {status.noKamar}
            </p>
          </div>
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-col justify-center items-center">
              <CardTitle>Kode Verifikasi Sign Up</CardTitle>
              <CardDescription className="text-center">
                Silakan masukkan kode berikut untuk mengaktifkan akun penghuni.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center gap-4">
              <InputOTP maxLength={6} value={status.code} disabled>
                <InputOTPGroup>
                  {status.code.split("").map((_, i) => (
                    <InputOTPSlot key={i} className="text-lg" index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <QRCodeSVG value={signUpUrl} size={200} />
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckIcon className="size-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Copy Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          <div className="text-sm py-4 text-muted-foreground">
            <p className="font-medium mb-2">Cara panduan:</p>
            <ol className="list-decimal list-outside ml-4 space-y-1">
              <li>
                Buka tautan <span className="font-medium">{signUpUrl}</span>{" "}
                atau scan QR code di atas menggunakan kamera ponsel Anda.
              </li>
              <li>
                Setelah halaman terbuka, masukkan kode verifikasi yang tertera
                di atas.
              </li>
              <li>Ikuti langkah-langkah pengisian formulir hingga selesai.</li>
            </ol>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent">
          <Link to="/pemilik">
            <Button
              type="button"
              className="w-full max-w-lg rounded-full mx-auto block"
            >
              Selesai
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // State: signed up but no KTP yet
  if (!status.user?.ktp) {
    return (
      <div className="flex flex-col items-center p-4 py-20 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-yellow-500/10">
          <UserCheck size={32} className="text-yellow-500" />
        </div>
        <h1 className="text-xl font-semibold">Penghuni sudah mendaftar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {status.user?.name ?? status.name} di Kamar {status.noKamar}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Menunggu penghuni mengunggah foto KTP...
        </p>
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Menunggu unggah KTP
        </div>
      </div>
    );
  }

  // State: KTP uploaded, waiting for review
  if (status.user.ktpStatus === "pending") {
    return (
      <div className="flex flex-col p-4 pb-32">
        <div className="flex flex-col justify-center items-center gap-2 py-8">
          <div className="p-3 rounded-full bg-primary">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-xl font-semibold">Verifikasi KTP</h1>
            <p className="text-muted-foreground text-sm">
              {status.user.name} di Kamar {status.noKamar}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto KTP Penghuni</CardTitle>
            <CardDescription>
              Periksa foto KTP di bawah. Jika sesuai, klik Terima. Jika tidak,
              klik Tolak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={status.user.ktp}
              alt="KTP Penghuni"
              className="w-full rounded-xl border object-contain max-h-96"
            />
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-lg border-t bg-background p-4 space-y-3">
          {showReject ? (
            <>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan penolakan..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1 gap-1.5"
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                  Tolak
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReject(false);
                    setRejectReason("");
                  }}
                >
                  Batal
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-1.5"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Terima
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-1.5"
                onClick={() => setShowReject(true)}
              >
                <XCircle className="size-4" />
                Tolak
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // State: KTP approved — show tagihan status
  if (status.user.ktpStatus === "approved") {
    return <KtpApprovedState status={status} />;
  }

  // State: KTP rejected (waiting for re-upload)
  return (
    <div className="flex flex-col items-center p-4 py-20 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircle size={32} className="text-destructive" />
      </div>
      <h1 className="text-xl font-semibold">KTP Ditolak</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {status.user.name} di Kamar {status.noKamar}
      </p>
      {status.user.ktpRejectionReason && (
        <div className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive max-w-sm">
          Alasan: {status.user.ktpRejectionReason}
        </div>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        Menunggu penghuni mengunggah kembali KTP...
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Menunggu unggah ulang
      </div>
    </div>
  );
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

const tagihanStatusMap: Record<
  Tagihan["status"],
  { label: string; color: string; icon: typeof Clock }
> = {
  belum_dibayar: {
    label: "Belum Dibayar",
    color: "text-muted-foreground",
    icon: ReceiptText,
  },
  menunggu_verifikasi: {
    label: "Menunggu Verifikasi",
    color: "text-yellow-500",
    icon: Clock,
  },
  lunas: { label: "Lunas", color: "text-green-500", icon: CheckCircle2 },
  ditolak: { label: "Ditolak", color: "text-red-500", icon: XCircle },
};

function KtpApprovedState({ status }: { status: OnboardingStatus }) {
  const { userName, noKamar } = {
    userName: status.user!.name,
    noKamar: status.noKamar,
  };
  const tagihan = status.tagihan;

  // Tagihan lunas → semua selesai
  if (tagihan?.status === "lunas") {
    return (
      <div className="flex flex-col items-center p-4 py-20 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h1 className="text-xl font-semibold">Selamat Datang Penghuni Baru!</h1>
        <p className="mt-2 text-lg font-medium text-green-600">
          {userName} resmi masuk Kamar {noKamar}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          KTP dan tagihan sudah terverifikasi. Penghuni bisa mulai menggunakan
          aplikasi.
        </p>
        <div className="mt-8 w-full max-w-sm space-y-3">
          <Link to="/pemilik">
            <Button className="w-full rounded-full" size="lg">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Tagihan menunggu verifikasi → show bukti
  if (tagihan?.status === "menunggu_verifikasi") {
    const statusInfo = tagihanStatusMap[tagihan.status];
    return (
      <div className="flex flex-col p-4 pb-20">
        <div className="flex flex-col justify-center items-center gap-2 py-8">
          <div className="p-3 rounded-full bg-yellow-500">
            <Clock size={28} className="text-white animate-pulse" />
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-xl font-semibold">Verifikasi Pembayaran</h1>
            <p className="text-muted-foreground text-sm">
              {userName} di Kamar {noKamar}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Periode</span>
            <span className="text-sm font-medium">{tagihan.periode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Jumlah</span>
            <span className="text-sm font-medium">
              {formatRupiah(tagihan.jumlah * (tagihan.monthsPaid ?? 1))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {tagihan.buktiPembayaran && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Bukti Pembayaran</p>
            <img
              src={tagihan.buktiPembayaran}
              alt="Bukti Pembayaran"
              className="w-full rounded-xl border object-contain max-h-96"
            />
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/pemilik/tagihan/detail" search={{ id: tagihan.id }}>
            <Button className="w-full max-w-sm rounded-full" size="lg">
              Lihat Detail & Verifikasi
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Tagihan ditolak → show status
  if (tagihan?.status === "ditolak") {
    return (
      <div className="flex flex-col p-4 pb-20">
        <div className="flex flex-col justify-center items-center gap-2 py-8">
          <div className="p-3 rounded-full bg-red-500">
            <XCircle size={28} className="text-white" />
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-xl font-semibold">Pembayaran Ditolak</h1>
            <p className="text-muted-foreground text-sm">
              {userName} di Kamar {noKamar}
            </p>
          </div>
        </div>
        {tagihan.alasanPenolakan && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Alasan: {tagihan.alasanPenolakan}
          </div>
        )}
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Menunggu penghuni mengunggah ulang bukti pembayaran...
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Menunggu unggah ulang
        </div>
      </div>
    );
  }

  // Default: waiting for penghuni to pay
  return (
    <div className="flex flex-col items-center p-4 py-20 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-yellow-500/10">
        <Clock size={32} className="text-yellow-500" />
      </div>
      <h1 className="text-xl font-semibold">Menunggu Pembayaran</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {userName} di Kamar {noKamar}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        KTP sudah terverifikasi. Menunggu penghuni membayar tagihan pertama.
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Menunggu pembayaran
      </div>
    </div>
  );
}
