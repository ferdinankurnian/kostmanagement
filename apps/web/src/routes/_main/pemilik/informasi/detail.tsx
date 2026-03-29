import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteInformasi,
  getInformasiById,
  type PrioritasInformasi,
  type StatusInformasi,
  updateInformasi,
} from "@/lib/informasi";
import { uploadBukti } from "@/lib/upload";

export const Route = createFileRoute("/_main/pemilik/informasi/detail")({
  validateSearch: z.object({
    id: z.string(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = Route.useSearch();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["informasi", id],
    queryFn: () => getInformasiById(id),
  });
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const [prioritas, setPrioritas] = useState<PrioritasInformasi>("normal");
  const [status, setStatus] = useState<StatusInformasi>("aktif");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (data) {
      setJudul(data.judul);
      setDeskripsi(data.deskripsi);
      setFotoUrls(data.fotoUrls);
      setPrioritas(data.prioritas);
      setStatus(data.status);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      updateInformasi(id, {
        judul,
        deskripsi,
        fotoUrls: fotoUrls.length > 0 ? fotoUrls : undefined,
        prioritas,
        status,
      }),
    onSuccess: async () => {
      toast.success("Informasi berhasil diperbarui");
      await queryClient.invalidateQueries({ queryKey: ["informasi"] });
      await queryClient.invalidateQueries({ queryKey: ["informasi", id] });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui informasi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInformasi(id),
    onSuccess: async () => {
      toast.success("Informasi berhasil dihapus");
      await queryClient.invalidateQueries({ queryKey: ["informasi"] });
      navigate({ to: "/pemilik/informasi" });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus informasi");
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
          <h1 className="text-base font-semibold">Detail Informasi</h1>
        </TopBarCenter>
      </TopBar>

      {isLoading ? (
        <div className="flex items-center justify-center pt-28">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="px-4 pt-24 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat detail informasi.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : (
        <div className="px-4 pt-20 pb-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={6}
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
            disabled={mutation.isPending || isUploading}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Simpan Perubahan
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            size="lg"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (window.confirm("Hapus informasi ini?")) {
                deleteMutation.mutate();
              }
            }}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Hapus Informasi
          </Button>
        </div>
      )}
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
