import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { TopBar, TopBarCenter, TopBarLeft } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/tambah-penghuni/pilih-kamar")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarLeft>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/admin" })}
          >
            <ChevronLeft className="size-6" />
          </Button>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg whitespace-nowrap">Pilih Kamar</h1>
        </TopBarCenter>
      </TopBar>
      <div className="space-y-6">
        <Link to="/admin/tambah-penghuni/form">
          <Card className="rounded-sm gap-1 p-3 bg-linear-to-br from-white to-[#A7D9FF]">
            <CardHeader className="p-0">
              <h1 className="text-muted-foreground">Kamar</h1>
            </CardHeader>
            <CardContent className="p-0">
              <h1 className="text-2xl">1</h1>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
