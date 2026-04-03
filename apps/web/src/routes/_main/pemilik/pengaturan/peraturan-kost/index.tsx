import { useMutation, useQuery } from "@tanstack/react-query";
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
  serializeInformasiKostCards,
  updateSetting,
} from "@/lib/settings";

export const Route = createFileRoute(
  "/_main/pemilik/pengaturan/peraturan-kost/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [cards, setCards] = useState<InformasiKostCard[]>([]);

  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (!settings) {
      return;
    }

    const parsedCards = parseInformasiKostCards(settings.peraturan_kost_cards);

    if (parsedCards.length > 0) {
      setCards(parsedCards);
      return;
    }

    setCards([]);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const serializedCards = serializeInformasiKostCards(cards);
      await updateSetting("peraturan_kost_cards", serializedCards);
    },
    onSuccess: () => {
      toast.success("Peraturan kost disimpan");
    },
    onError: () => {
      toast.error("Gagal menyimpan peraturan");
    },
  });

  const handleSave = async () => {
    await saveMutation.mutateAsync();
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
            <h1 className="text-lg whitespace-nowrap">Peraturan Kost</h1>
          </TopBarCenter>
        </TopBar>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat peraturan kost.
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
          <h1 className="text-lg whitespace-nowrap">Peraturan Kost</h1>
        </TopBarCenter>
      </TopBar>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">Cards Peraturan</h2>
            <p className="text-sm text-muted-foreground">
              Setiap aturan bisa punya judul dan penjelasan sendiri.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addCard}>
            <Plus className="size-4" />
            Tambah Card
          </Button>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center space-y-3">
            <p className="text-sm font-medium">Belum ada peraturan</p>
            <p className="text-sm text-muted-foreground">
              Tambahkan card pertama untuk mulai menyusun peraturan kost.
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
                    Isi judul aturan dan penjelasannya.
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
                    <Label htmlFor={`rule-title-${card.id}`}>Title</Label>
                    <Input
                      id={`rule-title-${card.id}`}
                      value={card.title}
                      onChange={(e) =>
                        updateCard(card.id, "title", e.target.value)
                      }
                      placeholder="Contoh: Jam Malam"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`rule-description-${card.id}`}>
                      Description
                    </Label>
                    <Textarea
                      id={`rule-description-${card.id}`}
                      value={card.description}
                      onChange={(e) =>
                        updateCard(card.id, "description", e.target.value)
                      }
                      rows={4}
                      placeholder="Jelaskan aturan secara singkat dan jelas"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="w-full max-w-lg rounded-full mx-auto"
        >
          {saveMutation.isPending ? (
            <Loader2 className="animate-spin size-4" />
          ) : (
            <Save className="size-4" />
          )}
          Simpan
        </Button>
      </div>
    </div>
  );
}
