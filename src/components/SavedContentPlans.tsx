
import { useState, useEffect } from "react";
import { useContentPlan } from "@/hooks/useContentPlan";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LoaderCircle, Edit, Trash, Calendar, FileText, ExternalLink } from "lucide-react";

interface ContentPlanItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  brand_info: any;
  posts: any[];
}

export default function SavedContentPlans() {
  const [plans, setPlans] = useState<ContentPlanItem[]>([]);
  const { getUserContentPlans, deleteContentPlan, isLoading } = useContentPlan();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const userPlans = await getUserContentPlans();
    setPlans(userPlans);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this content plan?")) {
      const success = await deleteContentPlan(id);
      if (success) {
        setPlans(plans.filter(plan => plan.id !== id));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No saved content plans</h3>
        <p className="text-muted-foreground mb-4">
          When you save content plans, they'll appear here.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Generate New Content
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {plans.map(plan => (
        <Card key={plan.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="truncate">{plan.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(plan.created_at), "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {plan.posts.length} posts
              </span>
              <span>
                {plan.posts.filter(p => p.platform === "facebook").length} FB, 
                {plan.posts.filter(p => p.platform === "twitter").length} TW, 
                {plan.posts.filter(p => p.platform === "linkedin").length} LI
              </span>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(plan.id)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              size="sm"
              onClick={() => window.location.href = `/plan/${plan.id}`}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
