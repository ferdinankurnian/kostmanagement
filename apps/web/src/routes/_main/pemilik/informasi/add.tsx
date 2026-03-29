import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createInformasi,
  type PrioritasInformasi,
  type StatusInformasi,
} from "@/lib/informasi";
import { uploadBukti } from "@/lib/upload";

export const Route = createFileRoute("/_main/pemilik/informasi/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const [prioritas, setPrioritas] = useState<PrioritasInformasi>("normal");
  const [status, setStatus] = useState<StatusInformasi>("aktif");
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createInformasi({
        judul,
        deskripsi,
        fotoUrls: fotoUrls.length > 0 ? fotoUrls : undefined,
        prioritas,
        status,
      }),
    onSuccess: async (data) => {
      toast.success("Informasi berhasil dibuat");
      await queryClient.invalidateQueries({ queryKey: ["informasi"] });
      navigate({
        to: "/pemilik/informasi/detail",
        search: { id: data.id },
      });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal membuat informasi");
    },
  });

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) {
      setFotoUrls([]);
      return;
    }
    setIsUploading(true);
    try {
      const urls = await Promise.all(files.map((file) => uploadBukti(file)));
      setFotoUrls(urls);
    } catch {
      toast.error("Gagal upload foto");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/pemilik/informasi" })}
          >
            <ArrowLeft className="size-5" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-base font-semibold">Tambah Informasi</h1>
        </TopBarCenter>
      </TopBar>

      <div className="px-4 pt-20 pb-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="judul">Judul</Label>
          <Input
            id="judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Judul informasi"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={6}
            placeholder="Deskripsi informasi untuk penghuni"
          />
        </div>

        <div className="space-y-2">
          <Label>Foto</Label>
          <FileUpload
            onFilesSelected={handleUpload}
            accept="image/*"
            multiple
            description="Bisa upload beberapa foto (Max. 5MB per file)"
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Mengupload foto...
            </div>
          ) : null}
          {fotoUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {fotoUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Foto informasi"
                  className="h-36 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        <ChoiceGroup
          label="Priority"
          value={prioritas}
          options={[
            { value: "rendah", label: "Rendah" },
            { value: "normal", label: "Normal" },
            { value: "tinggi", label: "Tinggi" },
          ]}
          onChange={(value) => setPrioritas(value as PrioritasInformasi)}
        />

        <ChoiceGroup
          label="Status"
          value={status}
          options={[
            { value: "aktif", label: "Aktif" },
            { value: "nonaktif", label: "Nonaktif" },
          ]}
          onChange={(value) => setStatus(value as StatusInformasi)}
        />

        <Button
          className="w-full gap-2"
          size="lg"
          disabled={
            mutation.isPending ||
            isUploading ||
            judul.trim().length === 0 ||
            deskripsi.trim().length === 0
          }
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Simpan Informasi
        </Button>
      </div>
    </div>
  );
}

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant={value === item.value ? "default" : "outline"}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
