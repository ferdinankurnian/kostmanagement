import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { getSettings } from "@/lib/settings";

export const Route = createFileRoute(
  "/_main/penghuni/pengaturan/informasi-diri/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

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
          <h1 className="text-lg whitespace-nowrap">Informasi Diri</h1>
        </TopBarCenter>
      </TopBar>

      <div className="rounded-2xl border bg-card p-5 space-y-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={session?.user.image ?? ""} />
            <AvatarFallback className="text-xl">
              {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            {sessionLoading ? (
              <>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <p className="text-lg font-medium">
                  {session?.user.name ?? "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {((session?.user as Record<string, unknown>).noTelepon as
                    | string
                    | undefined) ?? "-"}
                </p>
              </>
            )}
          </div>
        </div>

        {!sessionLoading && (
          <div className="space-y-3">
            {(session?.user as Record<string, unknown>).alamat && (
              <div className="flex flex-col rounded-xl bg-muted/30 p-4">
                <p className="text-sm font-medium">Alamat Tinggal</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(session?.user as Record<string, unknown>).alamat as string}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent text-center">
        <Link to="/penghuni/pengaturan/informasi-diri/edit">
          <Button
            type="button"
            className="w-full max-w-lg rounded-full mx-auto"
          >
            Edit Data Diri
          </Button>
        </Link>
      </div>
    </div>
  );
}
