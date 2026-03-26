import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CheckIcon, Copy, UserCheck, UserCog } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { getInvite } from "@/lib/invite";

const searchSchema = z.object({
  inviteId: z.coerce.string(),
});

export const Route = createFileRoute("/_main/pemilik/penghuni/created")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { inviteId } }) => ({ inviteId }),
  loader: async ({ deps: { inviteId } }) => {
    const invite = await getInvite(inviteId);
    if (!invite) {
      throw new Error("Invitation not found");
    }
    return { invite };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invite } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

  const signUpUrl = `${window.location.origin}/sign-up?code=${invite.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(invite.code);
    setCopied(true);
    toast.success("Kode berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col p-4 pb-14">
      <div className="flex flex-col justify-center items-center gap-2 py-8">
        <div
          className={
            "p-3 rounded-full " +
            (invite.isUsed ? "bg-primary" : "bg-yellow-500")
          }
        >
          {invite.isUsed ? (
            <UserCheck size={28} className="text-white" />
          ) : (
            <UserCog size={28} className="text-white" />
          )}
        </div>
        <div className="flex flex-col justify-center items-center gap-1">
          <h1 className="text-xl font-semibold">
            {invite.isUsed
              ? "Penghuni berhasil ditambahkan"
              : "Menunggu penghuni mendaftar..."}
          </h1>
          <p className="text-muted-foreground text-sm">
            {invite.name} di Kamar {invite.noKamar}
          </p>
        </div>
      </div>
      <div>
        <Card className={invite.isUsed ? "opacity-50" : ""}>
          <CardHeader className="flex flex-col justify-center items-center">
            <CardTitle>Kode Verifikasi Sign Up</CardTitle>
            <CardDescription className="text-center">
              Silakan masukkan kode berikut untuk mengaktifkan akun penghuni.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center gap-4">
            <InputOTP maxLength={6} value={invite.code} disabled>
              <InputOTPGroup>
                {invite.code.split("").map((char, i) => (
                  <InputOTPSlot key={i} className="text-lg" index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <QRCodeSVG value={signUpUrl} size={200} />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckIcon className="size-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-4" /> Copy Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        <div className="text-sm py-4 text-muted-foreground">
          <p className="font-medium mb-2">Cara panduan:</p>
          <ol className="list-decimal list-outside ml-4 space-y-1">
            <li>
              Buka tautan <span className="font-medium">{signUpUrl}</span> atau
              scan QR code di atas menggunakan kamera ponsel Anda.
            </li>
            <li>
              Setelah halaman terbuka, masukkan kode verifikasi yang tertera di
              atas.
            </li>
            <li>Ikuti langkah-langkah pengisian formulir hingga selesai.</li>
          </ol>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-linear-to-t from-background to-transparent">
        <Link to="/pemilik">
          <Button
            type="button"
            className="w-full max-w-lg rounded-full mx-auto block"
          >
            Selesai
          </Button>
        </Link>
      </div>
    </div>
  );
}
