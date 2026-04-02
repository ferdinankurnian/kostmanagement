import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, ChevronLeft, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { API_BASE } from "@/lib/config";
import { getSettings, type Settings, updateSetting } from "@/lib/settings";
import { uploadAvatar } from "@/lib/upload";

export const Route = createFileRoute(
  "/_main/pemilik/pengaturan/informasi-pemilik/edit",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  if (sessionLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <EditForm session={session} settings={settings} />;
}

function EditForm({
  session,
  settings,
}: {
  session: ReturnType<typeof authClient.useSession>["data"];
  settings: Settings | undefined;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(session?.user.image ?? "");

  const form = useForm({
    defaultValues: {
      name: session?.user.name ?? "",
      noTelepon:
        ((session?.user as Record<string, unknown>).noTelepon as string) ?? "",
      namaBank: settings?.nama_bank ?? "",
      namaPemilik: settings?.nama_pemilik_rekening ?? "",
      noRekening: settings?.no_rekening ?? "",
    },
  });

  const namaBank = useStore(form.store, (s) => s.values.namaBank);
  const namaPemilik = useStore(form.store, (s) => s.values.namaPemilik);
  const noRekening = useStore(form.store, (s) => s.values.noRekening);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const value = form.state.values;
      await Promise.all([
        fetch(`${API_BASE}/auth/update-user`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: value.name,
            noTelepon: value.noTelepon,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error("Gagal memperbarui profil");
        }),
        updateSetting("nama_bank", value.namaBank),
        updateSetting("nama_pemilik_rekening", value.namaPemilik),
        updateSetting("no_rekening", value.noRekening),
      ]);
    },
    onSuccess: async () => {
      toast.success("Data diri disimpan");
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      window.history.back();
    },
    onError: () => {
      toast.error("Gagal menyimpan data diri");
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const { url } = await uploadAvatar(file);
      return url;
    },
    onSuccess: async (url) => {
      setAvatarUrl(url);
      // Force session refetch from better-auth
      await authClient.api.getSession({ query: { disableRefresh: false } });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Foto profil diperbarui");
    },
    onError: () => {
      toast.error("Gagal mengunggah foto profil");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    avatarMutation.mutate(file);
    e.target.value = "";
  };

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
          <h1 className="text-lg whitespace-nowrap">Edit Data Diri</h1>
        </TopBarCenter>
      </TopBar>

      <div className="rounded-2xl border bg-card p-5 space-y-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative group"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarMutation.isPending}
          >
            <Avatar className="size-16">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-xl">
                {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {avatarMutation.isPending ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : (
                <Camera className="size-5 text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="space-y-0">
            <p className="text-lg font-medium">{session?.user.name ?? "-"}</p>
            <p className="text-sm text-muted-foreground">
              {((session?.user as Record<string, unknown>).noTelepon as
                | string
                | undefined) || "No telepon belum diisi"}
            </p>
          </div>
        </div>

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="nama">Nama Lengkap</FieldLabel>
              <Input
                id="nama"
                type="text"
                placeholder="Nama lengkap"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="noTelepon">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="telepon">No Telepon</FieldLabel>
              <Input
                id="telepon"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-5">
        <div className="flex flex-col justify-between rounded-xl bg-primary text-white h-48 p-4">
          <p className="text-md font-medium">{namaBank || "Bank -"}</p>
          <p className="text-3xl text-center">{noRekening || "-"}</p>
          <p className="text-md text-end">{namaPemilik || "-"}</p>
        </div>

        <form.Field name="namaBank">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="bank">Nama Bank</FieldLabel>
              <Input
                id="bank"
                type="text"
                placeholder="BCA, Mandiri, BNI, dll"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="namaPemilik">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="pemilik">Nama Pemilik</FieldLabel>
              <Input
                id="pemilik"
                type="text"
                placeholder="Nama pemilik rekening"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="noRekening">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="rekening">No Rekening</FieldLabel>
              <Input
                id="rekening"
                type="text"
                placeholder="Nomor rekening"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
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
