import { createFileRoute } from "@tanstack/react-router";
import { Bell, FileText, Lock, MapPin, Phone, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/logout-button";
import { MenuList, MenuListItem } from "@/components/menu-list";
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

      <div className="space-y-2 px-4">
        <p className="text-sm text-muted-foreground">Data</p>
        <MenuList>
          <MenuListItem icon={User} label="Informasi Diri" />
          <MenuListItem icon={MapPin} label="Alamat Tinggal" />
          <MenuListItem icon={Phone} label="Nomer Darurat" />
        </MenuList>
      </div>

      <div className="space-y-2 px-4">
        <p className="text-sm text-muted-foreground">Pengaturan</p>
        <MenuList>
          <MenuListItem icon={Bell} label="Informasi" />
          <MenuListItem icon={Lock} label="Password" />
          <MenuListItem icon={FileText} label="Peraturan Kost" />
        </MenuList>
      </div>
    </div>
  );
}
