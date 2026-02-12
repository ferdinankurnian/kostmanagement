import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/profil/informasi-pemilik")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <TopBar>
        <TopBarLeft>
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/profil" })}>
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Informasi Pemilik</h1>
        </TopBarCenter>
        <Button variant="default" size="sm" className="rounded-full px-4">
          Edit
        </Button>
      </TopBar>

      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Nama Lengkap</h2>
          <p className="text-muted-foreground">Budi Santoso</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">No. Telepon</h2>
          <p className="text-muted-foreground">0812-3456-7890</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Email</h2>
          <p className="text-muted-foreground">budi.santoso@email.com</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Alamat</h2>
          <p className="text-muted-foreground">
            Jl. Melati No. 45, RT.03/RW.02, Kelurahan Suka Maju, Kecamatan Sejahtera,
            Jakarta Selatan, DKI Jakarta 12345
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">No. KTP</h2>
          <p className="text-muted-foreground">3175012345678901</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">NPWP</h2>
          <p className="text-muted-foreground">09.123.456.7-123.000</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Catatan</h2>
          <p className="text-muted-foreground">
            Pemilik kost sejak tahun 2018. Senang berkomunikasi dengan penghuni dan
            selalu terbuka untuk saran dan masukan.
          </p>
        </section>
      </div>
    </div>
  );
}
