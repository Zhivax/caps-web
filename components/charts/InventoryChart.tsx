
import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ChartData {
  name: string;
  stock: number;
  threshold: number;
}

const InventoryChart: React.FC<{ data: ChartData[] }> = memo(({ data }) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
          <TrendingUp size={18} className="mr-3 text-indigo-600" /> 
          Inventory Levels per SKU
        </h4>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase">Alert</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontWeight: 800, fill: '#64748b' }} 
            />
            <YAxis 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontWeight: 800, fill: '#64748b' }}
            />
            <Tooltip 
              isAnimationActive={false}
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
              labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '12px' }}
            />
            <Bar dataKey="stock" radius={[6, 6, 0, 0]} barSize={50} isAnimationActive={false}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.stock < entry.threshold ? '#f43f5e' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default InventoryChart;
