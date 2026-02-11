import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import { ChocolateDataService } from "../../data/chocolateData";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Region coordinates for India map
const regionCoordinates: Record<string, [number, number]> = {
  North: [28.7041, 77.1025],
  South: [13.0827, 80.2707],
  East: [22.5726, 88.3639],
  West: [19.0760, 72.8777],
};

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heat = (L as any).heatLayer(points, {
      radius: 80,
      blur: 40,
      maxZoom: 10,
      max: 1.5,
      gradient: {
        0.0: '#22c55e',
        0.4: '#eab308',
        0.6: '#ea580c',
        1.0: '#dc2626'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

export function Forecast() {
  const [regionSales, setRegionSales] = useState<Record<string, number>>({});
  const [maxSales, setMaxSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [heatmapPoints, setHeatmapPoints] = useState<[number, number, number][]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();

        const salesByRegion = rawData.reduce((acc: any, item: any) => {
          if (!acc[item.region]) acc[item.region] = 0;
          acc[item.region] += item.average_spend_inr;
          return acc;
        }, {});

        // Create heatmap points
        const points: [number, number, number][] = [];
        rawData.forEach((item: any) => {
          const coords = regionCoordinates[item.region];
          if (coords) {
            const lat = coords[0] + (Math.random() - 0.5) * 3;
            const lng = coords[1] + (Math.random() - 0.5) * 3;
            const intensity = item.average_spend_inr / 1500;
            points.push([lat, lng, intensity]);
          }
        });

        console.log('Region Sales:', salesByRegion);
        setRegionSales(salesByRegion);
        setMaxSales(Math.max(...Object.values(salesByRegion).map(v => Number(v))));
        setHeatmapPoints(points);
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

  // Get color based on sales intensity - Green to Red
  const getHeatmapColor = (sales: number) => {
    const intensity = (sales / maxSales) * 100;
    if (intensity > 75) return "#dc2626";
    if (intensity > 50) return "#ea580c";
    if (intensity > 25) return "#eab308";
    return "#22c55e";
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-2">Sales Forecast & Regional Analysis</h1>
        <p className="text-muted-foreground">Interactive heatmap showing sales intensity across India</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border"
      >
        <h2 className="text-2xl font-semibold mb-4">India Sales Heatmap</h2>
        <div className="h-[600px] rounded-lg overflow-hidden border-2 border-border">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatmapLayer points={heatmapPoints} />
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="text-sm text-muted-foreground">Sales Intensity:</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-xs">Low (0-25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
              <span className="text-xs">Medium (25-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ea580c' }} />
              <span className="text-xs">High (50-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }} />
              <span className="text-xs">Highest (75-100%)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Regional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(regionSales).map(([region, sales]) => {
          const intensity = ((sales / maxSales) * 100).toFixed(0);
          
          return (
            <motion.div
              key={region}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 border"
            >
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{region} Region</h3>
              </div>
              <div className="text-2xl font-bold mb-1">₹{(sales / 1000).toFixed(1)}K</div>
              <div className="text-sm text-muted-foreground">Sales Intensity: {intensity}%</div>
              <div className="mt-3 w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${intensity}%`,
                    backgroundColor: getHeatmapColor(sales)
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
