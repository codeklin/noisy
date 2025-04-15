
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroSection = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F4FF] to-background pt-10 md:pt-16 pb-16 md:pb-24">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(#6E5DC6_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      
      <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 space-y-4 md:space-y-6 text-center lg:text-left animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-[#6E5DC6]">
                post
              </span>
              <span className="text-[#FF6B6B]">
                it
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mt-2 md:mt-4 max-w-lg mx-auto lg:mx-0">
              Create engaging social media content for an entire month in just minutes
            </p>
            
            <div className="pt-3 md:pt-4 flex flex-wrap gap-3 justify-center lg:justify-start items-center">
              <div className="flex flex-wrap gap-3 justify-center w-full lg:justify-start">
                <span className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-[#F5F4FF]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="#6E5DC6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 9H2V21H6V9Z" stroke="#6E5DC6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="#6E5DC6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-[#F5F4FF]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005Z" stroke="#6E5DC6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-[#F5F4FF]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="#6E5DC6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="w-full lg:w-1/2 relative animate-fade-in mt-8 lg:mt-0">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#6E5DC6] to-[#FF6B6B] opacity-30 blur"></div>
              <div className="relative rounded-2xl bg-card p-3 md:p-4 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1671418285905-acc08f6c4b59?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Young woman typing on a smartphone"
                  className="w-full h-auto rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
