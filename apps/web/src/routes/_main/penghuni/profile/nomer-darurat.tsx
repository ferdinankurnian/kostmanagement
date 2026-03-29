import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Phone } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_main/penghuni/profile/nomer-darurat")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const noDarurat = (session?.user as { noTeleponDarurat?: string })
    ?.noTeleponDarurat;

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
          <h1 className="text-lg whitespace-nowrap">Nomor Darurat</h1>
        </TopBarCenter>
      </TopBar>

      <div className="space-y-3 pt-2">
        {isPending ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : (
          <div className="rounded-xl border bg-muted/30 p-4 space-y-1">
            <p className="text-sm font-medium">Nomor Telepon Darurat</p>
            {noDarurat ? (
              <a
                href={`tel:${noDarurat}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Phone className="size-4" />
                {noDarurat}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum diatur. Hubungi pemilik kost untuk mengatur nomor darurat.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
