import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin/tagihan/detail")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/admin/tagihan" })}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Detail Pembayaran</h1>
        </TopBarCenter>
      </TopBar>
      <div className="flex flex-col justify-center items-center gap-6 pt-2 pb-4">
        <div className="p-3 bg-primary rounded-full">
          <Check className="size-8 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Penghuni Baru</h1>
          <p className="text-xs text-muted-foreground">
            24 Januari - Februari 2026
          </p>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 flex flex-col justify-center gap-6">
        <h1 className="text-lg">Detail Pembayaran</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-sm text-muted-foreground">Invoice ID</h1>
            <p className="text-sm">username12</p>
          </div>
          <Separator />
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-sm text-muted-foreground">Nama Penghuni</h1>
            <p className="text-sm">pssword123</p>
          </div>
          <Separator />
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-sm text-muted-foreground">No Kamar</h1>
            <p className="text-sm">email@example.com</p>
          </div>
          <Separator />
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-sm text-muted-foreground">Periode</h1>
            <p className="text-sm">+6281234567890</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 flex flex-col justify-center gap-6">
        <h1 className="text-lg">Bukti Pembayaran</h1>
        <div className="flex flex-col gap-4 h-38 bg-gray-200 rounded-md"></div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Link to="/admin">
          <Button type="submit" size="lg" className="w-full">
            Selesai
          </Button>
        </Link>
      </div>
    </div>
  );
}
