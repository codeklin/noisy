
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock } from 'lucide-react';

const HeroSection = () => {
  const isMobile = useIsMobile();
  const [currentPhrase, setCurrentPhrase] = useState(0);

  const phrases = [
    "Stop scrolling. Start converting.",
    "Turn followers into customers.",
    "Content that sells while you sleep.",
    "From viral posts to real results."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1e3a] via-[#16213e] to-[#0f3460] pt-10 md:pt-14 pb-16 md:pb-24 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6E5DC6]/20 via-transparent to-[#FF6B6B]/20 animate-gradient-xy"></div>

      <div className="container relative z-10 max-w-7xl my-5 mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 text-center lg:text-left animate-fade-in">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                <div key={currentPhrase} className="animate-fade-in text-white">
                  {phrases[currentPhrase]}
                </div>
              </h1>
            </div>

            <div>
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="text-[#FF6B6B] font-bold text-xl">Post</span>
                <span className="text-[#6E5DC6] font-bold text-xl">it</span>
                <span className="bg-gradient-to-r from-[#6E5DC6] to-[#FF6B6B] px-3 py-1 rounded-full text-xs font-semibold text-white">AI-Powered</span>
              </div>
            </div>

            <p className="text-lg md:text-xl text-gray-300 max-w-lg mx-auto lg:mx-0 animate-fade-in">
              Create viral, engaging social media content that converts followers into customers - in minutes, not hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mt-8 animate-fade-in">
              <Link to="/viral-content">
                <Button className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF8E53] hover:to-[#FF6B6B] text-white border-0 shadow-lg gap-2 px-6 py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                  <Sparkles className="h-5 w-5" />
                  Create Viral Content
                </Button>
              </Link>

              <Link to="/">
                <Button variant="outline" className="border-white hover:bg-white/10 gap-2 px-6 py-6 text-lg font-semibold transition-all duration-300">
                  <Clock className="h-5 w-5 text-[#4ECDC4]" />
                  <span className="text-[#4ECDC4]">Try Free Demo</span>
                </Button>
              </Link>
            </div>


          </div>

          {/* Right Content - Hero Image */}
          <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0 animate-fade-in">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#6E5DC6] to-[#FF6B6B] opacity-50 blur-md animate-pulse"></div>
              <div className="relative rounded-2xl bg-[#1a1a2e]/80 p-3 md:p-4 shadow-2xl border border-white/10">
                <img
                  src="/hero-image.jpeg"
                  alt="Viral Creator"
                  className="w-full h-auto rounded-lg shadow-md transition-all duration-300 hover:shadow-lg object-cover"
                />

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce-slow">
                  Viral Content
                </div>

                <div className="absolute -bottom-4 -left-4 bg-[#6E5DC6] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce-slow">
                  AI-Powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
