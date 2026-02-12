import { GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import { ChocolateDataService } from "../../data/chocolateData";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

/* ---------------- REGION COORDINATES ---------------- */
const regionCoordinates: Record<string, [number, number]> = {
  "North": [28.7041, 77.1025],
  "North India": [28.7041, 77.1025],

  "South": [13.0827, 80.2707],
  "South India": [13.0827, 80.2707],

  "East": [22.5726, 88.3639],
  "East India": [22.5726, 88.3639],

  "West": [19.076, 72.8777],
  "West India": [19.076, 72.8777],
};

/* ---------------- HEATMAP LAYER ---------------- */
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heat = (L as any).heatLayer(points, {
      radius: 45,
      blur: 25,
      maxZoom: 10,
      minOpacity: 0.5,
      max: 1,
      gradient: {
        0.0: "#22c55e",
        0.4: "#facc15",
        0.7: "#f97316",
        1.0: "#dc2626"
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

/* ---------------- MAIN COMPONENT ---------------- */
export function Forecast() {
  const [regionSales, setRegionSales] = useState<Record<string, number>>({});
  const [maxSales, setMaxSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [heatmapPoints, setHeatmapPoints] = useState<[number, number, number][]>([]);
  const [indiaMap, setIndiaMap] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();

        /* ----------- REGION SALES SUM ----------- */
        const salesByRegion = rawData.reduce((acc: any, item: any) => {
          if (!acc[item.region]) acc[item.region] = 0;
          acc[item.region] += item.average_spend_inr;
          return acc;
        }, {});

        /* ----------- INTENSITY NORMALIZATION ----------- */
        const maxSpend = Math.max(
          ...rawData.map((d: any) => d.average_spend_inr)
        );

        /* ----------- CREATE HEATMAP POINTS ----------- */
        const points: [number, number, number][] = rawData
          .map((item: any) => {
            const coords = regionCoordinates[item.region];
            if (!coords) return null;

            const lat = coords[0] + (Math.random() - 0.5) * 0.8;
            const lng = coords[1] + (Math.random() - 0.5) * 0.8;

            // Log scaled intensity for realistic heat variation
            const intensity = Math.max(
              0.4,
              item.average_spend_inr / maxSpend
            );

            return [lat, lng, intensity] as [number, number, number];
          })
          .filter(Boolean) as [number, number, number][];

        setRegionSales(salesByRegion);
        setMaxSales(Math.max(...(Object.values(salesByRegion) as number[])));
        setHeatmapPoints(points);
        setLoading(false);
      } catch (error) {
        console.error("Error loading forecast data:", error);
        setLoading(false);
      }
    };

    loadData();
    
    fetch("/india.json")
      .then(res => res.json())
      .then(data => setIndiaMap(data))
      .catch(err => console.error("Error loading India map:", err));
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <div className="p-8 text-center">Loading Forecast...</div>;
  }

  /* ---------------- COLOR SCALE ---------------- */
  const sorted = Object.values(regionSales).sort((a,b)=>b-a);

const getColor = (value:number) => {
  const rank = sorted.indexOf(value);

  if (rank === 0) return "#dc2626"; // highest
  if (rank === 1) return "#f97316"; // 2nd
  if (rank === 2) return "#facc15"; // 3rd
  return "#22c55e"; // lowest
};





  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-2">
          Sales Forecast & Regional Analysis
        </h1>
        <p className="text-muted-foreground">
          Interactive heatmap showing sales intensity across India
        </p>
      </div>

      {/* ---------------- MAP CARD ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border"
      >
        <h2 className="text-2xl font-semibold mb-4">India Sales Heatmap</h2>

        <div className="h-[600px] rounded-lg overflow-hidden border-2 border-border">
          <MapContainer
            center={[22.9734, 78.6569]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {indiaMap && (
              <GeoJSON
                data={indiaMap}
                style={(feature:any) => {

                  const state = feature.properties.NAME_1;

                  let value = 0;

                  const north = regionSales["North"] || regionSales["North India"] || 0;
                  const south = regionSales["South"] || regionSales["South India"] || 0;
                  const east  = regionSales["East"]  || regionSales["East India"]  || 0;
                  const west  = regionSales["West"]  || regionSales["West India"]  || 0;

                  if ([
                    "Punjab","Haryana","Delhi","Uttar Pradesh","Rajasthan",
                    "Himachal Pradesh","Uttarakhand","Jammu and Kashmir"
                  ].includes(state)) value = north;

                  else if ([
                    "Tamil Nadu","Kerala","Karnataka","Andhra Pradesh","Telangana"
                  ].includes(state)) value = south;

                  else if ([
                    "West Bengal","Odisha","Bihar","Jharkhand","Assam"
                  ].includes(state)) value = east;

                  else if ([
                    "Maharashtra","Gujarat","Goa","Madhya Pradesh","Chhattisgarh"
                  ].includes(state)) value = west;

                  return {
                    fillColor: getColor(value),
                    weight: 1,
                    color: "white",
                    fillOpacity: 0.7
                  };
                }}
              />


            )}


          </MapContainer>
        </div>

        {/* ----------- LEGEND ----------- */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="text-sm text-muted-foreground">
            Sales Intensity:
          </div>

          <div className="flex items-center gap-4">
            {[
              ["Low (0-25%)", "#22c55e"],
              ["Medium (25-50%)", "#eab308"],
              ["High (50-75%)", "#ea580c"],
              ["Highest (75-100%)", "#dc2626"],
            ].map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ---------------- REGION CARDS ---------------- */}
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

              <div className="text-2xl font-bold mb-1">
                ₹{(sales / 1000).toFixed(1)}K
              </div>

              <div className="text-sm text-muted-foreground">
                Sales Intensity: {intensity}%
              </div>

              <div className="mt-3 w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${intensity}%`,
                    backgroundColor: getColor(sales),
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
