import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadKTP } from "@/lib/upload";

export const Route = createFileRoute("/_auth/sign-up/ktp")({
  validateSearch: z.object({
    inviteCode: z.string(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { inviteCode } = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      ktpImage: undefined as File | undefined,
    },
    validators: {
      onSubmit: z.object({
        ktpImage: z.instanceof(File, { message: "KTP wajib diunggah" }),
      }),
    },
    onSubmit: async ({ value }) => {
      if (!value.ktpImage) return;

      setIsLoading(true);
      try {
        await uploadKTP(value.ktpImage);

        toast.success("KTP berhasil diunggah!");

        navigate({
          to: "/sign-up/waiting",
          search: { inviteCode },
        });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Gagal mengunggah KTP.",
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="py-20 space-y-6">
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
          <h1 className="text-lg whitespace-nowrap">Unggah KTP</h1>
        </TopBarCenter>
      </TopBar>

      <div className="px-6 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Satu langkah lagi!
          </h2>
          <p className="text-muted-foreground">
            Silakan unggah foto KTP Anda untuk verifikasi identitas.
          </p>
        </div>

        <form
          id="ktp-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="ktpImage">
            {(field) => {
              const isInvalid = field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid} className="gap-4">
                  <FileUpload
                    id={field.name}
                    accept="image/jpeg,image/png,image/webp"
                    description="Format: JPG, PNG, atau WebP (akan dikompres otomatis)"
                    maxSize={2}
                    onFilesSelected={(files) => {
                      field.handleChange(files[0]);
                    }}
                    error={isInvalid}
                    value={field.state.value ? [field.state.value] : []}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </form>

        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent">
          <Button
            type="submit"
            form="ktp-form"
            disabled={isLoading || !form.state.canSubmit}
            className="w-full max-w-lg rounded-full mx-auto block"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2 inline" />
            ) : null}
            Selesaikan Pendaftaran
          </Button>
        </div>
      </div>
    </div>
  );
}
