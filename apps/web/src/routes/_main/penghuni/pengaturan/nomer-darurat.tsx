import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { API_BASE } from "@/lib/config";

export const Route = createFileRoute(
  "/_main/penghuni/pengaturan/nomer-darurat",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <EditForm session={session} />;
}

function EditForm({
  session,
}: {
  session: ReturnType<typeof authClient.useSession>["data"];
}) {
  const queryClient = useQueryClient();
  const noDarurat = (session?.user as Record<string, unknown>)
    ?.noTeleponDarurat as string | undefined;

  const form = useForm({
    defaultValues: {
      noTeleponDarurat: noDarurat ?? "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const value = form.state.values;
      const res = await fetch(`${API_BASE}/auth/update-user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noTeleponDarurat: value.noTeleponDarurat,
        }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui nomor darurat");
    },
    onSuccess: async () => {
      toast.success("Nomor darurat disimpan");
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      window.history.back();
    },
    onError: () => {
      toast.error("Gagal menyimpan nomor darurat");
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
          <h1 className="text-lg whitespace-nowrap">Nomor Darurat</h1>
        </TopBarCenter>
      </TopBar>

      <div className="rounded-2xl border bg-card p-5 space-y-5">
        {noDarurat && (
          <div className="rounded-xl border bg-muted/30 p-4 space-y-1">
            <p className="text-sm font-medium">Nomor Darurat Saat Ini</p>
            <a
              href={`tel:${noDarurat}`}
              className="flex items-center gap-2 text-sm text-primary"
            >
              <Phone className="size-4" />
              {noDarurat}
            </a>
          </div>
        )}

        <form.Field name="noTeleponDarurat">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="darurat">Nomor Telepon Darurat</FieldLabel>
              <Input
                id="darurat"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>

        <p className="text-xs text-muted-foreground">
          Nomor ini akan digunakan untuk menghubungi Anda dalam situasi darurat.
        </p>
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
