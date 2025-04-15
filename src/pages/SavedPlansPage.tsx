
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SavedContentPlans from "@/components/SavedContentPlans";

export default function SavedPlansPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F4FF]/30 py-10">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#6E5DC6] mb-6">Your Saved Content Plans</h1>
          <SavedContentPlans />
        </div>
      </main>
      <Footer />
    </div>
  );
}
