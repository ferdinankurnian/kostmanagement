import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { user } from "./auth";

export const notificationRead = pgTable(
  "notification_read",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    notificationKey: text("notification_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (table) => [
    index("notification_read_userId_idx").on(table.userId),
    index("notification_read_userId_notificationKey_idx").on(
      table.userId,
      table.notificationKey,
    ),
  ],
);

export const notificationReadRelations = relations(
  notificationRead,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationRead.userId],
      references: [user.id],
    }),
  }),
);

export type NotificationRead = typeof notificationRead.$inferSelect;
export type NewNotificationRead = typeof notificationRead.$inferInsert;
