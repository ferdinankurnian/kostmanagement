import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { getSettings, parseInformasiKostCards } from "@/lib/settings";

export const Route = createFileRoute("/_main/penghuni/profile/peraturan-kost")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const cards = parseInformasiKostCards(settings?.peraturan_kost_cards);

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.history.back()}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Peraturan Kost</h1>
        </TopBarCenter>
      </TopBar>

      {isLoading ? (
        <div className="flex items-center justify-center pt-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : cards.length === 0 && !settings?.peraturan_kost ? (
        <div className="pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada peraturan kost yang diatur.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {cards.length > 0
            ? cards.map((card, index) => (
                <div
                  key={card.id}
                  className="rounded-xl border bg-card p-4 space-y-2"
                >
                  <p className="text-sm font-medium">
                    {card.title || `Peraturan ${index + 1}`}
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {card.description}
                  </p>
                </div>
              ))
            : settings?.peraturan_kost && (
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {settings.peraturan_kost}
                  </p>
                </div>
              )}
        </div>
      )}
    </div>
  );
}
