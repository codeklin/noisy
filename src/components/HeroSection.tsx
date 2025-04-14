
import React from 'react';
import { Calendar, Facebook, Twitter, Linkedin, Sparkles } from 'lucide-react';
import TooltipWrapper from './TooltipWrapper';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroSection = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-10 md:pt-16 pb-16 md:pb-24">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(#9b87f5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      
      <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 space-y-4 md:space-y-6 text-center lg:text-left animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-br from-primary to-brand-blue bg-clip-text text-transparent">
                Content
              </span>
              <span className="text-foreground">
                Crafter
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mt-2 md:mt-4 max-w-lg mx-auto lg:mx-0">
              Create engaging social media content for an entire month in just minutes
            </p>
            
            <div className="pt-3 md:pt-4 flex flex-wrap gap-3 justify-center lg:justify-start items-center">
              {isMobile ? (
                <>
                  <span className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                    <Facebook className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </span>
                  <span className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                    <Twitter className="h-5 w-5 md:h-6 md:w-6 text-sky-400" />
                  </span>
                  <span className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                    <Linkedin className="h-5 w-5 md:h-6 md:w-6 text-blue-800" />
                  </span>
                  <span className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6 text-brand-purple" />
                  </span>
                </>
              ) : (
                <>
                  <TooltipWrapper>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                          <Facebook className="h-6 w-6 text-blue-600" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Facebook Posts</TooltipContent>
                    </Tooltip>
                  </TooltipWrapper>
                  
                  <TooltipWrapper>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                          <Twitter className="h-6 w-6 text-sky-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Twitter Posts</TooltipContent>
                    </Tooltip>
                  </TooltipWrapper>
                  
                  <TooltipWrapper>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                          <Linkedin className="h-6 w-6 text-blue-800" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>LinkedIn Posts</TooltipContent>
                    </Tooltip>
                  </TooltipWrapper>
                  
                  <TooltipWrapper>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                          <Calendar className="h-6 w-6 text-brand-purple" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>30-Day Calendar</TooltipContent>
                    </Tooltip>
                  </TooltipWrapper>
                </>
              )}
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="w-full lg:w-1/2 relative animate-fade-in mt-8 lg:mt-0">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue opacity-30 blur"></div>
              <div className="relative rounded-2xl bg-card p-3 md:p-4 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1586798271654-0471bb1b0517?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Young woman typing on a smartphone"
                  className="w-full h-auto rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                />
                <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-card rounded-full p-2 md:p-3 shadow-lg border border-border">
                  <span className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="h-5 w-5 md:h-7 md:w-7" />
                  </span>
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
