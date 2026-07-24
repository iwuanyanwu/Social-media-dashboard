import { Router, type IRouter } from "express";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db, analyticsTable, postsTable } from "@workspace/db";
import {
  ListAnalyticsQueryParams,
  ListAnalyticsResponse,
  GetAnalyticsSummaryResponse,
  GetPlatformBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/summary", async (req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalPosts: sql<number>`count(*)`.mapWith(Number),
      totalPublished: sql<number>`count(*) filter (where status = 'published')`.mapWith(Number),
      totalScheduled: sql<number>`count(*) filter (where status = 'scheduled')`.mapWith(Number),
      totalDrafts: sql<number>`count(*) filter (where status = 'draft')`.mapWith(Number),
      postsThisWeek: sql<number>`count(*) filter (where created_at >= now() - interval '7 days')`.mapWith(Number),
    })
    .from(postsTable);

  const [engagement] = await db
    .select({
      totalLikes: sql<number>`coalesce(sum(likes), 0)`.mapWith(Number),
      totalComments: sql<number>`coalesce(sum(comments), 0)`.mapWith(Number),
      totalShares: sql<number>`coalesce(sum(shares), 0)`.mapWith(Number),
      totalReach: sql<number>`coalesce(sum(reach), 0)`.mapWith(Number),
      totalImpressions: sql<number>`coalesce(sum(impressions), 0)`.mapWith(Number),
    })
    .from(analyticsTable);

  const totalEngagement = (engagement?.totalLikes ?? 0) + (engagement?.totalComments ?? 0) + (engagement?.totalShares ?? 0);
  const totalImpressions = engagement?.totalImpressions ?? 0;
  const engagementRate = totalImpressions > 0 ? totalEngagement / totalImpressions : 0;

  const summary = {
    totalPosts: totals?.totalPosts ?? 0,
    totalPublished: totals?.totalPublished ?? 0,
    totalScheduled: totals?.totalScheduled ?? 0,
    totalDrafts: totals?.totalDrafts ?? 0,
    postsThisWeek: totals?.postsThisWeek ?? 0,
    totalLikes: engagement?.totalLikes ?? 0,
    totalComments: engagement?.totalComments ?? 0,
    totalShares: engagement?.totalShares ?? 0,
    totalReach: engagement?.totalReach ?? 0,
    totalImpressions: totalImpressions,
    engagementRate,
  };

  res.json(GetAnalyticsSummaryResponse.parse(summary));
});

router.get("/analytics/platform-breakdown", async (req, res): Promise<void> => {
  const breakdown = await db
    .select({
      platform: analyticsTable.platform,
      likes: sql<number>`coalesce(sum(likes), 0)`.mapWith(Number),
      comments: sql<number>`coalesce(sum(comments), 0)`.mapWith(Number),
      shares: sql<number>`coalesce(sum(shares), 0)`.mapWith(Number),
      reach: sql<number>`coalesce(sum(reach), 0)`.mapWith(Number),
      posts: sql<number>`count(distinct post_id)`.mapWith(Number),
    })
    .from(analyticsTable)
    .groupBy(analyticsTable.platform);

  res.json(GetPlatformBreakdownResponse.parse(breakdown));
});

router.get("/analytics", async (req, res): Promise<void> => {
  const params = ListAnalyticsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.platform) {
    conditions.push(eq(analyticsTable.platform, params.data.platform));
  }
  if (params.data.from) {
    conditions.push(gte(analyticsTable.recordedAt, new Date(params.data.from)));
  }
  if (params.data.to) {
    conditions.push(lte(analyticsTable.recordedAt, new Date(params.data.to)));
  }

  const rows = await db
    .select()
    .from(analyticsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(analyticsTable.recordedAt));

  res.json(
    ListAnalyticsResponse.parse(
      rows.map((r) => ({
        ...r,
        recordedAt: r.recordedAt.toISOString(),
      })),
    ),
  );
});

export default router;
