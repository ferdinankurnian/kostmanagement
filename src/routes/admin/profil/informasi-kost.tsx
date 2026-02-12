import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/profil/informasi-kost")({
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
          <h1 className="text-lg whitespace-nowrap">Informasi Kost</h1>
        </TopBarCenter>
        <Button variant="default" size="sm" className="rounded-full px-4">
          Edit
        </Button>
      </TopBar>

      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Nama Kost</h2>
          <p className="text-muted-foreground">Kost Harmoni</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Alamat</h2>
          <p className="text-muted-foreground">
            Jl. Mawar No. 123, RT.02/RW.05, Kelurahan Cempaka, Kecamatan Indah,
            Jakarta Selatan, DKI Jakarta 12345
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">No. Telepon</h2>
          <p className="text-muted-foreground">0812-3456-7890</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Email</h2>
          <p className="text-muted-foreground">kostharmoni@email.com</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Deskripsi</h2>
          <p className="text-muted-foreground">
            Kost eksklusif dengan fasilitas lengkap, lingkungan aman dan nyaman.
            Tersedia kamar dengan berbagai tipe untuk mahasiswa dan pekerja.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Fasilitas Umum</h2>
          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
            <li>WiFi 24 jam</li>
            <li>Dapur bersama</li>
            <li>Ruang TV</li>
            <li>Parkir motor & mobil</li>
            <li>Keamanan 24 jam (CCTV)</li>
            <li>Laundry</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
