import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/profil/peraturan")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const peraturanPenghuni = [
    "Penguni diharapkan sudah kembali ke kost maksimal pukul 22.00 WIB.",
    "Jika pulang lebih malam, harap tetap menjaga ketenangan dan tidak berisik.",
  ];

  const peraturanTamu = [
    "Tamu wajib lapor ke pemilik/penjaga kost.",
    "Tamu hanya diperbolehkan sampai pukul 21.00 WIB.",
    "Tamu lawan jenis tidak diperbolehkan masuk kamar.",
  ];

  return (
    <div className="space-y-6">
      <TopBar>
        <TopBarLeft>
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/profil" })}>
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Peraturan Kost</h1>
        </TopBarCenter>
        <Button variant="default" size="sm" className="rounded-full px-4">
          Edit
        </Button>
      </TopBar>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Penghuni</h2>
          <ul className="space-y-2">
            {peraturanPenghuni.map((item, index) => (
              <li key={index} className="text-muted-foreground flex gap-2">
                <span>-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Tamu / Pengunjung</h2>
          <ul className="space-y-2">
            {peraturanTamu.map((item, index) => (
              <li key={index} className="text-muted-foreground flex gap-2">
                <span>-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
