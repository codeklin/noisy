
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ContentPlanItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function SavedContentPlans() {
  const [contentPlans, setContentPlans] = useState<ContentPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadContentPlans();
    }
  }, [user, loadContentPlans]);

  const loadContentPlans = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("content_plans")
        .select("id, name, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setContentPlans(data as ContentPlanItem[]);
    } catch (error) {
      console.error("Error loading content plans:", error);
      toast.error("Failed to load your saved content plans");
    } finally {
      setIsLoading(false);
    }
  }, [user, setContentPlans, setIsLoading]);

  const handleDeletePlan = async (id: string) => {
    if (!user) return;

    setIsDeleting(prev => ({ ...prev, [id]: true }));

    try {
      const { error } = await supabase
        .from("content_plans")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setContentPlans(prev => prev.filter(plan => plan.id !== id));
      toast.success("Content plan deleted successfully");
    } catch (error) {
      console.error("Error deleting content plan:", error);
      toast.error("Failed to delete content plan");
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6E5DC6]" />
      </div>
    );
  }

  if (contentPlans.length === 0) {
    return (
      <Card className="border-dashed border-gray-300 bg-gray-50/50">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-gray-500 mb-4 text-center">You don't have any saved content plans yet.</p>
          <Button onClick={() => navigate("/")}>Create a Content Plan</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {contentPlans.map((plan) => (
        <Card key={plan.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle className="line-clamp-1">{plan.name}</CardTitle>
            <CardDescription>
              Updated {formatDate(plan.updated_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Created {formatDate(plan.created_at)}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between gap-2 bg-gray-50/50 border-t py-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/plan/${plan.id}`)}
            >
              View
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleDeletePlan(plan.id)}
              disabled={isDeleting[plan.id]}
            >
              {isDeleting[plan.id] ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
