import { TrendingUp, TrendingDown, Candy, Calendar, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

/* =========================
   DATA TYPE
========================= */
interface ChocolateRow {
  age: number;
  gender: string;
  region: string;
  brand_preference: string;
  purchase_frequency: string;
  average_spend_inr: number;
  purchase_channel: string;
  occasion: string;
  mood: string;
  satisfaction_score: number;
}

/* =========================
   KPI CARD UI COMPONENT
========================= */
interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  delay?: number;
}

interface KPICardsProps {
  data: ChocolateRow[];
}

function KPICard({
  title,
  value,
  change,
  trend,
  icon,
  delay = 0,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-border/30">
            {icon}
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
              trend === "up"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{change}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl tracking-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================
   KPI CARDS (EXCEL-DRIVEN)
========================= */
export function KPICards({ data }: KPICardsProps) {

  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 h-32 animate-pulse"
          >
            <div className="bg-muted/20 rounded h-4 w-3/4 mb-2"></div>
            <div className="bg-muted/20 rounded h-8 w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  /* ===== KPI CALCULATIONS FROM EXCEL DATA ===== */
  const totalConsumption = data.length;

  const avgSpendValue =
    data.reduce((sum: number, row: ChocolateRow) => sum + row.average_spend_inr, 0) / data.length;

  const brandCount: Record<string, number> = {};
  data.forEach((row: ChocolateRow) => {
    brandCount[row.brand_preference] =
      (brandCount[row.brand_preference] || 0) + 1;
  });
  const popularBrand = Object.keys(brandCount).reduce((a, b) =>
    brandCount[a] > brandCount[b] ? a : b
  );

  const regionCount: Record<string, number> = {};
  data.forEach((row: ChocolateRow) => {
    regionCount[row.region] = (regionCount[row.region] || 0) + 1;
  });
  const topRegion = Object.keys(regionCount).reduce((a, b) =>
    regionCount[a] > regionCount[b] ? a : b
  );

  const kpis = [
    {
      title: "Total Records",
      value: `${totalConsumption}`,
      change: "+0%",
      trend: "up" as const,
      icon: <BarChart3 className="w-5 h-5 text-primary" />,
    },
    {
      title: "Popular Brand",
      value: popularBrand,
      change: "+0%",
      trend: "up" as const,
      icon: <Candy className="w-5 h-5 text-primary" />,
    },
    {
      title: "Avg Spend",
      value: `₹${Math.round(avgSpendValue)}`,
      change: "+0%",
      trend: "up" as const,
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
    },
    {
      title: "Top Region",
      value: topRegion,
      change: "+0%",
      trend: "up" as const,
      icon: <Calendar className="w-5 h-5 text-primary" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.title} {...kpi} delay={index * 0.1} />
      ))}
    </div>
  );
}
