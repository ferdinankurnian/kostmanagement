import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/tambah-penghuni/hasil")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-center items-center gap-6 py-12">
        <div className="p-3 bg-primary rounded-full">
          <Check className="size-8 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Penghuni Baru</h1>
          <p className="text-xs text-muted-foreground">
            24 Januari - Februari 2026
          </p>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 flex flex-col justify-center gap-8">
        <h1 className="text-xl">Akun Penghuni</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-sm text-muted-foreground">Username</h1>
            <p className="text-sm">username12</p>
          </div>
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-sm text-muted-foreground">Password</h1>
            <p className="text-sm">pssword123</p>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Link to="/admin">
          <Button type="submit" size="lg" className="w-full">
            Selesai
          </Button>
        </Link>
      </div>
    </div>
  );
}
