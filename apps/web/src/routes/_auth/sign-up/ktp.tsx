import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      ktpImage: undefined as File | undefined,
    },
    validators: {
      onSubmit: z.object({
        ktpImage: z.instanceof(File, { message: "KTP wajib diupload" }),
      }),
    },
    onSubmit: async ({ value }) => {
      if (!value.ktpImage) return;

      setIsLoading(true);
      try {
        // 1. Convert File to Base64 (because server functions usually like serializable data)
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]); // remove data:image/...;base64,
          };
          reader.readAsDataURL(value.ktpImage!);
        });

        const base64 = await base64Promise;

        // 2. Upload to R2 via API
        await uploadKTP({
          fileName: value.ktpImage.name,
          fileType: value.ktpImage.type,
          base64,
        });

        toast.success("KTP berhasil diupload!");

        // 3. Final Redirect to Tenant Dashboard
        navigate({ to: "/penghuni/onboarding" });
      } catch (err: any) {
        toast.error(err.message || "Gagal mengupload KTP.");
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
          <h1 className="text-lg whitespace-nowrap">Upload KTP</h1>
        </TopBarCenter>
      </TopBar>

      <div className="px-6 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Satu langkah lagi!
          </h2>
          <p className="text-muted-foreground">
            Silakan upload foto KTP Anda untuk verifikasi identitas.
          </p>
        </div>

        <form
          id="ktp-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="ktpImage"
            children={(field) => {
              const isInvalid = field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid} className="gap-4">
                  <FileUpload
                    id={field.name}
                    accept="image/jpeg,image/png,image/webp"
                    description="Format: JPG, PNG, atau WebP (Max. 2MB)"
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
          />
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
