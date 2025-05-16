import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Search, Filter, FileText, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ActivityEvent {
  id: number;
  user_id: string;
  user_email: string;
  action: string;
  details: any;
  created_at: string;
}

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week" | "day">("all");

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build the query
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply timeframe filter
      if (timeframe !== "all") {
        const now = new Date();
        const startDate = new Date();

        if (timeframe === "day") {
          startDate.setDate(now.getDate() - 1);
        } else if (timeframe === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (timeframe === "month") {
          startDate.setMonth(now.getMonth() - 1);
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      // Apply action filter if not "all"
      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Get user emails
      const userIds = data
        .map(activity => activity.user_id)
        .filter(Boolean);

      const userEmailMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        if (usersError) throw usersError;

        // Create a map of user IDs to emails
        users.forEach(user => {
          userEmailMap[user.id] = user.email || 'Unknown';
        });
      }

      // Format the activities
      const formattedActivities = data.map((activity) => ({
        id: activity.id,
        user_id: activity.user_id,
        user_email: activity.user_id ? (userEmailMap[activity.user_id] || "Unknown") : "System",
        action: activity.action,
        details: activity.details || {},
        created_at: new Date(activity.created_at).toLocaleString(),
      }));

      setActivities(formattedActivities);
      setFilteredActivities(formattedActivities);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to fetch activity logs");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setActivities, setFilteredActivities, timeframe, actionFilter]);

  useEffect(() => {
    fetchActivities();
  }, [timeframe, actionFilter, fetchActivities]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = activities.filter(
        (activity) =>
          activity.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (activity.details &&
            JSON.stringify(activity.details).toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredActivities(filtered);
    } else {
      setFilteredActivities(activities);
    }
  }, [searchQuery, activities]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case "content_generation":
      case "generate":
      case "content":
        return <Badge className="bg-green-500">Content</Badge>;
      case "user_action":
      case "action":
        return <Badge className="bg-blue-500">Action</Badge>;
      case "page_view":
      case "view":
        return <Badge className="bg-gray-500">View</Badge>;
      case "error":
        return <Badge className="bg-red-500">Error</Badge>;
      case "auth":
      case "login":
      case "signup":
        return <Badge className="bg-purple-500">Auth</Badge>;
      case "payment":
        return <Badge className="bg-yellow-500">Payment</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={timeframe} onValueChange={(value: string) => setTimeframe(value as "all" | "month" | "week" | "day")}>
            <TabsList>
              <TabsTrigger value="all">All Time</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchActivities}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Activities</CardTitle>
          <CardDescription>
            Track user interactions and system events
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Select
              value={actionFilter}
              onValueChange={setActionFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="content">Content Generation</SelectItem>
                <SelectItem value="action">User Actions</SelectItem>
                <SelectItem value="view">Page Views</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="login">Authentication</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found for the selected filters
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      {activity.action.toLowerCase().includes("content") ? (
                        <FileText className="h-4 w-4 text-primary" />
                      ) : (
                        <Zap className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{activity.action}</p>
                        {getActionBadge(activity.action)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activity.user_email} • {activity.created_at}
                      </p>
                      {activity.details && (
                        <div className="mt-1 text-xs bg-muted p-2 rounded-md max-w-full overflow-x-auto">
                          <pre className="whitespace-pre-wrap break-words">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;
