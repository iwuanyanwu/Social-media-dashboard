import { useGetAnalyticsSummary, useListPlatforms, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Send, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_ICONS, STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary();
  const { data: platforms, isLoading: isLoadingPlatforms } = useListPlatforms();
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening across your connected platforms.</p>
        </div>
        <Link href="/compose">
          <Button>Compose Post</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Reach" 
          value={summary?.totalReach?.toLocaleString() || "0"} 
          icon={Users} 
          isLoading={isLoadingSummary} 
        />
        <KpiCard 
          title="Published" 
          value={summary?.totalPublished?.toLocaleString() || "0"} 
          icon={Send} 
          isLoading={isLoadingSummary} 
        />
        <KpiCard 
          title="Scheduled" 
          value={summary?.totalScheduled?.toLocaleString() || "0"} 
          icon={Clock} 
          isLoading={isLoadingSummary} 
        />
        <KpiCard 
          title="Engagement Rate" 
          value={`${summary?.engagementRate?.toFixed(1) || "0"}%`} 
          icon={Activity} 
          isLoading={isLoadingSummary} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentActivity?.map((post) => (
                  <div key={post.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      {post.platforms.map((p) => {
                        const Icon = PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS];
                        return Icon ? <Icon key={p} className="w-4 h-4" /> : null;
                      })}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium line-clamp-1">{post.content}</p>
                        <Badge variant="outline" className={STATUS_COLORS[post.status]}>
                          {post.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span>{format(new Date(post.updatedAt || post.createdAt), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Platform Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {isLoadingPlatforms ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 items-center p-3 rounded-lg border">
                    <Skeleton className="w-8 h-8 rounded-md" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              platforms?.map((platform) => {
                const Icon = PLATFORM_ICONS[platform.name];
                return (
                  <div key={platform.name} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                        {Icon && <Icon className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{platform.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {platform.connected ? platform.accountName : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${platform.connected ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: any, isLoading: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 rounded-md bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
