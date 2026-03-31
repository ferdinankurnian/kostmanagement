import type { ScheduledEvent } from "@cloudflare/workers-types";
import { app, type Env } from "./app";
import { handleScheduled } from "./scheduled";

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Env) => {
    await handleScheduled(env);
  },
};
