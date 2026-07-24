import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, platformsTable } from "@workspace/db";
import {
  ListPlatformsResponse,
  ConnectPlatformParams,
  ConnectPlatformBody,
  ConnectPlatformResponse,
  DisconnectPlatformParams,
  DisconnectPlatformResponse,
} from "@workspace/api-zod";

const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  instagram: "Instagram",
};

const router: IRouter = Router();

router.get("/platforms", async (req, res): Promise<void> => {
  const allPlatformNames = ["facebook", "linkedin", "twitter", "instagram"];

  // Get existing rows
  const existing = await db.select().from(platformsTable);
  const existingMap = new Map(existing.map((p) => [p.name, p]));

  // Ensure all platforms have rows (create missing ones)
  const missing = allPlatformNames.filter((n) => !existingMap.has(n));
  if (missing.length > 0) {
    await db.insert(platformsTable).values(
      missing.map((name) => ({
        name,
        displayName: PLATFORM_DISPLAY_NAMES[name] ?? name,
        connected: false,
      })),
    );
  }

  const platforms = await db.select().from(platformsTable);
  res.json(
    ListPlatformsResponse.parse(
      platforms.map(serializePlatform).sort((a, b) =>
        allPlatformNames.indexOf(a.name) - allPlatformNames.indexOf(b.name),
      ),
    ),
  );
});

router.post("/platforms/:name/connect", async (req, res): Promise<void> => {
  const params = ConnectPlatformParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ConnectPlatformBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name } = params.data;
  const { accessToken, accountName } = parsed.data;

  const [platform] = await db
    .insert(platformsTable)
    .values({
      name,
      displayName: PLATFORM_DISPLAY_NAMES[name] ?? name,
      connected: true,
      accessToken,
      accountName: accountName ?? null,
      connectedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: platformsTable.name,
      set: {
        connected: true,
        accessToken,
        accountName: accountName ?? null,
        connectedAt: new Date(),
      },
    })
    .returning();

  res.json(ConnectPlatformResponse.parse(serializePlatform(platform)));
});

router.delete("/platforms/:name/disconnect", async (req, res): Promise<void> => {
  const params = DisconnectPlatformParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [platform] = await db
    .update(platformsTable)
    .set({ connected: false, accessToken: null, accountName: null, connectedAt: null })
    .where(eq(platformsTable.name, params.data.name))
    .returning();

  if (!platform) {
    res.status(404).json({ error: "Platform not found" });
    return;
  }

  res.json(DisconnectPlatformResponse.parse(serializePlatform(platform)));
});

function serializePlatform(platform: typeof platformsTable.$inferSelect) {
  return {
    name: platform.name,
    displayName: platform.displayName,
    connected: platform.connected,
    accountName: platform.accountName ?? null,
    connectedAt: platform.connectedAt ? platform.connectedAt.toISOString() : null,
  };
}

export default router;
