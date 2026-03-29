import { API_BASE } from "@/lib/config";

export type OnboardingStep =
  | "greeting"
  | "tour"
  | "bayar_tagihan"
  | "rule"
  | "completed";

export async function updateOnboarding(
  step: OnboardingStep,
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/onboarding`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal update onboarding");
  }
  return res.json();
}
