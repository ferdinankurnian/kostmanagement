import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerNestedRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { createInvite } from "@/lib/invite";
import { verifyPin } from "@/lib/settings";

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
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [nestedOpen, setNestedOpen] = useState(false);

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
          code: result.code,
        },
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyPin(pin),
    onSuccess: () => {
      setPinError("");
      mutate({ name: form.state.values.name, noKamar: kamar });
    },
    onError: (e: Error) => {
      setPinError(e.message || "PIN salah");
    },
  });

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
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent text-center">
          <Button
            type="submit"
            form="penghuni-form"
            className="w-full max-w-lg rounded-full mx-auto"
          >
            Submit
          </Button>
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
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

            <div className="px-6 pt-6 space-y-2">
              <DrawerNestedRoot
                open={nestedOpen}
                onOpenChange={(open) => {
                  setNestedOpen(open);
                  if (!open) {
                    setPin("");
                    setPinError("");
                  }
                }}
              >
                <DrawerTrigger asChild>
                  <Button className="w-full">Lanjut</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="text-center">
                    <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-red-100">
                      <ShieldAlert className="size-5 text-red-600" />
                    </div>
                    <DrawerTitle>Masukkan PIN Keamanan</DrawerTitle>
                    <DrawerDescription>
                      PIN diperlukan untuk melanjutkan pembuatan undangan
                      penghuni baru.
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="px-6 space-y-5 pb-4">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={pin}
                        onChange={(v) => {
                          setPin(v);
                          setPinError("");
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="size-12 text-lg" />
                          <InputOTPSlot index={1} className="size-12 text-lg" />
                          <InputOTPSlot index={2} className="size-12 text-lg" />
                          <InputOTPSlot index={3} className="size-12 text-lg" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {pinError && (
                      <p className="text-sm text-red-600 text-center">
                        {pinError}
                      </p>
                    )}

                    <SlideToConfirm
                      onConfirm={() => verifyMutation.mutate()}
                      isLoading={verifyMutation.isPending || isPending}
                      disabled={pin.length < 4}
                      text="Geser untuk Konfirmasi"
                    />
                  </div>

                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Batal</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </DrawerNestedRoot>
            </div>

            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Batal</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
