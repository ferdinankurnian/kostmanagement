import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { getSettings, type Settings, updateSetting } from "@/lib/settings";

export const Route = createFileRoute(
  "/_main/pemilik/pengaturan/informasi-kost",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 px-4 pt-20 pb-20">
        <TopBar>
          <TopBarLeft>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="size-6" />
            </Button>
          </TopBarLeft>
          <TopBarCenter>
            <h1 className="text-lg whitespace-nowrap">Informasi Kost</h1>
          </TopBarCenter>
        </TopBar>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-destructive">
            Gagal memuat informasi kost.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  return <InformasiKostForm settings={settings} />;
}

function InformasiKostForm({ settings }: { settings: Settings | undefined }) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      nama_kost: settings?.nama_kost ?? "",
      harga_sewa: settings?.harga_sewa ?? "",
      alamat: settings?.alamat ?? "",
    },
  });

  const namaKost = useStore(form.store, (s) => s.values.nama_kost);
  const hargaSewa = useStore(form.store, (s) => s.values.harga_sewa);
  const alamat = useStore(form.store, (s) => s.values.alamat);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const value = form.state.values;
      await Promise.all([
        updateSetting("nama_kost", value.nama_kost),
        updateSetting("harga_sewa", value.harga_sewa),
        updateSetting("alamat", value.alamat),
      ]);
    },
    onSuccess: async () => {
      toast.success("Informasi kost disimpan");
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: () => {
      toast.error("Gagal menyimpan informasi kost");
    },
  });

  return (
    <div className="space-y-4 px-4 pt-20 pb-20">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Informasi Kost</h1>
        </TopBarCenter>
      </TopBar>

      <div className="rounded-2xl border bg-card p-5 space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">Nama Kost</p>
          <p>{namaKost || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Harga per bulan</p>
          <p>{hargaSewa ? `Rp ${hargaSewa}` : "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Alamat</p>
          <p className="whitespace-pre-wrap">{alamat || "-"}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-5">
        <form.Field name="nama_kost">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="nama-kost">Nama Kost</FieldLabel>
              <Input
                id="nama-kost"
                type="text"
                placeholder="Nama kost"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="harga_sewa">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="harga-sewa">Harga per bulan</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>Rp</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="harga-sewa"
                  placeholder="500.000"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </InputGroup>
            </Field>
          )}
        </form.Field>

        <form.Field name="alamat">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="alamat">Alamat</FieldLabel>
              <Textarea
                id="alamat"
                placeholder="Alamat lengkap kost"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
              />
            </Field>
          )}
        </form.Field>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent text-center">
        <Button
          type="button"
          className="w-full max-w-lg rounded-full mx-auto"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Simpan"
          )}
        </Button>
      </div>
    </div>
  );
}


