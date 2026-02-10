import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChocolateDataService } from "../../data/chocolateData";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-xl">
        <p className="text-sm mb-1">{payload[0].name}</p>
        <p className="text-xs text-muted-foreground">
          {payload[0].value} purchases
        </p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#6b4423', '#d4a574', '#4a2f1e', '#e5c39c', '#a67c52', '#c89f6f'];

export function FlavorChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        const occasionCounts = rawData.reduce((acc, item) => {
          acc[item.occasion] = (acc[item.occasion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const chartData = Object.entries(occasionCounts)
          .map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);
        
        setData(chartData);
      } catch (error) {
        console.error('Failed to load flavor data:', error);
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
        transition={{ duration: 0.5, delay: 0.5 }}
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
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Glassmorphic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="mb-1">Purchase by Occasion</h3>
          <p className="text-sm text-muted-foreground">Top occasions for chocolate purchases</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
