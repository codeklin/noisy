
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import SubscriptionSection from "@/components/SubscriptionSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#f8e1eb] via-[#f0f4ff] to-[#e6f7ff]">
        {/* Background dots pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(#FF3B45_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#0B2D93_1.5px,transparent_1.5px)] [background-size:30px_30px]"></div>
        </div>
        <HeroSection />
        <FeaturesSection />
        <SubscriptionSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
