import { useState } from "react";
import { useGetCalendarPosts } from "@workspace/api-client-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PLATFORM_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: posts, isLoading } = useGetCalendarPosts({ year, month });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start on Sunday
  
  const endDate = new Date(monthEnd);
  if (endDate.getDay() !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
  }

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Plan and visualize your social media schedule.</p>
        </div>
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-lg border">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-lg min-w-[140px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-card/50">
        <div className="grid grid-cols-7 border-b shrink-0 bg-secondary/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-7 grid-rows-5 auto-rows-[minmax(120px,1fr)]">
          {calendarDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            // Get posts for this day based on scheduledAt or publishedAt
            const dayPosts = posts?.filter(p => {
              const postDateStr = p.scheduledAt || p.publishedAt || p.createdAt;
              const postDate = new Date(postDateStr);
              return isSameDay(postDate, day);
            }) || [];

            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "border-b border-r p-2 flex flex-col gap-1 transition-colors hover:bg-muted/30",
                  !isCurrentMonth && "bg-secondary/20 text-muted-foreground",
                  i % 7 === 6 && "border-r-0"
                )}
              >
                <div className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                  isToday && "bg-primary text-primary-foreground"
                )}>
                  {format(day, "d")}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {!isLoading && dayPosts.map(post => (
                    <div 
                      key={post.id} 
                      className={cn(
                        "text-xs p-1.5 rounded border border-border/50 truncate cursor-pointer group flex items-center gap-1.5",
                        post.status === 'published' ? "bg-card" : "bg-card/50 opacity-80"
                      )}
                      title={post.content}
                    >
                      <div className="flex gap-0.5 shrink-0">
                        {post.platforms.map(p => (
                          <div 
                            key={p} 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: PLATFORM_COLORS[p as keyof typeof PLATFORM_COLORS] || 'gray' }}
                          />
                        ))}
                      </div>
                      <span className="truncate group-hover:text-primary transition-colors">{post.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
