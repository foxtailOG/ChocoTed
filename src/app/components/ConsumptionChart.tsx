import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChocolateDataService, ProcessedChartData } from "../../data/chocolateData";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-4 shadow-xl">
        <p className="text-sm mb-2">{payload[0].payload.month}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span>₹{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ConsumptionChart() {
  const [data, setData] = useState<ProcessedChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        
        // Calculate totals for January 2026 only
        const brandData = rawData.reduce((acc, item) => {
          const brand = item.brand_preference;
          if (!acc[brand]) acc[brand] = 0;
          acc[brand] += item.average_spend_inr;
          return acc;
        }, {} as Record<string, number>);

        const brands = Object.keys(brandData);
        const darkBrands = brands.filter(b => b.includes('Dark') || b.includes('Amul'));
        const milkBrands = brands.filter(b => b.includes('Dairy') || b.includes('KitKat') || b.includes('5 Star'));
        const premiumBrands = brands.filter(b => b.includes('Ferrero') || b.includes('Toblerone'));
        
        // Show only January 2026
        const januaryData = [{
          month: 'January 2026',
          darkChocolate: Math.round(darkBrands.reduce((sum, brand) => sum + (brandData[brand] || 0), 0)),
          milkChocolate: Math.round(milkBrands.reduce((sum, brand) => sum + (brandData[brand] || 0), 0)),
          whiteChocolate: Math.round(premiumBrands.reduce((sum, brand) => sum + (brandData[brand] || 0), 0))
        }];
        
        setData(januaryData);
      } catch (error) {
        console.error('Failed to load consumption data:', error);
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
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 h-[400px] flex items-center justify-center"
      >
        <div className="text-muted-foreground">Loading consumption data...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Glassmorphic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="mb-1">Chocolate Consumption Trends - January 2026</h3>
          <p className="text-sm text-muted-foreground">Current month analysis by chocolate type</p>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
            <XAxis 
              dataKey="month" 
              stroke="currentColor" 
              className="text-xs opacity-60"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              stroke="currentColor" 
              className="text-xs opacity-60"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="darkChocolate" 
              fill="#6b4423" 
              name="Dark Chocolate"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="milkChocolate" 
              fill="#d4a574" 
              name="Milk Chocolate"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="whiteChocolate" 
              fill="#c89f6f" 
              name="White Chocolate"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
