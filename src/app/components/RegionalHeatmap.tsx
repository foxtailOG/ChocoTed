import { useState, useEffect } from "react";
import { ChocolateDataService } from "../../data/chocolateData";
import { ArrowRight, TrendingUp } from "lucide-react";

interface RegionalHeatmapProps {
  onNavigate: (page: string) => void;
}

export function RegionalHeatmap({ onNavigate }: RegionalHeatmapProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        
        const regionStats = rawData.reduce((acc: any, item: any) => {
          if (!acc[item.region]) {
            acc[item.region] = { sales: 0, count: 0 };
          }
          acc[item.region].sales += item.average_spend_inr;
          acc[item.region].count += 1;
          return acc;
        }, {});

        const maxSales = Math.max(...Object.values(regionStats).map((r: any) => r.sales));
        
        const regions = Object.entries(regionStats).map(([name, stats]: [string, any]) => ({
          name,
          sales: stats.sales,
          intensity: Math.round((stats.sales / maxSales) * 100)
        })).sort((a, b) => b.sales - a.sales).slice(0, 4);

        setData(regions);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="bg-card rounded-xl p-6 border h-64 flex items-center justify-center">Loading...</div>;

  return (
    <div 
      className="bg-card rounded-xl p-6 border cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={() => onNavigate?.('sales-heatmap')}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Sales Heatmap</h3>
          <p className="text-sm text-muted-foreground">Regional performance overview</p>
        </div>
        <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
          <span className="text-sm">View Details</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((region) => (
          <div key={region.name} className="flex items-center justify-between">
            <span className="text-sm font-medium">{region.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${region.intensity}%`,
                    backgroundColor: region.intensity > 75 ? '#dc2626' : 
                                   region.intensity > 50 ? '#ea580c' :
                                   region.intensity > 25 ? '#ca8a04' : '#16a34a'
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-16">₹{region.sales.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="w-3 h-3" />
        <span>Click to view detailed heatmap analysis</span>
      </div>
    </div>
  );
}