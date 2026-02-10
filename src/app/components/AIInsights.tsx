import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Sparkles, AlertCircle, Zap } from "lucide-react";
import { ChocolateDataService } from "../../data/chocolateData";

export function AIInsights() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        
        // Calculate insights from raw data
        const totalSpend = rawData.reduce((sum, item) => sum + item.average_spend_inr, 0);
        const avgSpend = Math.round(totalSpend / rawData.length);
        
        const brandCounts = rawData.reduce((acc, item) => {
          acc[item.brand_preference] = (acc[item.brand_preference] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0];
        
        const regionCounts = rawData.reduce((acc, item) => {
          acc[item.region] = (acc[item.region] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];
        
        const moodCounts = rawData.reduce((acc, item) => {
          acc[item.mood] = (acc[item.mood] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
        
        const avgSatisfaction = (rawData.reduce((sum, item) => sum + item.satisfaction_score, 0) / rawData.length).toFixed(1);
        
        console.log('AI Insights Data:', {
          totalRecords: rawData.length,
          avgSpend,
          topBrand,
          topRegion,
          topMood,
          avgSatisfaction
        });
        
        setInsights([
          {
            type: "rising",
            icon: TrendingUp,
            title: `${topBrand[0]} Leading`,
            description: `${topBrand[0]} is the most preferred brand with ${topBrand[1]} purchases`,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-500/10",
          },
          {
            type: "insight",
            icon: Sparkles,
            title: "Average Spending",
            description: `Consumers spend an average of ₹${avgSpend} per purchase`,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-500/10",
          },
          {
            type: "alert",
            icon: AlertCircle,
            title: "Regional Leader",
            description: `${topRegion[0]} has the highest purchase volume with ${topRegion[1]} transactions`,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-500/10",
          },
          {
            type: "prediction",
            icon: Zap,
            title: "Consumer Mood",
            description: `Most purchases made when feeling ${topMood[0]} (${topMood[1]} purchases)`,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-500/10",
          },
          {
            type: "rising",
            icon: TrendingUp,
            title: "Satisfaction Score",
            description: `Average customer satisfaction: ${avgSatisfaction}/5`,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-500/10",
          },
        ]);
      } catch (error) {
        console.error('Failed to load insights:', error);
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
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 h-[400px] flex items-center justify-center"
      >
        <div className="text-muted-foreground">Loading insights...</div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Glassmorphic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-0">AI-Powered Insights</h3>
            <p className="text-xs text-muted-foreground">Auto-generated market intelligence</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                className="group flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border transition-all duration-200 cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${insight.bgColor} shrink-0`}>
                  <Icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm mb-0.5 group-hover:text-primary transition-colors">
                    {insight.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {insight.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          <span>Predict Next Trend</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
