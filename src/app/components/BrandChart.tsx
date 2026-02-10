import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts";
import { ChocolateDataService } from "../../data/chocolateData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-4 shadow-xl">
        <p className="text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span>₹{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function BrandChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        const brandStats = rawData.reduce((acc, item) => {
          if (!acc[item.brand_preference]) {
            acc[item.brand_preference] = { totalSpend: 0, count: 0 };
          }
          acc[item.brand_preference].totalSpend += item.average_spend_inr;
          acc[item.brand_preference].count += 1;
          return acc;
        }, {} as Record<string, { totalSpend: number; count: number }>);
        
        const chartData = Object.entries(brandStats)
          .map(([brand, stats]) => ({
            brand,
            sales: Math.round(stats.totalSpend),
            avgSpend: Math.round(stats.totalSpend / stats.count),
            count: stats.count
          }))
          .sort((a, b) => b.sales - a.sales);
        
        setData(chartData);
      } catch (error) {
        console.error('Failed to load brand data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 h-[400px] flex items-center justify-center"
      >
        <div className="text-muted-foreground">Loading...</div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Glassmorphic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="mb-1">Brand Performance</h3>
          <p className="text-sm text-muted-foreground">Top brands by total spending</p>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ bottom: 80, left: 10, right: 10, top: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
            <XAxis 
              dataKey="brand" 
              stroke="currentColor" 
              className="text-xs opacity-60"
              tick={{ fill: 'currentColor' }}
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis 
              stroke="currentColor" 
              className="text-xs opacity-60"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            <Bar 
              dataKey="sales" 
              fill="#6b4423" 
              radius={[8, 8, 0, 0]} 
              name="Total Spend"
            >
              <LabelList dataKey="sales" position="top" style={{ fill: 'currentColor', fontSize: 10 }} />
            </Bar>
            <Bar 
              dataKey="avgSpend" 
              fill="#d4a574" 
              radius={[8, 8, 0, 0]} 
              name="Avg Spend"
            >
              <LabelList dataKey="avgSpend" position="top" style={{ fill: 'currentColor', fontSize: 10 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
