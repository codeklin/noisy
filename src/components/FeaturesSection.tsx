import React from 'react';
import { Zap, TrendingUp, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };
  return (
    <motion.section
      className="py-6 md:py-10 bg-[#F48FB1]/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <motion.h2
          className="text-lg md:text-xl font-bold text-center mb-5 text-[#1a1e3a]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Create Content That Converts
        </motion.h2>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Feature 1 */}
          <motion.div
            className="flex flex-col items-center text-center"
            variants={itemVariants}
          >
            <motion.div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center mb-3"
              variants={iconVariants}
              whileHover="hover"
            >
              <Zap className="h-6 w-6 md:h-7 md:w-7 text-[#FF6B6B]" />
            </motion.div>
            <motion.h3
              className="text-base font-semibold mb-1 text-[#1a1e3a]"
              variants={itemVariants}
            >
              AI-Powered Content
            </motion.h3>
            <motion.p
              className="text-[10px] md:text-xs text-[#1a1e3a]/80"
              variants={itemVariants}
            >
              Generate engaging posts with advanced AI technology
            </motion.p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="flex flex-col items-center text-center"
            variants={itemVariants}
          >
            <motion.div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#6E5DC6]/20 flex items-center justify-center mb-3"
              variants={iconVariants}
              whileHover="hover"
            >
              <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-[#6E5DC6]" />
            </motion.div>
            <motion.h3
              className="text-base font-semibold mb-1 text-[#1a1e3a]"
              variants={itemVariants}
            >
              Viral Strategies
            </motion.h3>
            <motion.p
              className="text-[10px] md:text-xs text-[#1a1e3a]/80"
              variants={itemVariants}
            >
              Implement proven tactics that boost engagement
            </motion.p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="flex flex-col items-center text-center"
            variants={itemVariants}
          >
            <motion.div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center mb-3"
              variants={iconVariants}
              whileHover="hover"
            >
              <Clock className="h-6 w-6 md:h-7 md:w-7 text-[#4ECDC4]" />
            </motion.div>
            <motion.h3
              className="text-base font-semibold mb-1 text-[#1a1e3a]"
              variants={itemVariants}
            >
              Save Hours Weekly
            </motion.h3>
            <motion.p
              className="text-[10px] md:text-xs text-[#1a1e3a]/80"
              variants={itemVariants}
            >
              Create a month of content in minutes, not days
            </motion.p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="flex flex-col items-center text-center"
            variants={itemVariants}
          >
            <motion.div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1a1e3a]/20 flex items-center justify-center mb-3"
              variants={iconVariants}
              whileHover="hover"
            >
              <Award className="h-6 w-6 md:h-7 md:w-7 text-[#1a1e3a]" />
            </motion.div>
            <motion.h3
              className="text-base font-semibold mb-1 text-[#1a1e3a]"
              variants={itemVariants}
            >
              Premium Results
            </motion.h3>
            <motion.p
              className="text-[10px] md:text-xs text-[#1a1e3a]/80"
              variants={itemVariants}
            >
              Get professional-quality content every time
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;
