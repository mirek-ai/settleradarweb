'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type CompareChartProps = {
  countryA: string;
  countryB: string;
  data: {
    subject: string;
    A: number;
    B: number;
    fullMark: number;
  }[];
};

export default function CompareChart({ countryA, countryB, data }: CompareChartProps) {
  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-700" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar 
            name={countryA} 
            dataKey="A" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.4} 
          />
          <Radar 
            name={countryB} 
            dataKey="B" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.4} 
          />
          
          <Tooltip 
            formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : value, undefined]}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
