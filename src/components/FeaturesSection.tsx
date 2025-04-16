import React from 'react';
import { Zap, TrendingUp, Clock, Target, Award } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-12 md:py-16 bg-[#1a1e3a]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white">
          Create Content That Converts
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-[#FF6B6B]" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">AI-Powered Content</h3>
            <p className="text-sm text-gray-300">Generate engaging posts with advanced AI technology</p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#6E5DC6]/20 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-[#6E5DC6]" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Viral Strategies</h3>
            <p className="text-sm text-gray-300">Implement proven tactics that boost engagement</p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-[#4ECDC4]" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Save Hours Weekly</h3>
            <p className="text-sm text-gray-300">Create a month of content in minutes, not days</p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#FFD166]/20 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-[#FFD166]" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Targeted Messaging</h3>
            <p className="text-sm text-gray-300">Customize content for your specific audience</p>
          </div>

          {/* Feature 5 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Premium Results</h3>
            <p className="text-sm text-gray-300">Get professional-quality content every time</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
