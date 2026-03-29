import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { PenghuniTabBar } from "@/components/tab-bar";
import { type TourStep, useTour } from "@/components/tour";
import { updateOnboarding } from "@/lib/onboarding";
import { getOnboardingRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/_main/penghuni/_main")({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== "user") {
      throw redirect({ to: "/" });
    }

    if (
      context.user.onboarding &&
      context.user.onboarding !== "completed" &&
      context.user.onboarding !== "tour"
    ) {
      throw redirect({ to: getOnboardingRoute(context.user.onboarding) });
    }

    return { user: context.user };
  },
  component: RouteComponent,
});

const tourSteps: TourStep[] = [
  {
    element: '[data-tour="header"]',
    popover: {
      title: "Profil & Notifikasi",
      description:
        "Nama dan tanggal hari ini tampil di sini. Ketuk lonceng untuk melihat notifikasi penting.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="stats"]',
    popover: {
      title: "Ringkasan Tagihan",
      description:
        "Lihat jumlah tagihan yang belum lunas dan pemberituan di sini.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="informasi"]',
    popover: {
      title: "Informasi Kost",
      description:
        "Cek informasi terbaru seputar kost, seperti laporan kerusakan dan pengumuman.",
      side: "top",
    },
  },
  {
    element: '[data-tour="pembayaran"]',
    popover: {
      title: "Riwayat Pembayaran",
      description:
        "Semua transaksi pembayaran kamu tercatat di sini. Pantau status lunas atau belum.",
      side: "top",
    },
  },
  {
    element: '[data-tour="tabbar"]',
    popover: {
      title: "Navigasi",
      description:
        "Gunakan tab di bawah untuk pindah ke Tagihan, Keluhan, atau Profil kamu.",
      side: "top",
    },
  },
];

function RouteComponent() {
  const navigate = useNavigate();
  const user = Route.useRouteContext() as {
    user: { onboarding?: string | null };
  };
  const isTourActive = user.user.onboarding === "tour";

  const finishTour = async () => {
    try {
      await updateOnboarding("rule");
      navigate({ to: "/penghuni/onboarding/rule" });
    } catch {
      toast.error("Gagal update onboarding");
    }
  };

  const { start } = useTour({
    steps: tourSteps,
    onComplete: finishTour,
    onSkip: finishTour,
  });

  useEffect(() => {
    if (isTourActive) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(start, 300);
      return () => clearTimeout(timer);
    }
  }, [isTourActive, start]);

  return (
    <div className="pb-24">
      <Outlet />
      <div data-tour="tabbar">
        <PenghuniTabBar />
      </div>
    </div>
  );
}
