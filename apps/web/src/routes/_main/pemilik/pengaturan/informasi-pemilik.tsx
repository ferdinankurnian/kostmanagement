import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, FileText, Home, Mail, Shield, User } from "lucide-react";
import type { ReactNode } from "react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute(
  "/_main/pemilik/pengaturan/informasi-pemilik",
)({
  component: RouteComponent,
});

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        {icon}
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

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
          <h1 className="text-lg whitespace-nowrap">Informasi Pemilik</h1>
        </TopBarCenter>
      </TopBar>

      <div className="rounded-2xl border bg-card p-5 space-y-5">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={session?.user.image ?? ""} />
            <AvatarFallback>
              {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            {isPending ? (
              <>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40 mt-2" />
              </>
            ) : (
              <>
                <p className="text-lg font-medium">
                  {session?.user.name ?? "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session?.user.email ?? "-"}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <InfoItem
            icon={<User className="mt-0.5 size-4 text-muted-foreground" />}
            label="Nama Pemilik"
            value={isPending ? "Memuat..." : (session?.user.name ?? "-")}
          />
          <InfoItem
            icon={<Mail className="mt-0.5 size-4 text-muted-foreground" />}
            label="Email"
            value={isPending ? "Memuat..." : (session?.user.email ?? "-")}
          />
          <InfoItem
            icon={<Shield className="mt-0.5 size-4 text-muted-foreground" />}
            label="Role"
            value={
              isPending
                ? "Memuat..."
                : (session?.user.role ?? "-") === "admin"
                  ? "Pemilik"
                  : "Penghuni"
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Pengaturan Lainnya</p>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() =>
            router.navigate({ to: "/pemilik/pengaturan/informasi-kost" })
          }
        >
          <Home className="size-4" />
          <div className="text-left">
            <p className="text-sm font-medium">Informasi Kost</p>
            <p className="text-xs text-muted-foreground">
              Nama, harga sewa, rekening bank
            </p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() =>
            router.navigate({ to: "/pemilik/pengaturan/peraturan-kost" })
          }
        >
          <FileText className="size-4" />
          <div className="text-left">
            <p className="text-sm font-medium">Peraturan Kost</p>
            <p className="text-xs text-muted-foreground">
              Aturan yang berlaku di kost
            </p>
          </div>
        </Button>
      </div>
    </div>
  );
}
