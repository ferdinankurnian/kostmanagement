import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar, TopBarLeft, TopBarCenter } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/laporan/view")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarLeft>
          <Link to="/admin/laporan">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="size-6" />
            </Button>
          </Link>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg">Detail Laporan</h1>
        </TopBarCenter>
      </TopBar>
      <div className="space-y-4 flex flex-col">
        <div className="bg-black h-38 rounded-md"></div>
        <div className="space-y-4">
          <h1 className="text-2xl ">Lorem Ipsum</h1>
          <p className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Link to="/admin/laporan">
          <Button type="submit" size="lg" className="w-full">
            Kembali
          </Button>
        </Link>
      </div>
    </div>
  );
}
