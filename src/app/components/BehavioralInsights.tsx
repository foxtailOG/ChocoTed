import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChocolateDataService, ChocolateConsumerData } from "../../data/chocolateData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList } from "recharts";

const COLORS = ['#6b4423', '#8b5a3c', '#a67c52', '#c89f6f', '#d4a574', '#e5c39c'];

export function BehavioralInsights() {
  const [data, setData] = useState<ChocolateConsumerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        setData(rawData);
      } catch (error) {
        console.error('Failed to load behavioral insights data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading behavioral insights...</div>;
  }

  // Purchase frequency analysis
  const frequencyCounts = data.reduce((acc, item) => {
    acc[item.purchase_frequency] = (acc[item.purchase_frequency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const frequencyData = Object.entries(frequencyCounts).map(([name, value]) => ({ name, value }));

  // Regional patterns
  const regionCounts = data.reduce((acc, item) => {
    acc[item.region] = (acc[item.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const regionData = Object.entries(regionCounts).map(([name, value]) => ({ name, value }));

  // Occasion distribution
  const occasionCounts = data.reduce((acc, item) => {
    acc[item.occasion] = (acc[item.occasion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const occasionData = Object.entries(occasionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  console.log('Occasion data:', occasionData);

  // Mood distribution
  const moodCounts = data.reduce((acc, item) => {
    acc[item.mood] = (acc[item.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const moodData = Object.entries(moodCounts).map(([name, value]) => ({ name, value }));

  // Satisfaction scores
  const satisfactionData = data.reduce((acc, item) => {
    const score = Math.floor(item.satisfaction_score);
    acc[score] = (acc[score] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const satisfactionChartData = Object.entries(satisfactionData).map(([score, count]) => ({ score: `${score}`, count }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
        >
          <h3 className="mb-4">Purchase Frequency Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="name" stroke="currentColor" className="text-xs opacity-60" />
              <YAxis stroke="currentColor" className="text-xs opacity-60" />
              <Tooltip />
              <Bar dataKey="value" fill="#d4a574" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Regional Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
        >
          <h3 className="mb-4">Regional Purchase Patterns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {regionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Occasion Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
        >
          <h3 className="mb-4">Purchase by Occasion</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={occasionData} margin={{ bottom: 80, left: 10, right: 10, top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis 
                dataKey="name" 
                stroke="currentColor" 
                className="text-xs opacity-60"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis stroke="currentColor" className="text-xs opacity-60" />
              <Tooltip />
              <Bar dataKey="value" fill="#c89f6f" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="value" position="top" style={{ fill: 'currentColor', fontSize: 12 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Mood Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
        >
          <h3 className="mb-4">Mood-Based Purchases</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moodData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {moodData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Satisfaction Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6"
        >
          <h3 className="mb-4">Satisfaction Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={satisfactionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="score" stroke="currentColor" className="text-xs opacity-60" />
              <YAxis stroke="currentColor" className="text-xs opacity-60" />
              <Tooltip />
              <Bar dataKey="count" fill="#a67c52" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
