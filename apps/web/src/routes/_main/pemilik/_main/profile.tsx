import { createFileRoute } from "@tanstack/react-router";
import { Bell, FileText, Home, Lock, User } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { MenuList, MenuListItem } from "@/components/menu-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_main/pemilik/_main/profile")({
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
                <p className="text-xs text-muted-foreground">Rawr certified</p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <LogoutButton />
        </div>
      </div>
      <div className="space-y-2 px-4">
        <MenuList>
          <MenuListItem
            icon={User}
            label="Informasi Pemilik"
            to="/pemilik/pengaturan/informasi-pemilik"
          />
          <MenuListItem
            icon={Lock}
            label="Ganti PIN Keamanan"
            to="/pemilik/pengaturan/pin"
          />
          <MenuListItem
            icon={Home}
            label="Informasi Kost"
            to="/pemilik/pengaturan/informasi-kost"
          />
          <MenuListItem
            icon={FileText}
            label="Peraturan Kost"
            to="/pemilik/pengaturan/peraturan-kost"
          />
        </MenuList>
      </div>

      <div className="space-y-2 px-4">
        <MenuList>
          <MenuListItem icon={Bell} label="Laporan" />
          <MenuListItem icon={FileText} label="Peraturan Kost" />
        </MenuList>
      </div>
    </div>
  );
}
