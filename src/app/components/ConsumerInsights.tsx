import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, ShoppingBag, TrendingUp, Candy, CalendarHeart, Smile } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ChocolateDataService, ChocolateConsumerData } from "../../data/chocolateData";
import { DemographicsDeepDive } from "./DemographicsDeepDive";
import { BehavioralInsights } from "./BehavioralInsights";

const COLORS = ['#6b4423', '#8b5a3c', '#a67c52', '#c89f6f', '#d4a574', '#e5c39c', '#c17c4a', '#4a2f1e'];

export function ConsumerInsights() {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<ChocolateConsumerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({});
  const [charts, setCharts] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        setData(rawData);
        
        // Calculate metrics
        const totalConsumers = rawData.length;
        const avgSpend = rawData.reduce((sum, item) => sum + item.average_spend_inr, 0) / totalConsumers;
        
        // Top brand
        const brandCounts = rawData.reduce((acc, item) => {
          acc[item.brand_preference] = (acc[item.brand_preference] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topBrand = Object.keys(brandCounts).reduce((a, b) => brandCounts[a] > brandCounts[b] ? a : b);
        
        // Top channel
        const channelCounts = rawData.reduce((acc, item) => {
          acc[item.purchase_channel] = (acc[item.purchase_channel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topChannel = Object.keys(channelCounts).reduce((a, b) => channelCounts[a] > channelCounts[b] ? a : b);
        
        // Top mood
        const moodCounts = rawData.reduce((acc, item) => {
          acc[item.mood] = (acc[item.mood] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
        
        // Top occasion
        const occasionCounts = rawData.reduce((acc, item) => {
          acc[item.occasion] = (acc[item.occasion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topOccasion = Object.keys(occasionCounts).reduce((a, b) => occasionCounts[a] > occasionCounts[b] ? a : b);
        
        setMetrics({
          totalConsumers,
          avgSpend: Math.round(avgSpend),
          topBrand,
          topChannel,
          topMood,
          topOccasion
        });
        
        // Prepare chart data
        const brandData = Object.entries(brandCounts).map(([name, value], index) => ({
          name,
          value: ((value / totalConsumers) * 100).toFixed(1),
          color: COLORS[index % COLORS.length]
        }));
        
        const occasionData = Object.entries(occasionCounts).map(([name, value], index) => ({
          name,
          value: ((value / totalConsumers) * 100).toFixed(1),
          color: COLORS[index % COLORS.length]
        }));
        
        const moodData = Object.entries(moodCounts).map(([mood, frequency]) => ({
          mood,
          frequency
        }));
        
        // Regional spending
        const regionStats = rawData.reduce((acc, item) => {
          if (!acc[item.region]) {
            acc[item.region] = { totalSpend: 0, count: 0 };
          }
          acc[item.region].totalSpend += item.average_spend_inr;
          acc[item.region].count += 1;
          return acc;
        }, {} as Record<string, { totalSpend: number; count: number }>);
        
        const regionData = Object.entries(regionStats).map(([region, stats]) => ({
          region,
          spend: Math.round(stats.totalSpend / stats.count)
        }));
        
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
        
        // Purchase frequency
        const freqCounts = rawData.reduce((acc, item) => {
          acc[item.purchase_frequency] = (acc[item.purchase_frequency] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const frequencyData = Object.entries(freqCounts).map(([frequency, count]) => ({
          frequency,
          count
        }));
        
        // Age vs spend - by age ranges
        const ageGroups = rawData.reduce((acc, item) => {
          let ageRange;
          if (item.age >= 13 && item.age <= 20) ageRange = '13-20';
          else if (item.age >= 21 && item.age <= 30) ageRange = '21-30';
          else if (item.age >= 31 && item.age <= 40) ageRange = '31-40';
          else if (item.age >= 41 && item.age <= 50) ageRange = '41-50';
          else if (item.age >= 51 && item.age <= 60) ageRange = '51-60';
          else ageRange = '60+';
          
          if (!acc[ageRange]) {
            acc[ageRange] = { totalSpend: 0, count: 0 };
          }
          acc[ageRange].totalSpend += item.average_spend_inr;
          acc[ageRange].count += 1;
          return acc;
        }, {} as Record<string, { totalSpend: number; count: number }>);
        
        const ageOrder = ['13-20', '21-30', '31-40', '41-50', '51-60', '60+'];
        const ageSpendData = ageOrder
          .filter(range => ageGroups[range])
          .map(range => ({
            age: range,
            spend: Math.round(ageGroups[range].totalSpend / ageGroups[range].count),
            count: ageGroups[range].count
          }));
        
        console.log('=== AGE SPEND DATA VERIFICATION ===');
        console.log('Total records:', rawData.length);
        ageSpendData.forEach(item => {
          console.log(`${item.age}: ${item.count} consumers, Avg Spend: ₹${item.spend}`);
        });
        console.log('Raw age groups:', ageGroups);
        
        setCharts({
          brandData,
          occasionData,
          moodData,
          regionData,
          ageSpendData,
          genderData,
          frequencyData
        });
        
      } catch (error) {
        console.error('Failed to load consumer insights data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "behavioral", label: "BEHAVIOURAL INSIGHTS" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading consumer insights...</div>
        </div>
      </div>
    );
  }

  const topMetrics = [
    { label: "Top Brand", value: metrics.topBrand, icon: Candy },
    { label: "Top Channel", value: metrics.topChannel, icon: ShoppingBag },
    { label: "Total Consumers", value: metrics.totalConsumers.toString(), icon: Users },
    { label: "Avg Spend", value: `₹${metrics.avgSpend}`, icon: TrendingUp },
    { label: "Top Mood", value: metrics.topMood, icon: Smile },
    { label: "Top Occasion", value: metrics.topOccasion, icon: CalendarHeart },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl tracking-tight">Chocolate Consumption Trends in India</h1>
          <p className="text-muted-foreground mt-1">Deep dive into consumer behavior and preferences</p>
        </div>
      </motion.div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                : "bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary hover:scale-105"
            }`}
          >
            <span className="text-sm">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === "behavioral" && <BehavioralInsights />}
      {activeTab === "overview" && (
        <>
          {/* Top Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {topMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 p-4"
                >
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-sm font-medium">{metric.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Gender Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
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

            {/* Regional Spending */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
            >
              <h3 className="mb-4">Average Spend by Region</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts.regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="region" stroke="currentColor" className="text-xs opacity-60" />
                  <YAxis stroke="currentColor" className="text-xs opacity-60" />
                  <Tooltip />
                  <Bar dataKey="spend" fill="#d4a574" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Purchase Frequency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
            >
              <h3 className="mb-4">Purchase Frequency Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts.frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="frequency" stroke="currentColor" className="text-xs opacity-60" />
                  <YAxis stroke="currentColor" className="text-xs opacity-60" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d4a574" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Age vs Spend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
            >
              <h3 className="mb-4 text-lg font-semibold">Average Spending by Age Group</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={charts.ageSpendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis 
                    dataKey="age" 
                    stroke="currentColor" 
                    className="text-sm opacity-80"
                    tick={{ fontSize: 14 }}
                  />
                  <YAxis 
                    stroke="currentColor" 
                    className="text-sm opacity-80"
                    tick={{ fontSize: 14 }}
                    label={{ value: 'Average Spend (₹)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="spend" stroke="#d4a574" strokeWidth={3} dot={{ fill: '#d4a574', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Mood Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
          >
            <h3 className="mb-4">Purchase Frequency by Mood</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="mood" stroke="currentColor" className="text-xs opacity-60" />
                <YAxis stroke="currentColor" className="text-xs opacity-60" />
                <Tooltip />
                <Bar dataKey="frequency" fill="#c89f6f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}