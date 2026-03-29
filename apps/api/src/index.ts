import type { ScheduledEvent } from "@cloudflare/workers-types";
import { app } from "./app";
import type { Env } from "./auth-worker";
import { handleScheduled } from "./scheduled";

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Env) => {
    await handleScheduled(env);
  },
};
