import { useState, useEffect } from "react";
import { ChocolateDataService } from "../../data/chocolateData";
import { TrendingUp, BarChart3, Users, Target } from "lucide-react";

export function SalesHeatmap() {
  const [heatmapData, setHeatmapData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        
        const brands = [...new Set(rawData.map(d => d.brand_preference))];
        const regions = [...new Set(rawData.map(d => d.region))];
        
        const heatmap = brands.map(brand => {
          const row: Record<string, any> = { brand };
          regions.forEach(region => {
            const sales = rawData
              .filter(d => d.brand_preference === brand && d.region === region)
              .reduce((sum, d) => sum + d.average_spend_inr, 0);
            row[region] = sales;
          });
          return row;
        });

        const totalSales = rawData.reduce((sum, d) => sum + d.average_spend_inr, 0);
        const topBrand = brands.reduce((a, b) => {
          const salesA = rawData.filter(d => d.brand_preference === a).reduce((sum, d) => sum + d.average_spend_inr, 0);
          const salesB = rawData.filter(d => d.brand_preference === b).reduce((sum, d) => sum + d.average_spend_inr, 0);
          return salesA > salesB ? a : b;
        });

        setHeatmapData({ grid: heatmap, regions, brands, totalSales, topBrand });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Sales Heatmap...</div>;

  const { grid, regions, totalSales, topBrand } = heatmapData;
  const maxSales = Math.max(...grid.flatMap((row: any) => regions.map((region: string) => row[region] || 0)));

  const getHeatColor = (value: number) => {
    const intensity = (value / maxSales) * 100;
    if (intensity > 75) return 'bg-red-600 text-white';
    if (intensity > 50) return 'bg-orange-500 text-white';
    if (intensity > 25) return 'bg-yellow-500 text-black';
    if (intensity > 0) return 'bg-green-400 text-black';
    return 'bg-gray-200 text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-2">Sales Heatmap Analytics</h1>
        <p className="text-muted-foreground">Comprehensive sales performance analysis across brands and regions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Sales</span>
          </div>
          <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Top Brand</span>
          </div>
          <div className="text-2xl font-bold">{topBrand}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Active Brands</span>
          </div>
          <div className="text-2xl font-bold">{grid.length}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Market Coverage</span>
          </div>
          <div className="text-2xl font-bold">{regions.length} Regions</div>
        </div>
      </div>

      {/* Main Heatmap */}
      <div className="bg-card rounded-xl p-6 border">
        <h2 className="text-xl font-semibold mb-4">Brand Performance Heatmap</h2>
        <p className="text-sm text-muted-foreground mb-6">Sales intensity across brands and regions</p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-3 font-semibold">Brand</th>
                {regions.map((region: string) => (
                  <th key={region} className="text-center p-3 font-semibold">
                    {region}
                  </th>
                ))}
                <th className="text-center p-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {grid.map((row: any, i: number) => {
                const rowTotal = regions.reduce((sum: number, region: string) => sum + (row[region] || 0), 0);
                return (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-medium">{row.brand}</td>
                    {regions.map((region: string) => (
                      <td key={region} className="p-2">
                        <div className={`p-3 rounded text-center font-medium ${getHeatColor(row[region])}`}>
                          ₹{(row[region] || 0).toLocaleString()}
                        </div>
                      </td>
                    ))}
                    <td className="p-3 text-center font-bold">₹{rowTotal.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex items-center gap-4 text-sm">
          <span className="font-medium">Sales Intensity:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>No Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Very High</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="space-y-3">
            {grid.sort((a: any, b: any) => {
              const totalA = regions.reduce((sum: number, region: string) => sum + (a[region] || 0), 0);
              const totalB = regions.reduce((sum: number, region: string) => sum + (b[region] || 0), 0);
              return totalB - totalA;
            }).slice(0, 3).map((row: any, i: number) => {
              const total = regions.reduce((sum: number, region: string) => sum + (row[region] || 0), 0);
              return (
                <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">{row.brand}</span>
                  <span className="text-primary font-bold">₹{total.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Regional Leaders</h3>
          <div className="space-y-3">
            {regions.map((region: string) => {
              const leader = grid.reduce((best: any, row: any) => 
                (row[region] || 0) > (best[region] || 0) ? row : best
              );
              return (
                <div key={region} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">{region}</span>
                  <span className="text-primary font-bold">{leader.brand}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
