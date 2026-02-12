import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useId } from "react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/member/keluhan/buat")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const kamarId = useId();
  const fotoId = useId();
  const catatanId = useId();

  return (
    <div className="space-y-6">
      <TopBar>
        <TopBarLeft>
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/member/keluhan" })}>
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Keluhan</h1>
        </TopBarCenter>
      </TopBar>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={kamarId}>Dari Kamar</Label>
          <Input id={kamarId} value="Kamar 2" readOnly className="bg-white" />
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
          <Label htmlFor={catatanId}>Catatan</Label>
          <Textarea
            id={catatanId}
            placeholder="Kostnya terlalu bagus"
            rows={4}
            className="bg-white resize-none"
          />
        </div>

        <Button type="submit" className="w-full rounded-full" size="lg">
          Kirim
        </Button>
      </div>
    </div>
  );
}
