import type { ScheduledEvent } from "@cloudflare/workers-types";
import { app, type Env } from "./app";
import { OnboardingDO } from "./durable-objects/onboarding";
import { handleScheduled } from "./scheduled";

export { OnboardingDO };

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Env) => {
    await handleScheduled(env);
  },
};
