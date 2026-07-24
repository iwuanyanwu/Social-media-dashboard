import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPlatformBreakdown, useListAnalytics } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PLATFORM_ICONS, PLATFORM_COLORS } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { data: breakdown, isLoading: isLoadingBreakdown } = useGetPlatformBreakdown();
  const { data: analyticsList, isLoading: isLoadingList } = useListAnalytics();

  // Prepare data for chart
  const chartData = breakdown?.map(item => ({
    name: item.platform,
    likes: item.likes,
    comments: item.comments,
    shares: item.shares,
    reach: item.reach,
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Measure your performance across all channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Engagement by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBreakdown ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Bar dataKey="likes" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="comments" stackId="a" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="shares" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Reach vs Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBreakdown ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="reach" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <div className="space-y-4">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Platform</TableHead>
                  <TableHead>Post ID</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Reach</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsList?.map((item) => {
                  const Icon = PLATFORM_ICONS[item.platform as keyof typeof PLATFORM_ICONS];
                  return (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="font-medium flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4" style={{ color: PLATFORM_COLORS[item.platform as keyof typeof PLATFORM_COLORS] }} />}
                        <span className="capitalize">{item.platform}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">#{item.postId}</TableCell>
                      <TableCell className="text-right">{item.likes.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.comments.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.shares.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{item.reach.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
