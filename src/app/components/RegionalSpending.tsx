import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChocolateDataService } from "../../data/chocolateData";

interface RegionData {
  region: string;
  avgSpend: number;
  totalSpend: number;
  consumers: number;
}

export function RegionalSpending() {
  const [data, setData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        
        console.log('Raw data sample:', rawData.slice(0, 3)); // Debug
        
        // Group by region and calculate totals
        const regionStats = rawData.reduce((acc, item) => {
          const region = item.region;
          if (!acc[region]) {
            acc[region] = { totalSpend: 0, count: 0 };
          }
          acc[region].totalSpend += item.average_spend_inr;
          acc[region].count += 1;
          return acc;
        }, {} as Record<string, { totalSpend: number; count: number }>);

        console.log('Region stats:', regionStats); // Debug

        const regionData = Object.entries(regionStats)
          .map(([region, stats]) => ({
            region,
            avgSpend: Math.round(stats.totalSpend / stats.count),
            totalSpend: Math.round(stats.totalSpend),
            consumers: stats.count
          }))
          .sort((a, b) => b.totalSpend - a.totalSpend); // Sort by total spend

        console.log('Final region data:', regionData); // Debug
        setData(regionData);
      } catch (error) {
        console.error('Failed to load regional data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <motion.div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading regional analysis...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
    >
      <div className="mb-6">
        <h3 className="mb-1">Regional Spending Analysis</h3>
        <p className="text-sm text-muted-foreground">Analysis by 794 people and region</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
          <XAxis 
            dataKey="region" 
            stroke="currentColor" 
            className="text-xs opacity-60"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            stroke="currentColor" 
            className="text-xs opacity-60"
            tick={{ fill: 'currentColor' }}
            domain={[0, 'auto']}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold mb-2">{data.region}</p>
                    <p className="text-xs text-muted-foreground">Avg Spend: ₹{data.avgSpend.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Spend: ₹{data.totalSpend.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Consumers: {data.consumers}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="consumers" fill="#6b4423" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}