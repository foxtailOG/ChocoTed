import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "motion/react";
import { MapPin, TrendingUp } from "lucide-react";
import { ChocolateDataService } from "../../data/chocolateData";

export function Forecast() {
  const [regionSales, setRegionSales] = useState<Record<string, number>>({});
  const [maxSales, setMaxSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();

        const salesByRegion = rawData.reduce((acc: any, item: any) => {
          if (!acc[item.region]) acc[item.region] = 0;
          acc[item.region] += item.average_spend_inr;
          return acc;
        }, {});

        console.log('Region Sales:', salesByRegion);
        setRegionSales(salesByRegion);
        setMaxSales(Math.max(...Object.values(salesByRegion).map(v => Number(v))));
        setLoading(false);
      } catch (error) {
        console.error('Error loading forecast data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading Forecast...</div>;
  }

  // Get color intensity based on sales
  const getColorIntensity = (sales: number) => {
    const intensity = (sales / maxSales) * 100;
    if (intensity > 80) return "bg-red-600";
    if (intensity > 60) return "bg-orange-500";
    if (intensity > 40) return "bg-yellow-500";
    if (intensity > 20) return "bg-green-500";
    return "bg-blue-500";
  };

  const regions = [
    { name: "North", top: "25%", left: "50%" },
    { name: "South", top: "75%", left: "50%" },
    { name: "East", top: "50%", left: "65%" },
    { name: "West", top: "50%", left: "35%" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-2">Sales Forecast & Regional Analysis</h1>
        <p className="text-muted-foreground">Interactive heatmap showing sales intensity across regions</p>
      </div>

      {/* India Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-8 border"
      >
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">India Sales Heatmap</h2>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[600px] bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-border overflow-hidden">
          {/* India Map Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="text-9xl font-bold text-gray-400 dark:text-gray-600">INDIA</div>
          </div>
          
          {/* Grid Lines for Reference */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="0.5" className="dark:stroke-gray-700" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Regional Markers */}
          {regions.map((region) => {
            const sales = regionSales[region.name] || 0;
            const colorClass = getColorIntensity(sales);
            
            return (
              <motion.div
                key={region.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute"
                style={{ top: region.top, left: region.left, transform: "translate(-50%, -50%)" }}
              >
                <div className="relative group cursor-pointer">
                  {/* Pulsing Circle */}
                  <div className={`w-24 h-24 rounded-full ${colorClass} opacity-60 animate-pulse`} />
                  
                  {/* Inner Circle */}
                  <div className={`absolute inset-0 w-24 h-24 rounded-full ${colorClass} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <div className="text-xs font-semibold">{region.name}</div>
                      <div className="text-lg font-bold">₹{(sales / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <div className="font-semibold">{region.name} Region</div>
                      <div>Total Sales: ₹{sales.toLocaleString()}</div>
                      <div>Intensity: {((sales / maxSales) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="text-sm text-muted-foreground">Sales Intensity:</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-xs">Very High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600" />
              <span className="text-xs">Highest</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Regional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {regions.map((region) => {
          const sales = regionSales[region.name] || 0;
          const intensity = ((sales / maxSales) * 100).toFixed(0);
          
          return (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 border"
            >
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{region.name} Region</h3>
              </div>
              <div className="text-2xl font-bold mb-1">₹{(sales / 1000).toFixed(1)}K</div>
              <div className="text-sm text-muted-foreground">Sales Intensity: {intensity}%</div>
              <div className="mt-3 w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getColorIntensity(sales)}`}
                  style={{ width: `${intensity}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
