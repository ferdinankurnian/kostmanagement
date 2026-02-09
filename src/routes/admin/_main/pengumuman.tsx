import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useId } from "react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/_main/pengumuman")({
  component: RouteComponent,
});

function RouteComponent() {
  const judulId = useId();
  const fotoId = useId();
  const deskripsiId = useId();

  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarLeft>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Buat Pengumuman</h1>
        </TopBarCenter>
        <div />
        {}
      </TopBar>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={judulId}>Tentang</Label>
          <Input id={judulId} placeholder="Masukkan judul pengumuman" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={fotoId}>Foto Kerusakan</Label>
          <FileUpload
            id={fotoId}
            accept="image/*"
            onFilesSelected={(files) => console.log(files)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={deskripsiId}>Catatan</Label>
          <Textarea
            id={deskripsiId}
            placeholder="Masukkan deskripsi pengumuman"
            rows={6}
          />
        </div>
        <div className="space-y-2">
          <Button type="submit" className="w-full" size="lg">
            Kirim
          </Button>
        </div>
      </div>
    </div>
  );
}
