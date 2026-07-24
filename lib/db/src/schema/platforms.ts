import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformsTable = pgTable("platforms", {
  name: text("name").primaryKey(), // facebook, linkedin, twitter, instagram
  displayName: text("display_name").notNull(),
  connected: boolean("connected").notNull().default(false),
  accessToken: text("access_token"),
  accountName: text("account_name"),
  connectedAt: timestamp("connected_at", { withTimezone: true }),
});

export const insertPlatformSchema = createInsertSchema(platformsTable);
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platformsTable.$inferSelect;
