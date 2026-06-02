import React from 'react';

interface SparklineProps {
  data: number[]; // e.g., [1.2, 1.5, 1.1, 0.9, 2.0]
  color?: string; // Tailwind text color class, e.g., 'text-blue-500'
  className?: string;
}

export function Sparkline({ data, color = 'text-blue-500', className = '' }: SparklineProps) {
  if (!data || data.length < 2) {
    return <div className="h-8 flex items-center justify-center opacity-30 text-xs">No trend data</div>;
  }

  // Filter out nulls
  const validData = data.filter(d => d !== null && d !== undefined);
  if (validData.length < 2) {
     return <div className="h-8 flex items-center justify-center opacity-30 text-xs">Not enough data</div>;
  }

  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const range = max - min === 0 ? 1 : max - min;
  
  const width = 100;
  const height = 30;
  const padding = 2;
  
  const stepX = width / (validData.length - 1);
  
  const points = validData.map((val, i) => {
    const x = i * stepX;
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  // Extract pure color from text class for SVG stroke if possible, or just use currentColor
  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      className={`w-full h-10 ${color} ${className}`} 
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
