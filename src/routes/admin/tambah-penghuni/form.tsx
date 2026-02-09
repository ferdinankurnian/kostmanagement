import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useId } from "react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/tambah-penghuni/form")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const judulId = useId();
  const deskripsiId = useId();
  return (
    <div className="flex flex-col space-y-4">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigate({ to: "/admin/tambah-penghuni/pilih-kamar" })
            }
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Tambah Penghuni</h1>
        </TopBarCenter>
      </TopBar>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={judulId}>Nama</Label>
          <Input id={judulId} placeholder="Masukkan judul pengumuman" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={judulId}>Nomor Telepon</Label>
          <Input id={judulId} placeholder="Masukkan judul pengumuman" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={deskripsiId}>Foto KTP</Label>
          <FileUpload
            id={deskripsiId}
            accept="image/*"
            onFilesSelected={(files) => console.log(files)}
          />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Link to="/admin/tambah-penghuni/hasil">
          <Button type="submit" size="lg" className="w-full">
            Selanjutnya
          </Button>
        </Link>
      </div>
    </div>
  );
}
