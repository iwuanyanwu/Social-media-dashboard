import { useState } from "react";
import { useListPosts, useDeletePost, usePublishPost, getListPostsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLATFORM_ICONS, STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { Trash2, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Posts() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: posts, isLoading } = useListPosts(
    statusFilter !== "all" ? { status: statusFilter as any } : {}
  );

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deletePost = useDeletePost();
  const publishPost = usePublishPost();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Deleted", description: "Post removed" });
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        }
      });
    }
  };

  const handlePublish = (id: number) => {
    publishPost.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Published", description: "Post published successfully" });
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to publish post", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your drafts, scheduled, and published content.</p>
        </div>
        
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-5 w-full md:w-[500px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6 flex gap-4">
                <Skeleton className="w-16 h-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : posts?.length === 0 ? (
          <div className="text-center py-24 border border-dashed rounded-lg bg-card/50">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No posts found</h3>
            <p className="text-muted-foreground mt-1">Try changing your filters or create a new post.</p>
          </div>
        ) : (
          posts?.map(post => (
            <Card key={post.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
              <CardContent className="p-0 flex flex-col md:flex-row">
                {post.mediaUrl && (
                  <div className="w-full md:w-48 h-48 md:h-auto bg-secondary shrink-0 overflow-hidden">
                    <img src={post.mediaUrl} alt="Media" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        {post.platforms.map(p => {
                          const Icon = PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS];
                          return Icon ? (
                            <div key={p} className="p-1.5 rounded bg-secondary text-foreground">
                              <Icon className="w-4 h-4" />
                            </div>
                          ) : null;
                        })}
                      </div>
                      <Badge variant="outline" className={STATUS_COLORS[post.status]}>
                        {post.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm line-clamp-3 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    
                    {post.errorMessage && post.status === 'failed' && (
                      <div className="p-3 bg-red-500/10 text-red-500 text-xs rounded mb-4 border border-red-500/20">
                        Error: {post.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {post.status === 'scheduled' ? (
                        <><Clock className="w-3 h-3" /> Scheduled for {post.scheduledAt ? format(new Date(post.scheduledAt), "PPp") : ''}</>
                      ) : post.status === 'published' ? (
                        <><CheckCircle2 className="w-3 h-3" /> Published on {post.publishedAt ? format(new Date(post.publishedAt), "PPp") : ''}</>
                      ) : (
                        <><Clock className="w-3 h-3" /> Last updated {format(new Date(post.updatedAt || post.createdAt), "PPp")}</>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {post.status !== 'published' && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handlePublish(post.id)}
                          disabled={publishPost.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" /> Publish Now
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-9 w-9"
                        onClick={() => handleDelete(post.id)}
                        disabled={deletePost.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
