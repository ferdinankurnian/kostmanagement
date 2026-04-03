import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Building2, FileText, Phone, User } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { MenuList, MenuListItem } from "@/components/menu-list";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_main/penghuni/_main/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  return (
    <div className="pt-6 space-y-6">
      <div className="flex flex-row justify-between px-4">
        <div className="flex flex-row gap-3 items-center">
          <Avatar size="lg">
            <AvatarImage src={session?.user.image ?? ""} />
            <AvatarFallback>
              {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            {isPending ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </>
            ) : (
              <>
                <h1 className="text-md text-foreground">
                  {session?.user.name}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Kamar {(session?.user as { noKamar?: number })?.noKamar}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <LogoutButton />
        </div>
      </div>

      <div className="px-4">
        <PwaInstallBanner />
      </div>

      <div className="space-y-2 px-4">
        <p className="text-sm text-muted-foreground">Data</p>
        <MenuList>
          <MenuListItem
            icon={User}
            label="Informasi Diri"
            to="/penghuni/pengaturan/informasi-diri"
          />
          <MenuListItem
            icon={Phone}
            label="Nomer Darurat"
            to="/penghuni/pengaturan/nomer-darurat"
          />
        </MenuList>
      </div>

      <div className="space-y-2 px-4">
        <p className="text-sm text-muted-foreground">Pengaturan</p>
        <MenuList>
          <MenuListItem
            icon={Building2}
            label="Informasi Kost"
            to="/penghuni/pengaturan/informasi-kost"
          />
          <MenuListItem
            icon={BellRing}
            label="Notifikasi"
            to="/penghuni/pengaturan/notification"
          />
          <MenuListItem
            icon={FileText}
            label="Peraturan Kost"
            to="/penghuni/pengaturan/peraturan-kost"
          />
        </MenuList>
      </div>
    </div>
  );
}
