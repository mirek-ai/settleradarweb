'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ClimateChartProps = {
  countryA: string;
  countryB: string;
  dataA: any[];
  dataB: any[];
};

export default function ClimateChart({ countryA, countryB, dataA, dataB }: ClimateChartProps) {
  if (!dataA || !dataB || !dataA.length || !dataB.length) return null;

  // Merge data for chart
  const chartData = dataA.map((mA, index) => {
    const mB = dataB[index];
    return {
      name: mA.monthName,
      [`${countryA} Max`]: mA.avgMaxTemp,
      [`${countryB} Max`]: mB?.avgMaxTemp || 0,
      [`${countryA} Min`]: mA.avgMinTemp,
      [`${countryB} Min`]: mB?.avgMinTemp || 0,
      [`${countryA} Rain`]: mA.rainDays,
      [`${countryB} Rain`]: mB?.rainDays || 0,
    };
  });

  return (
    <div className="w-full space-y-8">
      {/* Temperature Chart */}
      <div className="h-[300px] w-full">
        <h4 className="text-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Average High Temperature (°C)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey={`${countryA} Max`} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey={`${countryB} Max`} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Month-by-month Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
              <th className="p-2 font-bold text-slate-500 uppercase">Month</th>
              <th className="p-2 font-bold text-blue-500 uppercase">{countryA}</th>
              <th className="p-2 font-bold text-emerald-500 uppercase">{countryB}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {chartData.map((d) => (
              <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="p-2 font-bold">{d.name}</td>
                <td className="p-2">
                  <span className="font-bold">{d[`${countryA} Max`]}° / {d[`${countryA} Min`]}°</span>
                  <span className="text-xs text-slate-500 block">{d[`${countryA} Rain`]} rain days</span>
                </td>
                <td className="p-2">
                  <span className="font-bold">{d[`${countryB} Max`]}° / {d[`${countryB} Min`]}°</span>
                  <span className="text-xs text-slate-500 block">{d[`${countryB} Rain`]} rain days</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
