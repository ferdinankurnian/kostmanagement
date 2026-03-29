import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createInformasiKostCard,
  getSettings,
  type InformasiKostCard,
  parseInformasiKostCards,
  type Settings,
  serializeInformasiKostCards,
  updateSetting,
} from "@/lib/settings";

export const Route = createFileRoute(
  "/_main/pemilik/pengaturan/informasi-kost",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Settings>({});
  const [cards, setCards] = useState<InformasiKostCard[]>([]);

  const {
    data: settingsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (!settingsData) {
      return;
    }

    setSettings(settingsData);
    setCards(parseInformasiKostCards(settingsData.informasi_kost_cards));
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        updateSetting("nama_kost", settings.nama_kost ?? ""),
        updateSetting("harga_sewa", settings.harga_sewa ?? ""),
        updateSetting("nama_bank", settings.nama_bank ?? ""),
        updateSetting("no_rekening", settings.no_rekening ?? ""),
        updateSetting(
          "nama_pemilik_rekening",
          settings.nama_pemilik_rekening ?? "",
        ),
        updateSetting(
          "informasi_kost_cards",
          serializeInformasiKostCards(cards),
        ),
      ]);
    },
    onSuccess: async () => {
      toast.success("Informasi kost disimpan");
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: () => {
      toast.error("Gagal menyimpan informasi kost");
    },
  });

  const updateSettingValue = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addCard = () => {
    setCards((prev) => [...prev, createInformasiKostCard()]);
  };

  const removeCard = (cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const updateCard = (
    cardId: string,
    key: keyof Pick<InformasiKostCard, "title" | "description">,
    value: string,
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, [key]: value } : card,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
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
            <h1 className="text-lg whitespace-nowrap">Informasi Kost</h1>
          </TopBarCenter>
        </TopBar>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat informasi kost.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
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
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Informasi Kost</h1>
        </TopBarCenter>
      </TopBar>

      <div className="space-y-1 pt-4">
        <p className="text-sm text-muted-foreground">
          Atur detail utama kost dan susun informasi tambahan dalam bentuk card.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nama_kost">Nama Kost</Label>
          <Input
            id="nama_kost"
            value={settings.nama_kost ?? ""}
            onChange={(e) => updateSettingValue("nama_kost", e.target.value)}
            placeholder="Contoh: Kost Melati"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="harga_sewa">Harga Sewa (per bulan)</Label>
          <Input
            id="harga_sewa"
            type="number"
            value={settings.harga_sewa ?? ""}
            onChange={(e) => updateSettingValue("harga_sewa", e.target.value)}
            placeholder="1500000"
          />
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">Info Pembayaran</h2>
            <p className="text-sm text-muted-foreground">
              Rekening ini akan dipakai penghuni saat melihat instruksi
              pembayaran.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_bank">Nama Bank</Label>
            <Input
              id="nama_bank"
              value={settings.nama_bank ?? ""}
              onChange={(e) => updateSettingValue("nama_bank", e.target.value)}
              placeholder="BCA, Mandiri, BNI, dll"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="no_rekening">No. Rekening</Label>
            <Input
              id="no_rekening"
              value={settings.no_rekening ?? ""}
              onChange={(e) =>
                updateSettingValue("no_rekening", e.target.value)
              }
              placeholder="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_pemilik_rekening">Nama Pemilik Rekening</Label>
            <Input
              id="nama_pemilik_rekening"
              value={settings.nama_pemilik_rekening ?? ""}
              onChange={(e) =>
                updateSettingValue("nama_pemilik_rekening", e.target.value)
              }
              placeholder="Nama sesuai rekening"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">Cards Informasi</h2>
            <p className="text-sm text-muted-foreground">
              Tambahkan poin penting seperti fasilitas, jam malam, atau catatan
              khusus.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addCard}>
            <Plus className="size-4" />
            Tambah Card
          </Button>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center space-y-3">
            <p className="text-sm font-medium">Belum ada card informasi</p>
            <p className="text-sm text-muted-foreground">
              Buat card pertama untuk menampilkan informasi kost yang penting.
            </p>
            <Button type="button" variant="secondary" onClick={addCard}>
              <Plus className="size-4" />
              Tambah Card
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card, index) => (
              <Card key={card.id} className="py-0">
                <CardHeader className="border-b py-4">
                  <CardTitle>Card {index + 1}</CardTitle>
                  <CardDescription>
                    Isi judul dan deskripsi untuk informasi yang ingin
                    ditampilkan.
                  </CardDescription>
                  <CardAction>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCard(card.id)}
                      aria-label={`Hapus card ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </CardAction>
                </CardHeader>

                <div className="space-y-4 px-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor={`card-title-${card.id}`}>Title</Label>
                    <Input
                      id={`card-title-${card.id}`}
                      value={card.title}
                      onChange={(e) =>
                        updateCard(card.id, "title", e.target.value)
                      }
                      placeholder="Contoh: Fasilitas Umum"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`card-description-${card.id}`}>
                      Description
                    </Label>
                    <Textarea
                      id={`card-description-${card.id}`}
                      value={card.description}
                      onChange={(e) =>
                        updateCard(card.id, "description", e.target.value)
                      }
                      rows={4}
                      placeholder="Jelaskan informasi yang ingin ditampilkan"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => void saveMutation.mutateAsync()}
        disabled={saveMutation.isPending}
        className="gap-1.5"
      >
        {saveMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Simpan
      </Button>
    </div>
  );
}
