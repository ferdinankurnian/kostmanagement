import { createDB } from "@repo/db";
import { invitation, tagihan, user } from "@repo/db/schema";
import { asc, eq } from "drizzle-orm";
import type { Env } from "../app";

export type OnboardingStatus = {
  inviteId: string;
  code: string;
  name: string;
  noKamar: number;
  isUsed: boolean;
  user: {
    id: string;
    name: string;
    ktp: string | null;
    ktpStatus: "pending" | "approved" | "rejected" | null;
    ktpRejectionReason: string | null;
  } | null;
  tagihan: {
    id: string;
    status: "belum_dibayar" | "menunggu_verifikasi" | "lunas" | "ditolak";
    periode: string;
    jumlah: number;
    monthsPaid: number;
    buktiPembayaran: string | null;
    alasanPenolakan: string | null;
  } | null;
};

export class OnboardingDO {
  private env: Env;
  private sessions: WebSocket[] = [];
  private code: string | null = null;

  constructor(_state: DurableObjectState, env: Env) {
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      this.code = url.searchParams.get("code");
      return this.handleWebSocket(request);
    }

    if (url.pathname === "/notify") {
      await this.broadcastStatus();
      return new Response("ok");
    }

    if (url.pathname === "/close") {
      this.closeAllSessions();
      return new Response("ok");
    }

    return new Response("Not found", { status: 404 });
  }

  private closeAllSessions(): void {
    for (const session of this.sessions) {
      try {
        session.close(1000, "User deleted");
      } catch {
        // ignore errors
      }
    }
    this.sessions = [];
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();
    this.sessions.push(server);

    server.addEventListener("close", () => {
      this.sessions = this.sessions.filter((s) => s !== server);
    });

    server.addEventListener("error", () => {
      this.sessions = this.sessions.filter((s) => s !== server);
    });

    const status = await this.fetchStatus();
    if (status) {
      server.send(JSON.stringify(status));
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  private async broadcastStatus(): Promise<void> {
    const status = await this.fetchStatus();
    if (!status) return;

    const message = JSON.stringify(status);
    const dead: WebSocket[] = [];

    for (const session of this.sessions) {
      try {
        session.send(message);
      } catch {
        dead.push(session);
      }
    }

    this.sessions = this.sessions.filter((s) => !dead.includes(s));
  }

  private async fetchStatus(): Promise<OnboardingStatus | null> {
    const db = createDB(this.env.DATABASE_URL);
    const code = this.code;
    if (!code) return null;

    const invites = await db
      .select()
      .from(invitation)
      .where(eq(invitation.code, code));

    const inv = invites[0];
    if (!inv) return null;

    let userData: OnboardingStatus["user"] = null;
    let tagihanData: OnboardingStatus["tagihan"] = null;

    if (inv.isUsed) {
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          ktp: user.ktp,
          ktpStatus: user.ktpStatus,
          ktpRejectionReason: user.ktpRejectionReason,
        })
        .from(user)
        .where(eq(user.noKamar, inv.noKamar))
        .limit(1);

      if (users[0]) {
        userData = users[0];

        // Get first tagihan for this user (onboarding tagihan) - earliest by createdAt
        const tagihanRows = await db
          .select({
            id: tagihan.id,
            status: tagihan.status,
            periode: tagihan.periode,
            jumlah: tagihan.jumlah,
            monthsPaid: tagihan.monthsPaid,
            buktiPembayaran: tagihan.buktiPembayaran,
            alasanPenolakan: tagihan.alasanPenolakan,
          })
          .from(tagihan)
          .where(eq(tagihan.userId, users[0].id))
          .orderBy(asc(tagihan.createdAt))
          .limit(1);

        if (tagihanRows[0]) {
          tagihanData = {
            ...tagihanRows[0],
            monthsPaid: tagihanRows[0].monthsPaid ?? 1,
          };
        }
      }
    }

    return {
      inviteId: inv.id,
      code: inv.code,
      name: inv.name,
      noKamar: inv.noKamar,
      isUsed: inv.isUsed,
      user: userData,
      tagihan: tagihanData,
    };
  }
}
