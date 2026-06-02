'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type CompareRadarChartProps = {
  country1Name: string;
  country2Name: string;
  data: any[];
};

export default function CompareRadarChart({ country1Name, country2Name, data }: CompareRadarChartProps) {
  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          
          <Radar 
            name={country1Name} 
            dataKey="A" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.4} 
          />
          
          <Radar 
            name={country2Name} 
            dataKey="B" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.4} 
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
