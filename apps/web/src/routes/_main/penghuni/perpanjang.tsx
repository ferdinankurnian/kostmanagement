import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  Copy,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { getSettings } from "@/lib/settings";
import {
  getTagihan,
  type MetodePembayaran,
  submitTagihan,
} from "@/lib/tagihan";
import { uploadBukti } from "@/lib/upload";

export const Route = createFileRoute("/_main/penghuni/perpanjang")({
  component: PerpanjangPage,
});

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function PerpanjangPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [metode, setMetode] = useState<MetodePembayaran>("transfer");
  const [bukti, setBukti] = useState<string | null>(null);
  const [monthsPaid, setMonthsPaid] = useState(1);

  const {
    data: tagihanList = [],
    isLoading: isTagihanLoading,
    isError: isTagihanError,
    refetch: refetchTagihan,
  } = useQuery({
    queryKey: ["tagihan"],
    queryFn: getTagihan,
  });

  const {
    data: settings = {},
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const tagihan =
    tagihanList.find(
      (tag) => tag.status === "belum_dibayar" || tag.status === "ditolak",
    ) ?? null;

  const submitMutation = useMutation({
    mutationFn: () =>
      submitTagihan(tagihan.id, {
        metodePembayaran: metode,
        buktiPembayaran: bukti ?? "",
        monthsPaid,
      }),
    onSuccess: async () => {
      toast.success("Pembayaran berhasil dikirim!");
      await queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      navigate({ to: "/penghuni/tagihan" });
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

  if (isTagihanLoading || isSettingsLoading) {
    return (
      <div>
        <TopBar>
          <TopBarLeft>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/penghuni" })}
            >
              <ArrowLeft size={20} />
            </Button>
          </TopBarLeft>
          <TopBarCenter>
            <h1 className="text-base font-semibold">Bayar Tagihan</h1>
          </TopBarCenter>
        </TopBar>
        <div className="flex items-center justify-center pt-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isTagihanError || isSettingsError) {
    return (
      <div>
        <TopBar>
          <TopBarLeft>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/penghuni" })}
            >
              <ArrowLeft size={20} />
            </Button>
          </TopBarLeft>
          <TopBarCenter>
            <h1 className="text-base font-semibold">Bayar Tagihan</h1>
          </TopBarCenter>
        </TopBar>
        <div className="px-4 pt-20">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm text-destructive">Gagal memuat data.</p>
            <Button
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
      </div>
    );
  }

  if (!tagihan) {
    return (
      <div>
        <TopBar>
          <TopBarLeft>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/penghuni" })}
            >
              <ArrowLeft size={20} />
            </Button>
          </TopBarLeft>
          <TopBarCenter>
            <h1 className="text-base font-semibold">Bayar Tagihan</h1>
          </TopBarCenter>
        </TopBar>
        <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
          <CreditCard className="size-12 text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold">Tidak ada tagihan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Semua tagihan sudah lunas!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/penghuni" })}
          >
            <ArrowLeft size={20} />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-base font-semibold">Bayar Tagihan</h1>
        </TopBarCenter>
      </TopBar>

      <div className="px-4 pt-16 pb-6 space-y-6">
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
              {formatRupiah(tagihan.jumlah * monthsPaid)}
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

          {tagihan.status === "ditolak" && tagihan.alasanPenolakan && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              Ditolak: {tagihan.alasanPenolakan}
            </div>
          )}
        </div>

        {settings.no_rekening && (
          <div className="rounded-xl border bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Info Rekening Pembayaran
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  {settings.nama_bank ?? "Bank"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium">
                  {settings.no_rekening}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(settings.no_rekening)}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
              {settings.nama_pemilik_rekening && (
                <p className="text-sm text-muted-foreground">
                  a.n. {settings.nama_pemilik_rekening}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
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
        </div>

        <div className="space-y-3">
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

        <div className="space-y-3">
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

        <Button
          onClick={handleSubmit}
          disabled={submitMutation.isPending || !bukti}
          className="w-full"
          size="lg"
        >
          {submitMutation.isPending ? (
            <Loader2 className="animate-spin mr-2 size-4" />
          ) : null}
          Kirim Pembayaran
        </Button>
      </div>
    </div>
  );
}
