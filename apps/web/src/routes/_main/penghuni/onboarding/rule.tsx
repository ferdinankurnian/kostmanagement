import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ScrollText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { updateOnboarding } from "@/lib/onboarding";
import { getSettings, parseInformasiKostCards } from "@/lib/settings";

export const Route = createFileRoute("/_main/penghuni/onboarding/rule")({
  component: RulePage,
});

const defaultRules = [
  "Dilarang membawa tamu menginap tanpa izin pengelola.",
  "Jam malam dimulai pukul 22.00. Setelah itu, harap menjaga ketenangan.",
  "Dilarang merokok di dalam kamar dan area umum.",
  "Pembayaran tagihan dilakukan maksimal tanggal 10 setiap bulannya.",
  "Jaga kebersihan kamar dan fasilitas bersama.",
  "Laporkan kerusakan fasilitas melalui fitur Keluhan.",
  "Penggunaan listrik dan air harus bijak dan sesuai kebutuhan.",
  "Pengelola berhak melakukan pemeriksaan kamar dengan pemberitahuan.",
];

function RulePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = Route.useRouteContext() as {
    user: { onboarding?: string | null };
  };

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  if (user.user.onboarding !== "rule") {
    navigate({
      to:
        user.user.onboarding === "greeting"
          ? "/penghuni/onboarding"
          : "/penghuni",
    });
    return null;
  }

  const cards = parseInformasiKostCards(settings?.peraturan_kost_cards);
  const rules =
    cards.length > 0
      ? cards.map((c) =>
          c.title ? `${c.title}: ${c.description}` : c.description,
        )
      : defaultRules;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await updateOnboarding("completed");
      navigate({ to: "/penghuni" });
    } catch {
      toast.error("Gagal menyelesaikan onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ScrollText className="size-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Peraturan Kost</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Harap baca dan setujui peraturan berikut
          </p>
        </div>

        {isLoadingSettings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-lg border bg-card p-4"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-background px-4 py-6">
        <SlideToConfirm
          onConfirm={handleConfirm}
          isLoading={isLoading}
          text="Geser untuk Setuju & Selesai"
        />
      </div>
    </div>
  );
}
