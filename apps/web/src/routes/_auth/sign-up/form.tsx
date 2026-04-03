import { useForm } from "@tanstack/react-form";
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { setPersistentSession } from "@/lib/ephemeral-session";
import { useInvite, validateInvite } from "@/lib/invite";

const searchSchema = z.object({
  inviteCode: z.string().optional(),
});

export const Route = createFileRoute("/_auth/sign-up/form")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    if (!search.inviteCode) {
      throw redirect({ to: "/sign-up" });
    }

    try {
      const invite = await validateInvite({ code: search.inviteCode });
      return { inviteName: invite.name };
    } catch (err) {
      throw redirect({ to: "/sign-up" });
    }
  },
  component: RouteComponent,
});

const signUpSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter."),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter.")
    .regex(/^[a-z0-9_]+$/, "Hanya huruf kecil, angka, dan underscore."),
  password: z.string().min(8, "Password minimal 8 karakter."),
  noTelepon: z
    .string()
    .regex(/^(\+62|08)\d{8,11}$/, "Format nomor tidak valid."),
});

function RouteComponent() {
  const { inviteCode } = Route.useSearch() as { inviteCode: string };
  const { inviteName } = Route.useRouteContext() as { inviteName: string };
  const navigate = useNavigate();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      nama: inviteName,
      username: "",
      password: "",
      noTelepon: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await authClient.signUp.email({
          email: `${value.username}@placeholder.kost`,
          username: value.username,
          password: value.password,
          name: value.nama,
          data: {
            noTelepon: value.noTelepon,
          },
          callbackURL: "/sign-up/ktp",
          fetchOptions: {
            onSuccess: async () => {
              // Always set persistent session for new signups
              setPersistentSession();
              try {
                await useInvite({ code: inviteCode });
                toast.success("Akun berhasil dibuat!");
                navigate({
                  to: "/sign-up/ktp",
                  search: { inviteCode },
                });
              } catch (inviteErr: any) {
                toast.error(
                  "Akun dibuat, tapi gagal aktivasi kamar: " +
                    inviteErr.message,
                );
                navigate({ to: "/sign-up/ktp", search: { inviteCode } });
              }
            },
            onError: (ctx) => {
              toast.error(ctx.error.message || "Gagal membuat akun.");
              setIsLoading(false);
            },
          },
        });
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan sistem.");
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
            onClick={() => router.history.back()}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Isi Data Penghuni</h1>
        </TopBarCenter>
      </TopBar>
      <div className="space-y-2 px-4">
        <form
          id="penghuni-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-6">
            <form.Field name="nama">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>Nama Lengkap</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Budi Santoso"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="username">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="budi_santoso"
                    />
                    <FieldDescription>
                      Huruf kecil, angka, underscore.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="••••••••"
                    />
                    <FieldDescription>Minimal 8 karakter.</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="noTelepon">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>Nomor Telepon</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="08123456789"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent text-center">
          <Button
            type="submit"
            form="penghuni-form"
            disabled={isLoading || !form.state.canSubmit}
            className="w-full max-w-lg rounded-full mx-auto"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2 inline" />
            ) : null}
            Lanjut ke Upload KTP
          </Button>
        </div>
      </div>
    </div>
  );
}
