import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed === "true") {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <Card className="p-4 flex items-start gap-3 border-primary/20 bg-primary/5">
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Install Aplikasi</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          install app ini di hp kamu biar lebih gampang aksesnya, langsung dari
          home screen
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleInstall} size="sm" className="h-8 text-xs">
          Install
        </Button>
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
