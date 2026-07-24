import { useState } from "react";
import { useListPlatforms, useConnectPlatform, useDisconnectPlatform, getListPlatformsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLATFORM_ICONS, PLATFORM_COLORS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, Unlink2, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { data: platforms, isLoading } = useListPlatforms();
  const connectPlatform = useConnectPlatform();
  const disconnectPlatform = useDisconnectPlatform();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [accountInput, setAccountInput] = useState("");

  const handleConnect = (name: string) => {
    if (!tokenInput) {
      toast({ title: "Error", description: "Access token is required", variant: "destructive" });
      return;
    }

    connectPlatform.mutate({
      name: name as any,
      data: {
        accessToken: tokenInput,
        accountName: accountInput || undefined
      }
    }, {
      onSuccess: () => {
        toast({ title: "Connected", description: `Successfully connected to ${name}` });
        setConnectingTo(null);
        setTokenInput("");
        setAccountInput("");
        queryClient.invalidateQueries({ queryKey: getListPlatformsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to connect platform", variant: "destructive" });
      }
    });
  };

  const handleDisconnect = (name: string) => {
    disconnectPlatform.mutate({ name: name as any }, {
      onSuccess: () => {
        toast({ title: "Disconnected", description: `Successfully disconnected from ${name}` });
        queryClient.invalidateQueries({ queryKey: getListPlatformsQueryKey() });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1">Connect and manage your social media accounts.</p>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="w-full h-[200px]" />)
        ) : (
          platforms?.map(platform => {
            const Icon = PLATFORM_ICONS[platform.name as keyof typeof PLATFORM_ICONS];
            const isConnecting = connectingTo === platform.name;

            return (
              <Card key={platform.name} className={`overflow-hidden transition-all duration-300 ${platform.connected ? 'border-primary/50 bg-primary/5' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: PLATFORM_COLORS[platform.name as keyof typeof PLATFORM_COLORS] }}
                      >
                        {Icon && <Icon className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{platform.displayName}</CardTitle>
                        <CardDescription className="mt-1">
                          {platform.connected ? (
                            <span className="flex items-center gap-1.5 text-green-500 font-medium">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                              Connected as {platform.accountName}
                            </span>
                          ) : (
                            "Not connected"
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div>
                      {platform.connected ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDisconnect(platform.name)}
                          disabled={disconnectPlatform.isPending}
                        >
                          <Unlink2 className="w-4 h-4 mr-2" /> Disconnect
                        </Button>
                      ) : (
                        <Button 
                          variant={isConnecting ? "secondary" : "default"}
                          size="sm"
                          onClick={() => {
                            setConnectingTo(isConnecting ? null : platform.name);
                            setTokenInput("");
                            setAccountInput("");
                          }}
                        >
                          {isConnecting ? "Cancel" : <><Link2 className="w-4 h-4 mr-2" /> Connect API</>}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isConnecting && (
                  <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 fade-in">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`token-${platform.name}`} className="flex items-center gap-2">
                          <Lock className="w-3 h-3 text-muted-foreground" /> Access Token (Required)
                        </Label>
                        <Input 
                          id={`token-${platform.name}`}
                          type="password"
                          placeholder={`Paste your ${platform.displayName} API token here`}
                          value={tokenInput}
                          onChange={e => setTokenInput(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`account-${platform.name}`}>Account Name (Optional)</Label>
                        <Input 
                          id={`account-${platform.name}`}
                          placeholder="e.g. @MyBrand"
                          value={accountInput}
                          onChange={e => setAccountInput(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button 
                          onClick={() => handleConnect(platform.name)}
                          disabled={connectPlatform.isPending || !tokenInput}
                        >
                          {connectPlatform.isPending ? "Connecting..." : "Save Connection"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
