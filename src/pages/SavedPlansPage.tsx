
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SavedContentPlansWrapper from "@/components/SavedContentPlansWrapper";

export default function SavedPlansPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Add this to ensure Router context is properly accessed

  // Add error handling
  useEffect(() => {
    try {
      if (!isLoading && !user) {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F4FF]/30 py-10">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#6E5DC6] mb-6">Your Saved Content Plans</h1>
          <SavedContentPlansWrapper />
        </div>
      </main>
      <Footer />
    </div>
  );
}
