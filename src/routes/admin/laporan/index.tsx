import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TopBar,
  TopBarCenter,
  TopBarLeft,
  TopBarRight,
} from "@/components/top-bar";

export const Route = createFileRoute("/admin/laporan/")({
  component: RouteComponent,
});

const laporanSekarang = [
  {
    id: 1,
    kamar: "Kamar 2",
    pesan:
      "Semangat buat yang bersih bersihin area kost, tetap semangat dan sehat selalu",
  },
];

const laporanKemarin = [
  {
    id: 2,
    kamar: "Kamar 3",
    pesan:
      "Semangat buat yang bersih bersihin area kost, tetap semangat dan sehat selalu",
  },
  {
    id: 3,
    kamar: "Kamar 5",
    pesan:
      "Semangat buat yang bersih bersihin area kost, tetap semangat dan sehat selalu",
  },
  {
    id: 4,
    kamar: "Kamar 1",
    pesan:
      "Semangat buat yang bersih bersihin area kost, tetap semangat dan sehat selalu",
  },
];

function RouteComponent() {
  return (
    <div className="space-y-4">
      <TopBar>
        <TopBarLeft>
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="size-6" />
            </Button>
          </Link>
        </TopBarLeft>
        <TopBarCenter>
          <h1 className="text-lg">Laporan</h1>
        </TopBarCenter>
        <TopBarRight>
          <Button variant="secondary" size="sm">
            Minggu <ChevronDown />
          </Button>
        </TopBarRight>
      </TopBar>
      <div className="grid gap-4">
        <div className="space-y-3">
          <h1 className="text-md">Sekarang</h1>
          <div className="grid gap-3">
            {laporanSekarang.map((item) => (
              <Card
                key={item.id}
                className="rounded-lg p-4 bg-white shadow-none border gap-0"
              >
                <CardHeader className="p-0">
                  <div className="flex flex-row justify-between items-center">
                    <CardTitle className="text-lg font-normal">
                      {item.kamar}
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreVertical className="size-5" />
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-0 space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">{item.pesan}</p>
                  <Link to="/admin/laporan/view">
                    <Button size="sm" className="rounded-full px-6">
                      Detail
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-md">Kemarin</h1>
          <div className="grid gap-3">
            {laporanKemarin.map((item) => (
              <Card
                key={item.id}
                className="rounded-lg p-4 bg-white shadow-none border gap-0"
              >
                <CardHeader className="p-0">
                  <div className="flex flex-row justify-between items-center">
                    <CardTitle className="text-lg font-normal">
                      {item.kamar}
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreVertical className="size-5" />
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-0 space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">{item.pesan}</p>
                  <Link to="/admin/laporan/view">
                    <Button size="sm" className="rounded-full px-6">
                      Detail
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
