import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { ChocolateDataService, ChocolateConsumerData } from "../../data/chocolateData";

const COLORS = ['#d4a574', '#e5c39c', '#c89f6f', '#a67c52', '#8b5a3c', '#6b4423'];

export function DemographicsDeepDive() {
  const [data, setData] = useState<ChocolateConsumerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState<any>({});
  const [metrics, setMetrics] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        setData(rawData);
        
        // Calculate metrics
        const regionSpend = rawData.reduce((acc, item) => {
          if (!acc[item.region]) acc[item.region] = { total: 0, count: 0 };
          acc[item.region].total += item.average_spend_inr;
          acc[item.region].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);
        
        const topRegion = Object.keys(regionSpend).reduce((a, b) => 
          regionSpend[a].count > regionSpend[b].count ? a : b
        );
        
        const topMood = rawData.reduce((acc, item) => {
          acc[item.mood] = (acc[item.mood] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostCommonMood = Object.keys(topMood).reduce((a, b) => topMood[a] > topMood[b] ? a : b);
        
        setMetrics({
          topRegion,
          regionShare: ((regionSpend[topRegion].count / rawData.length) * 100).toFixed(1),
          avgSpend: Math.round(regionSpend[topRegion].total / regionSpend[topRegion].count),
          topMood: mostCommonMood
        });
        
        // Gender distribution
        const genderCounts = rawData.reduce((acc, item) => {
          acc[item.gender] = (acc[item.gender] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const genderData = Object.entries(genderCounts).map(([name, count], index) => ({
          name,
          value: count,
          color: COLORS[index % COLORS.length]
        }));
        
        console.log('Gender Distribution:', genderData);
        
        // Regional spending
        const regionData = Object.entries(regionSpend).map(([region, stats]) => ({
          region,
          spend: Math.round(stats.total / stats.count)
        }));
        
        // Brand by region
        const brandRegionData = rawData.reduce((acc, item) => {
          if (!acc[item.region]) acc[item.region] = {};
          acc[item.region][item.brand_preference] = (acc[item.region][item.brand_preference] || 0) + 1;
          return acc;
        }, {} as Record<string, Record<string, number>>);
        
        const brandRegionChart = Object.entries(brandRegionData).map(([region, brands]) => {
          const total = Object.values(brands).reduce((sum, count) => sum + count, 0);
          const result: any = { region };
          Object.entries(brands).forEach(([brand, count]) => {
            result[brand.replace(/\s+/g, '_')] = (count / total).toFixed(3);
          });
          return result;
        });
        
        // Purchase frequency
        const freqCounts = rawData.reduce((acc, item) => {
          acc[item.purchase_frequency] = (acc[item.purchase_frequency] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const frequencyData = Object.entries(freqCounts).map(([frequency, count]) => ({
          frequency,
          count
        }));
        
        setCharts({
          genderData,
          regionData,
          brandRegionChart,
          frequencyData
        });
        
      } catch (error) {
        console.error('Failed to load demographics data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading demographics data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl bg-card/80 border border-border/50 p-6"
      >
        <div className="flex items-center justify-center gap-4">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl tracking-wider">DEMOGRAPHICS DEEP DIVE</h1>
          <Users className="w-8 h-8 text-primary" />
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div className="bg-card/80 border border-border/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{metrics.topRegion}</div>
          <div className="text-xs text-muted-foreground">Top Region</div>
        </motion.div>
        <motion.div className="bg-card/80 border border-border/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{metrics.regionShare}%</div>
          <div className="text-xs text-muted-foreground">Regional Share</div>
        </motion.div>
        <motion.div className="bg-card/80 border border-border/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">₹{metrics.avgSpend}</div>
          <div className="text-xs text-muted-foreground">Avg Spend</div>
        </motion.div>
        <motion.div className="bg-card/80 border border-border/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{metrics.topMood}</div>
          <div className="text-xs text-muted-foreground">Top Mood</div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 border border-border/50 rounded-xl p-6"
        >
          <h3 className="mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={charts.genderData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {charts.genderData?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Average Spend by Region */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 border border-border/50 rounded-xl p-6"
        >
          <h3 className="mb-4">Average Spend by Region</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts.regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="region" stroke="currentColor" className="text-xs" />
              <YAxis stroke="currentColor" className="text-xs" />
              <Tooltip />
              <Bar dataKey="spend" fill="#8B4513" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Purchase Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 border border-border/50 rounded-xl p-6"
        >
          <h3 className="mb-4">Purchase Frequency Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts.frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="frequency" stroke="currentColor" className="text-xs" />
              <YAxis stroke="currentColor" className="text-xs" />
              <Tooltip />
              <Bar dataKey="count" fill="#D2691E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}