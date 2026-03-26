import { Link, useRouter } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  title?: string;
  message?: string;
  code?: number | string;
}

export function ErrorPage({
  title = "Terjadi Kesalahan",
  message = "Waduh, sepertinya ada yang salah di sisi kami. Silakan coba lagi nanti.",
  code = 500,
}: ErrorPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertCircle size={48} />
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-2">{code}</h1>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="text-muted-foreground mb-8 max-w-xs">{message}</p>

      <div className="flex flex-col w-full gap-3 max-w-xs">
        <Link to="/">
          <Button className="w-full rounded-full">
            <Home /> Ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="Halaman Tidak Ditemukan"
      message="Maaf, halaman yang Anda cari tidak ada atau sudah pindah ke tempat lain."
    />
  );
}
