import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_main/penghuni/profile/alamat-tinggal")({
  component: RouteComponent,
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function RouteComponent() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const noKamar = (session?.user as { noKamar?: number })?.noKamar;

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
          <h1 className="text-lg whitespace-nowrap">Alamat Tinggal</h1>
        </TopBarCenter>
      </TopBar>

      <div className="space-y-3 pt-2">
        {isPending ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : (
          <>
            <InfoRow
              label="Nomor Kamar"
              value={noKamar ? `Kamar ${noKamar}` : "Belum ditentukan"}
            />
            <InfoRow
              label="Status"
              value={noKamar ? "Aktif" : "Belum memiliki kamar"}
            />
          </>
        )}
      </div>
    </div>
  );
}
