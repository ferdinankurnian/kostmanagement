import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { updateOnboarding } from "@/lib/onboarding";
import { getSettings } from "@/lib/settings";
import {
  getTagihan,
  type MetodePembayaran,
  submitTagihan,
} from "@/lib/tagihan";
import { uploadBukti } from "@/lib/upload";

export const Route = createFileRoute(
  "/_main/penghuni/onboarding/bayar-tagihan",
)({
  component: BayarTagihanPage,
});

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function BayarTagihanPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [metode, setMetode] = useState<MetodePembayaran>("transfer");
  const [bukti, setBukti] = useState<string | null>(null);
  const [monthsPaid, setMonthsPaid] = useState(1);

  const user = Route.useRouteContext() as {
    user: { onboarding?: string | null };
  };
  const canLoadData = user.user.onboarding === "bayar_tagihan";

  useEffect(() => {
    if (!canLoadData) {
      navigate({
        to:
          user.user.onboarding === "greeting"
            ? "/penghuni/onboarding"
            : user.user.onboarding === "tour"
              ? "/penghuni"
              : "/penghuni/onboarding/rule",
      });
    }
  }, [canLoadData, navigate, user.user.onboarding]);

  const {
    data: tagihanList = [],
    isLoading: isTagihanLoading,
    isError: isTagihanError,
    refetch: refetchTagihan,
  } = useQuery({
    queryKey: ["tagihan"],
    queryFn: getTagihan,
    enabled: canLoadData,
    refetchInterval: (query) => {
      const data = query.state.data;
      const active = data?.find(
        (t) =>
          t.status === "menunggu_verifikasi" ||
          t.status === "ditolak" ||
          t.status === "belum_dibayar",
      );
      return active?.status === "menunggu_verifikasi" ? 3000 : false;
    },
  });

  const {
    data: settings = {},
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    enabled: canLoadData,
  });

  const tagihan =
    tagihanList.find(
      (tag) =>
        tag.status === "belum_dibayar" ||
        tag.status === "ditolak" ||
        tag.status === "menunggu_verifikasi",
    ) ?? null;

  const isWaiting = tagihan?.status === "menunggu_verifikasi";
  const isRejected = tagihan?.status === "ditolak";

  // Tagihan lunas → lanjut ke greeting
  useEffect(() => {
    if (tagihan?.status === "lunas") {
      (async () => {
        await updateOnboarding("greeting");
        navigate({ to: "/penghuni/onboarding" });
      })();
    }
  }, [tagihan?.status, navigate]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!tagihan) return;
      await submitTagihan(tagihan.id, {
        metodePembayaran: metode,
        buktiPembayaran: bukti ?? "",
        monthsPaid,
      });
    },
    onSuccess: async () => {
      setBukti(null);
      await queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      toast.success("Bukti pembayaran terkirim");
    },
    onError: () => {
      toast.error("Gagal mengirim pembayaran");
    },
  });

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const url = await uploadBukti(files[0]);
      setBukti(url);
    } catch {
      toast.error("Gagal mengunggah bukti");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!tagihan || !bukti) {
      toast.error("Unggah bukti pembayaran terlebih dahulu");
      return;
    }
    await submitMutation.mutateAsync();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin!");
  };

  if (canLoadData && (isTagihanLoading || isSettingsLoading)) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar>
          <TopBarLeft>
            <Button variant="ghost" size="icon" disabled>
              <ChevronLeft className="size-6" />
            </Button>
          </TopBarLeft>
          <TopBarCenter>
            <h1 className="text-lg whitespace-nowrap">Bayar Tagihan</h1>
          </TopBarCenter>
        </TopBar>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (canLoadData && (isTagihanError || isSettingsError)) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar>
          <TopBarLeft>
            <Button variant="ghost" size="icon" disabled>
              <ChevronLeft className="size-6" />
            </Button>
          </TopBarLeft>
          <TopBarCenter>
            <h1 className="text-lg whitespace-nowrap">Bayar Tagihan</h1>
          </TopBarCenter>
        </TopBar>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <h1 className="text-xl font-semibold">Gagal memuat data</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Data tagihan atau pengaturan belum bisa diambil.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => {
              void refetchTagihan();
              void refetchSettings();
            }}
          >
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!tagihan) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar>
          <TopBarLeft>
            <Button variant="ghost" size="icon" disabled>
              <ChevronLeft className="size-6" />
            </Button>
          </TopBarLeft>
          <TopBarCenter>
            <h1 className="text-lg whitespace-nowrap">Bayar Tagihan</h1>
          </TopBarCenter>
        </TopBar>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <h1 className="text-xl font-semibold">Belum ada tagihan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tagihan pertama Anda belum dibuat. Hubungi pemilik kost.
          </p>
        </div>
      </div>
    );
  }

  // Waiting for owner verification
  if (isWaiting) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar>
          <TopBarLeft>
            <Button variant="ghost" size="icon" disabled>
              <ChevronLeft className="size-6" />
            </Button>
          </TopBarLeft>
          <TopBarCenter>
            <h1 className="text-lg whitespace-nowrap">Bayar Tagihan</h1>
          </TopBarCenter>
        </TopBar>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-yellow-500/10">
            <Clock className="size-10 text-yellow-500 animate-pulse" />
          </div>
          <h1 className="text-xl font-semibold">Menunggu Verifikasi</h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Bukti pembayaran Anda sedang diverifikasi oleh pemilik kost. Mohon
            tunggu sebentar.
          </p>
          <div className="mt-6 w-full max-w-sm rounded-xl border bg-card p-4 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kamar</span>
              <span className="font-medium">Kamar {tagihan.noKamar}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="font-medium">
                {formatRupiah(tagihan.jumlah * (tagihan.monthsPaid ?? 1))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-yellow-500">
                Menunggu Verifikasi
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Billing form (belum_dibayar or ditolak)
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar>
        <TopBarLeft>
          <Button variant="ghost" size="icon" disabled>
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Bayar Tagihan</h1>
        </TopBarCenter>
      </TopBar>

      <div className="flex-1 px-4 pt-20 pb-28">
        {isRejected && tagihan.alasanPenolakan && (
          <div className="mb-4 rounded-xl bg-destructive/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="size-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">
                Pembayaran Ditolak
              </p>
            </div>
            <p className="text-sm text-destructive">
              {tagihan.alasanPenolakan}
            </p>
            <p className="text-xs text-destructive/70">
              Silakan unggah ulang bukti pembayaran yang valid.
            </p>
          </div>
        )}

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Periode</span>
            <span className="text-sm font-medium">{tagihan.periode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Kamar</span>
            <span className="text-sm font-medium">Kamar {tagihan.noKamar}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Jumlah</span>
            <span className="text-lg font-semibold">
              {formatRupiah(tagihan.jumlah)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Jatuh Tempo</span>
            <span className="text-sm font-medium flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {new Date(tagihan.tanggalJatuhTempo).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {settings.no_rekening && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Transfer ke Rekening
            </p>
            <div className="flex flex-col justify-between rounded-xl bg-primary text-white h-48 p-4">
              <p className="text-md font-medium">
                {settings.nama_bank || "Bank -"}
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl">{settings.no_rekening || "-"}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => handleCopy(settings.no_rekening ?? "")}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-md text-end">
                {settings.nama_pemilik_rekening || "-"}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Label>Metode Pembayaran</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMetode("transfer")}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                metode === "transfer"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <Building2 className="size-5" />
              <span className="text-sm font-medium">Transfer Bank</span>
              {metode === "transfer" && (
                <Check className="absolute top-2 right-2 size-4 text-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMetode("cash")}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                metode === "cash"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <Banknote className="size-5" />
              <span className="text-sm font-medium">Cash</span>
              {metode === "cash" && (
                <Check className="absolute top-2 right-2 size-4 text-primary" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Label>Bayar berapa bulan?</Label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonthsPaid(m)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  monthsPaid === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                }`}
              >
                {m} bulan
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Total: {formatRupiah(tagihan.jumlah * monthsPaid)}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Label>Bukti Pembayaran</Label>
          <FileUpload onFilesSelected={handleFileSelected} accept="image/*" />
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Mengunggah...
            </div>
          )}
          {bukti && (
            <img
              src={bukti}
              alt="Bukti pembayaran"
              className="mt-2 max-h-48 rounded-lg object-contain"
            />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-background to-transparent">
        <div className="mx-auto max-w-lg px-4 pb-4 pt-8">
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || !bukti}
            className="w-full rounded-full"
            size="lg"
          >
            {submitMutation.isPending ? (
              <Loader2 className="animate-spin mr-2 size-4" />
            ) : isRejected ? (
              <RotateCcw className="mr-2 size-4" />
            ) : null}
            {isRejected ? "Kirim Ulang Pembayaran" : "Kirim Pembayaran"}
          </Button>
        </div>
      </div>
    </div>
  );
}
