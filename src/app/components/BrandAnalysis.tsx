import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChocolateDataService, ChocolateConsumerData } from "../../data/chocolateData";

interface BrandData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#6b4423', '#8b5a3c', '#a67c52', '#c89f6f', '#d4a574', '#e5c39c', '#c17c4a', '#4a2f1e', '#8B4513', '#D2691E'];

export function BrandAnalysis() {
  const [data, setData] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        
        // Count brand preferences
        const brandCounts = rawData.reduce((acc, item) => {
          acc[item.brand_preference] = (acc[item.brand_preference] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const brandData = Object.entries(brandCounts)
          .sort((a, b) => b[1] - a[1]) // Sort by count descending
          .map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
          }));

        setData(brandData);
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
      <motion.div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading brand analysis...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
    >
      <div className="mb-6">
        <h3 className="mb-1">Brand Preference Distribution</h3>
        <p className="text-sm text-muted-foreground">Consumer preferences across chocolate brands</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}