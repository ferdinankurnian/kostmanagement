import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import {
  setEphemeralSession,
  setPersistentSession,
} from "@/lib/ephemeral-session";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: Page,
});

function Page() {
  const { redirect } = Route.useSearch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.signIn.username({
      username,
      password,
      rememberMe: remember,
    });

    if (error) {
      setError(error.message ?? "Login gagal");
      setLoading(false);
      return;
    }

    if (remember) {
      setPersistentSession();
    } else {
      setEphemeralSession();
    }

    window.location.replace(redirect ?? "/");
  };

  return (
    <div
      style={{
        background: `url("/sign-in-cover.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="grid grid-rows-2 min-h-screen"
    >
      <div className="flex flex-col justify-end p-6 bg-black/20 gap-2">
        <h1 className="text-2xl text-white font-semibold">
          Masuk untuk mengakses Aplikasi Kost
        </h1>
        <p className="text-lg text-white">Masukkan username dan password</p>
      </div>
      <div className="bg-background text-foreground rounded-t-xl p-6 flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex flex-row justify-between">
            <div className="flex flex-row items-center gap-1.5">
              <Checkbox
                id="remember-me"
                name="remember-me"
                checked={remember}
                onCheckedChange={(checked) => setRemember(!!checked)}
              />
              <Label htmlFor="remember-me">Remember me</Label>
            </div>
            <Link to="/forgot-password">
              <Button type="button" size="sm" variant="link">
                Forgot Password?
              </Button>
            </Link>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid gap-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
            <Separator />
            <Link to="/sign-up" search={{ code: undefined }}>
              <Button type="button" variant="ghost" className="w-full">
                Member baru? Daftar disini
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
