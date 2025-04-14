
import React from 'react';
import { Calendar, Facebook, Twitter, Linkedin } from 'lucide-react';
import TooltipWrapper from './TooltipWrapper';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-16 pb-24">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(#9b87f5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      
      <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-br from-primary to-brand-blue bg-clip-text text-transparent">
                Content
              </span>
              <span className="text-foreground">
                Crafter
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mt-4 max-w-lg mx-auto lg:mx-0">
              Create engaging social media content for an entire month in just minutes
            </p>
            
            <div className="pt-4 flex flex-wrap gap-3 justify-center lg:justify-start items-center">
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
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="w-full lg:w-1/2 relative animate-fade-in">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue opacity-30 blur"></div>
              <div className="relative rounded-2xl bg-card p-4 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Social Media Content Planning"
                  className="w-full h-auto rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-card rounded-full p-3 shadow-lg border border-border">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="h-7 w-7" />
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
