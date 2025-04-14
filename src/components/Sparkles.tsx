
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRandomInterval } from '@/hooks/use-random-interval';

interface SparkleProps {
  color: string;
  size: number;
  style: React.CSSProperties;
}

const Sparkle = ({ color, size, style }: SparkleProps) => {
  return (
    <motion.span
      className="absolute block"
      style={{
        ...style,
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.6 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M80 0C80 0 84.5 20.5 98 34C111.5 47.5 132 52 132 52C132 52 111.5 56.5 98 70C84.5 83.5 80 104 80 104C80 104 75.5 83.5 62 70C48.5 56.5 28 52 28 52C28 52 48.5 47.5 62 34C75.5 20.5 80 0 80 0Z"
          fill={color}
        />
      </svg>
    </motion.span>
  );
};

interface SparklesProps {
  children: React.ReactNode;
  color?: string;
  variance?: number;
  minSize?: number;
  maxSize?: number;
  minDelay?: number;
  maxDelay?: number;
  isActive?: boolean;
}

const Sparkles = ({
  children,
  color = 'hsl(var(--primary))',
  variance = 100,
  minSize = 10,
  maxSize = 20,
  minDelay = 600,
  maxDelay = 2000,
  isActive = true,
}: SparklesProps) => {
  const [sparkles, setSparkles] = useState<Array<{ id: string; color: string; size: number; style: React.CSSProperties }>>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  useRandomInterval(
    () => {
      if (!dimensions || !isActive) return;

      const sparkle = generateSparkle({
        color,
        minSize,
        maxSize,
        dimensions,
        variance,
      });

      setSparkles(sparkles => [...sparkles, sparkle]);
      
      setTimeout(() => {
        setSparkles(sparkles => sparkles.filter(s => s.id !== sparkle.id));
      }, 600);
    },
    isActive ? minDelay : null,
    isActive ? maxDelay : null,
  );

  return (
    <div ref={ref} className="relative inline-block">
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <Sparkle
            key={sparkle.id}
            color={sparkle.color}
            size={sparkle.size}
            style={sparkle.style}
          />
        ))}
      </AnimatePresence>
      <div className="relative">{children}</div>
    </div>
  );
};

// Helper functions
const generateSparkle = ({
  color,
  minSize,
  maxSize,
  dimensions,
  variance,
}: {
  color: string;
  minSize: number;
  maxSize: number;
  dimensions: { width: number; height: number };
  variance: number;
}) => {
  const size = random(minSize, maxSize);
  return {
    id: String(random(10000, 99999)),
    color,
    size,
    style: {
      top: random(-variance, dimensions.height + variance),
      left: random(-variance, dimensions.width + variance),
      zIndex: 2,
    },
  };
};

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

export default Sparkles;
