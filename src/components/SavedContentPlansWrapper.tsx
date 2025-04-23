import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SavedContentPlans from "./SavedContentPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import ErrorBoundary from "./ErrorBoundary";

export default function SavedContentPlansWrapper() {
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  if (hasError) {
    return (
      <Card className="border-dashed border-red-300 bg-red-50/50">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h3>
          <p className="text-gray-700 mb-4 text-center">We encountered an error loading your saved content plans.</p>
          <div className="flex gap-4">
            <Button onClick={() => setHasError(false)}>Try Again</Button>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <Card className="border-dashed border-red-300 bg-red-50/50">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h3>
            <p className="text-gray-700 mb-4 text-center">We encountered an error loading your saved content plans.</p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <SavedContentPlans />
    </ErrorBoundary>
  );
}
