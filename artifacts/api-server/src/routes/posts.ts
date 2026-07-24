import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db, postsTable } from "@workspace/db";
import {
  ListPostsQueryParams,
  ListPostsResponse,
  CreatePostBody,
  CreatePostResponse,
  GetCalendarPostsQueryParams,
  GetCalendarPostsResponse,
  GetPostParams,
  GetPostResponse,
  UpdatePostParams,
  UpdatePostBody,
  UpdatePostResponse,
  DeletePostParams,
  PublishPostParams,
  PublishPostResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/posts/recent-activity", async (req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(postsTable)
    .orderBy(desc(postsTable.updatedAt))
    .limit(10);
  res.json(GetRecentActivityResponse.parse(posts.map(serializePost)));
});

router.get("/posts/calendar", async (req, res): Promise<void> => {
  const params = GetCalendarPostsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { year, month } = params.data;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const posts = await db
    .select()
    .from(postsTable)
    .where(
      and(
        gte(postsTable.scheduledAt, startDate),
        lt(postsTable.scheduledAt, endDate),
      ),
    )
    .orderBy(asc(postsTable.scheduledAt));

  res.json(GetCalendarPostsResponse.parse(posts.map(serializePost)));
});

router.get("/posts", async (req, res): Promise<void> => {
  const params = ListPostsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.status) {
    conditions.push(eq(postsTable.status, params.data.status));
  }
  if (params.data.platform) {
    conditions.push(
      sql`${params.data.platform} = ANY(${postsTable.platforms})`,
    );
  }

  const posts = await db
    .select()
    .from(postsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(postsTable.createdAt));

  res.json(ListPostsResponse.parse(posts.map(serializePost)));
});

router.post("/posts", async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, platforms, scheduledAt, mediaUrl } = parsed.data;
  const status = scheduledAt ? "scheduled" : "draft";

  const [post] = await db
    .insert(postsTable)
    .values({
      content,
      platforms,
      status,
      mediaUrl: mediaUrl ?? null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    })
    .returning();

  res.status(201).json(CreatePostResponse.parse(serializePost(post)));
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, params.data.id));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(GetPostResponse.parse(serializePost(post)));
});

router.patch("/posts/:id", async (req, res): Promise<void> => {
  const params = UpdatePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.content !== undefined) updateData.content = parsed.data.content;
  if (parsed.data.mediaUrl !== undefined) updateData.mediaUrl = parsed.data.mediaUrl;
  if (parsed.data.platforms !== undefined) updateData.platforms = parsed.data.platforms;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.scheduledAt !== undefined) {
    updateData.scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
    if (parsed.data.scheduledAt) updateData.status = "scheduled";
  }

  const [post] = await db
    .update(postsTable)
    .set(updateData)
    .where(eq(postsTable.id, params.data.id))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(UpdatePostResponse.parse(serializePost(post)));
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(postsTable)
    .where(eq(postsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/posts/:id/publish", async (req, res): Promise<void> => {
  const params = PublishPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, params.data.id));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  // Simulate publishing — in production this calls the social media APIs
  const [updated] = await db
    .update(postsTable)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(postsTable.id, params.data.id))
    .returning();

  res.json(PublishPostResponse.parse(serializePost(updated)));
});

function serializePost(post: typeof postsTable.$inferSelect) {
  return {
    ...post,
    mediaUrl: post.mediaUrl ?? null,
    scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString() : null,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    errorMessage: post.errorMessage ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export default router;
