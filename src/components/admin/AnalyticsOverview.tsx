import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsData {
  pageViews: {
    page: string;
    count: number;
  }[];
  contentGeneration: {
    type: string;
    count: number;
    success_rate: number;
  }[];
  userActions: {
    action: string;
    count: number;
  }[];
  errors: {
    type: string;
    count: number;
  }[];
  userGrowth: {
    date: string;
    count: number;
  }[];
}

const AnalyticsOverview = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    pageViews: [],
    contentGeneration: [],
    userActions: [],
    errors: [],
    userGrowth: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week" | "day">("month");

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Define the time range based on the selected timeframe
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === "day") {
        startDate.setDate(now.getDate() - 1);
      } else if (timeframe === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === "month") {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        // For "all", go back 6 months by default for charts
        startDate.setMonth(now.getMonth() - 6);
      }
      
      const startDateStr = startDate.toISOString();

      // Fetch page views
      const { data: pageViewsData, error: pageViewsError } = await supabase
        .from("analytics_events")
        .select("event_name, count")
        .eq("event_type", "page_view")
        .gte("created_at", startDateStr)
        .order("count", { ascending: false })
        .limit(10);

      if (pageViewsError) throw pageViewsError;

      // Fetch content generation stats
      const { data: contentGenData, error: contentGenError } = await supabase
        .from("analytics_events")
        .select("event_name, details, success_count, total_count")
        .eq("event_type", "content_generation")
        .gte("created_at", startDateStr)
        .order("total_count", { ascending: false })
        .limit(5);

      if (contentGenError) throw contentGenError;

      // Fetch user actions
      const { data: userActionsData, error: userActionsError } = await supabase
        .from("analytics_events")
        .select("event_name, count")
        .eq("event_type", "user_action")
        .gte("created_at", startDateStr)
        .order("count", { ascending: false })
        .limit(10);

      if (userActionsError) throw userActionsError;

      // Fetch errors
      const { data: errorsData, error: errorsError } = await supabase
        .from("analytics_events")
        .select("event_name, count")
        .eq("event_type", "error")
        .gte("created_at", startDateStr)
        .order("count", { ascending: false })
        .limit(10);

      if (errorsError) throw errorsError;

      // Fetch user growth over time
      const { data: userGrowthData, error: userGrowthError } = await supabase
        .from("user_growth")
        .select("date, count")
        .gte("date", startDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (userGrowthError) throw userGrowthError;

      // Format the data
      const pageViews = pageViewsData.map((item) => ({
        page: item.event_name,
        count: item.count,
      }));

      const contentGeneration = contentGenData.map((item) => ({
        type: item.event_name,
        count: item.total_count || 0,
        success_rate: item.total_count ? (item.success_count / item.total_count) * 100 : 0,
      }));

      const userActions = userActionsData.map((item) => ({
        action: item.event_name,
        count: item.count,
      }));

      const errors = errorsData.map((item) => ({
        type: item.event_name,
        count: item.count,
      }));

      const userGrowth = userGrowthData.map((item) => ({
        date: new Date(item.date).toLocaleDateString(),
        count: item.count,
      }));

      setAnalytics({
        pageViews,
        contentGeneration,
        userActions,
        errors,
        userGrowth,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <div className="flex items-center gap-2">
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
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
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Top Pages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics.pageViews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No page view data available
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.pageViews.slice(0, 5).map((view, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{view.page}</span>
                        <span className="text-sm text-muted-foreground">{view.count} views</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{
                            width: `${(view.count / analytics.pageViews[0].count) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Content Generation</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics.contentGeneration.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No content generation data available
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.contentGeneration.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.type}</span>
                      <span className="text-sm text-muted-foreground">{item.count} generations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`rounded-full h-2 ${
                            item.success_rate > 80
                              ? "bg-green-500"
                              : item.success_rate > 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${item.success_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">
                        {item.success_rate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">User Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics.userGrowth.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No user growth data available
              </div>
            ) : (
              <div className="h-[200px] flex items-end gap-1">
                {analytics.userGrowth.map((item, index) => {
                  const maxCount = Math.max(...analytics.userGrowth.map(g => g.count));
                  const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-primary/80 rounded-t-sm" 
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                        {item.date.split('/').slice(0, 2).join('/')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Common Errors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics.errors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No error data available
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{error.type}</span>
                        <span className="text-sm text-muted-foreground">{error.count} occurrences</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 rounded-full h-2"
                          style={{
                            width: `${(error.count / analytics.errors[0].count) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
