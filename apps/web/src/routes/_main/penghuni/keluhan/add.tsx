import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createKeluhan } from "@/lib/keluhan";
import { uploadBukti } from "@/lib/upload";

export const Route = createFileRoute("/_main/penghuni/keluhan/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createKeluhan({
        judul,
        deskripsi,
        fotoUrls: fotoUrls.length > 0 ? fotoUrls : undefined,
      }),
    onSuccess: async (data) => {
      toast.success("Keluhan berhasil dikirim");
      await queryClient.invalidateQueries({ queryKey: ["keluhan"] });
      navigate({
        to: "/penghuni/keluhan/detail",
        search: { id: data.id },
      });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengirim keluhan");
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
      toast.error("Gagal mengunggah foto");
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
            onClick={() => navigate({ to: "/penghuni/keluhan" })}
          >
            <ArrowLeft className="size-5" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-base font-semibold">Buat Keluhan</h1>
        </TopBarCenter>
      </TopBar>

      <div className="px-4 pt-20 pb-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="judul">Judul</Label>
          <Input
            id="judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Contoh: Keran air bocor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={6}
            placeholder="Jelaskan masalah yang terjadi di kamar atau area kost"
          />
        </div>

        <div className="space-y-2">
          <Label>Foto Pendukung</Label>
          <FileUpload
            onFilesSelected={handleUpload}
            accept="image/*"
            multiple
            description="Bisa mengunggah beberapa foto (Maks. 5MB per berkas)"
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Mengunggah foto...
            </div>
          ) : null}
          {fotoUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {fotoUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Foto keluhan"
                  className="h-36 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

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
            <Send className="size-4" />
          )}
          Kirim Keluhan
        </Button>
      </div>
    </div>
  );
}
