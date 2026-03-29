import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center px-4 pt-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.history.back()}
        >
          <ChevronLeft className="size-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Shield className="size-10 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Lupa Password?</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Untuk keamanan, reset password hanya bisa dilakukan oleh pemilik
            kost. Silakan hubungi pemilik kost Anda untuk bantuan.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">Cara Reset Password</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Hubungi pemilik kost secara langsung</li>
              <li>Sampaikan username Anda</li>
              <li>Pemilik akan mengatur ulang password</li>
            </ol>
          </div>

          <Link to="/login" className="block">
            <Button variant="outline" className="w-full">
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
