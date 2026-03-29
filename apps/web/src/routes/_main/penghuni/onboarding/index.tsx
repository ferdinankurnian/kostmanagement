import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, PartyPopper } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOnboarding } from "@/lib/onboarding";

export const Route = createFileRoute("/_main/penghuni/onboarding/")({
  component: GreetingPage,
});

function GreetingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = Route.useRouteContext() as {
    user: { name: string; onboarding?: string | null };
  };

  if (user.user.onboarding !== "greeting") {
    navigate({
      to:
        user.user.onboarding === "bayar_tagihan"
          ? "/penghuni/onboarding/bayar-tagihan"
          : user.user.onboarding === "rule"
            ? "/penghuni/onboarding/rule"
            : "/penghuni",
    });
    return null;
  }

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await updateOnboarding("bayar_tagihan");
      navigate({ to: "/penghuni/onboarding/bayar-tagihan" });
    } catch {
      toast.error("Gagal memulai onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
        <PartyPopper className="size-10 text-primary" />
      </div>

      <h1 className="text-2xl font-semibold">
        Selamat datang, {user.user.name}!
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Kami bantu kenalin kamu sama aplikasi kost ini. Cuma butuh beberapa
        menit aja kok.
      </p>

      <Button
        onClick={handleNext}
        disabled={isLoading}
        className="mt-8 w-full max-w-sm rounded-full"
        size="lg"
      >
        {isLoading ? <Loader2 className="animate-spin mr-2 size-4" /> : null}
        Mulai
      </Button>
    </div>
  );
}
