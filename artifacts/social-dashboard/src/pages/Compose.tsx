import { useState } from "react";
import { useCreatePost, useListPlatforms } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PLATFORM_ICONS, PLATFORM_COLORS } from "@/lib/constants";
import { Send, Clock, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Compose() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: platforms } = useListPlatforms();
  const createPost = useCreatePost();

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const connectedPlatforms = (Array.isArray(platforms) ? platforms : []).filter((p) => p.connected)

  const handleTogglePlatform = (name: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({ title: "Error", description: "Content cannot be empty", variant: "destructive" });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({ title: "Error", description: "Select at least one platform", variant: "destructive" });
      return;
    }
    if (isScheduled && !scheduledAt) {
      toast({ title: "Error", description: "Select a schedule date and time", variant: "destructive" });
      return;
    }

    createPost.mutate(
      {
        data: {
          content,
          platforms: selectedPlatforms,
          mediaUrl: mediaUrl || undefined,
          scheduledAt: isScheduled ? new Date(scheduledAt).toISOString() : undefined,
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Post saved successfully" });
          setLocation("/posts");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Compose Post</h1>
        <p className="text-muted-foreground mt-1">Create and schedule content across your platforms.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Publish To</CardTitle>
            <div className="flex flex-wrap gap-4 mt-4">
              {connectedPlatforms.length === 0 && (
                <p className="text-sm text-muted-foreground">No platforms connected. Go to Settings to connect.</p>
              )}
              {connectedPlatforms.map((platform) => {
                const Icon = PLATFORM_ICONS[platform.name as keyof typeof PLATFORM_ICONS];
                const isSelected = selectedPlatforms.includes(platform.name);
                return (
                  <button
                    key={platform.name}
                    type="button"
                    onClick={() => handleTogglePlatform(platform.name)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all",
                      isSelected ? "border-primary bg-primary/10 ring-1 ring-primary/50" : "bg-card hover:bg-secondary border-border"
                    )}
                  >
                    {Icon && <Icon className="w-5 h-5" style={{ color: isSelected ? PLATFORM_COLORS[platform.name as keyof typeof PLATFORM_COLORS] : 'currentColor' }} />}
                    <span className="font-medium text-sm">{platform.displayName}</span>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                className="min-h-[160px] text-base resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Supports plain text and URLs</span>
                <span>{content.length} characters</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="media" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Media URL (optional)
              </Label>
              <Input
                id="media"
                placeholder="https://example.com/image.png"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              {mediaUrl && (
                <div className="mt-4 rounded-md overflow-hidden border border-border h-48 bg-secondary flex items-center justify-center">
                  <img src={mediaUrl} alt="Preview" className="max-h-full max-w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="schedule" 
                  checked={isScheduled} 
                  onCheckedChange={(c) => setIsScheduled(c as boolean)} 
                />
                <Label htmlFor="schedule" className="font-medium cursor-pointer">Schedule for later</Label>
              </div>

              {isScheduled && (
                <div className="pl-6 animate-in slide-in-from-top-2">
                  <Label htmlFor="scheduledAt" className="mb-2 block">Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    className="w-full md:max-w-xs"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="justify-end border-t p-6 bg-secondary/10">
            <Button 
              type="submit" 
              size="lg"
              disabled={createPost.isPending || selectedPlatforms.length === 0 || !content.trim()}
              className="gap-2 font-bold"
            >
              {createPost.isPending ? (
                "Processing..."
              ) : isScheduled ? (
                <><Clock className="w-4 h-4" /> Schedule Post</>
              ) : (
                <><Send className="w-4 h-4" /> Publish Now</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
