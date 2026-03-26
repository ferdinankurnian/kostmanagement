import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { createInvite } from "@/lib/invite";

const searchSchema = z.object({
  kamar: z.number().or(z.string()).transform(Number),
});

export const Route = createFileRoute("/_main/pemilik/penghuni/form")({
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
});

const formSchema = z.object({
  name: z.string().min(1, "nama wajib diisi"),
});

function RouteComponent() {
  const router = useRouter();
  const navigate = useNavigate();
  const { kamar } = Route.useSearch();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async () => {
      setIsDrawerOpen(true);
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { name: string; noKamar: number }) => createInvite(data),
    onSuccess: (result) => {
      setIsDrawerOpen(false);
      navigate({
        to: "/pemilik/penghuni/created",
        search: {
          inviteId: result.id,
        },
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleFinalSubmit = () => {
    mutate({ name: form.state.values.name, noKamar: kamar });
  };

  return (
    <div className="pt-20 space-y-6">
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
      <div className="space-y-4 px-4">
        <form
          id="penghuni-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-2xl font-normal"
                    >
                      Silahkan masukkan nama penghuni:
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Nama"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
        <Button
          type="submit"
          form="penghuni-form"
          className="max-w-lg rounded-full fixed bottom-0 left-4 right-4 mx-auto mb-4"
        >
          Submit
        </Button>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent drag={false}>
            <div className="p-6 text-left">
              <DrawerTitle>Konfirmasi Data</DrawerTitle>
              <DrawerDescription>
                Apakah data yang Anda masukkan sudah benar?
              </DrawerDescription>
            </div>
            <div className="px-6 space-y-2 pb-0">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Nama Penghuni
                </span>
                <span className="text-lg font-medium">
                  {form.state.values.name}
                </span>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Nomor Kamar
                </span>
                <span className="text-lg font-medium">{kamar}</span>
              </div>
            </div>
            <DrawerFooter className="pt-6">
              <SlideToConfirm
                onConfirm={handleFinalSubmit}
                isLoading={isPending}
                text="Geser untuk Konfirmasi"
              />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
