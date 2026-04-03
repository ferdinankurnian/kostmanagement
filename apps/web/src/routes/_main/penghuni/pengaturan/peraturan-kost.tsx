import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSettings, parseInformasiKostCards } from "@/lib/settings";

export const Route = createFileRoute(
  "/_main/penghuni/pengaturan/peraturan-kost",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const cards = parseInformasiKostCards(settings?.peraturan_kost_cards);

  const rules =
    cards.length > 0
      ? cards.map((c, idx) => ({ num: idx + 1, content: c }))
      : settings?.peraturan_kost
        ? settings.peraturan_kost
            .split("\n")
            .filter((r) => r.trim())
            .map((r, idx) => ({ num: idx + 1, text: r }))
        : [];

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
      ) : rules.length === 0 ? (
        <div className="pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada peraturan kost yang diatur.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <Card
              key={rule.content?.id ?? `rule-${index}`}
              className="py-0 overflow-hidden"
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                  [{rule.num}]
                </div>
                <div className="flex-1 space-y-1">
                  {rule.content ? (
                    <>
                      <CardTitle className="text-sm">
                        {rule.content.title}
                      </CardTitle>
                      <CardDescription className="text-xs whitespace-pre-wrap">
                        {rule.content.description}
                      </CardDescription>
                    </>
                  ) : (
                    <CardDescription className="text-xs whitespace-pre-wrap">
                      {rule.text}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
