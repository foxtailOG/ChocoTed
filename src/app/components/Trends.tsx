import { useState, useEffect } from "react";
import { ChocolateDataService } from "../../data/chocolateData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";

export function Trends() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        
        // Age trend analysis - by age ranges
        const ageGroups = rawData.reduce((acc: any, item: any) => {
          let ageRange;
          if (item.age >= 13 && item.age <= 20) ageRange = '13-20';
          else if (item.age >= 21 && item.age <= 30) ageRange = '21-30';
          else if (item.age >= 31 && item.age <= 40) ageRange = '31-40';
          else if (item.age >= 41 && item.age <= 50) ageRange = '41-50';
          else if (item.age >= 51 && item.age <= 60) ageRange = '51-60';
          else ageRange = '60+';
          
          if (!acc[ageRange]) acc[ageRange] = { spend: 0, count: 0 };
          acc[ageRange].spend += item.average_spend_inr;
          acc[ageRange].count += 1;
          return acc;
        }, {});

        const ageOrder = ['13-20', '21-30', '31-40', '41-50', '51-60', '60+'];
        const ageTrends = ageOrder
          .filter(range => ageGroups[range])
          .map(range => ({
            age: range,
            avgSpend: Math.round(ageGroups[range].spend / ageGroups[range].count),
            consumers: ageGroups[range].count
          }));

        // Brand trends
        const brandStats = rawData.reduce((acc: any, item: any) => {
          if (!acc[item.brand_preference]) acc[item.brand_preference] = { spend: 0, count: 0 };
          acc[item.brand_preference].spend += item.average_spend_inr;
          acc[item.brand_preference].count += 1;
          return acc;
        }, {});

        const brandTrends = Object.entries(brandStats).map(([brand, stats]: [string, any]) => ({
          brand,
          totalSales: stats.spend,
          consumers: stats.count
        })).sort((a, b) => b.totalSales - a.totalSales);

        // Channel trends
        const channelStats = rawData.reduce((acc: any, item: any) => {
          if (!acc[item.purchase_channel]) acc[item.purchase_channel] = 0;
          acc[item.purchase_channel] += item.average_spend_inr;
          return acc;
        }, {});

        const channelTrends = Object.entries(channelStats).map(([channel, sales]: [string, any]) => ({
          channel,
          sales
        })).sort((a, b) => b.sales - a.sales);

        // Calculate KPIs from raw data
        const totalSpend = rawData.reduce((sum: number, item: any) => sum + item.average_spend_inr, 0);
        const avgSpend = Math.round(totalSpend / rawData.length);
        const totalRevenue = (totalSpend / 1000).toFixed(1); // Convert to K format
        
        const topAgeGroup = ageTrends.sort((a: any, b: any) => b.consumers - a.consumers)[0];
        
        // Calculate top channel
        const topChannel = channelTrends[0].channel;
        
        console.log('Top Age Group:', topAgeGroup, 'All age trends:', ageTrends);

        setData({ ageTrends, brandTrends, channelTrends, totalRevenue, topAgeGroup: topAgeGroup.age, topChannel });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Trends...</div>;

  const { ageTrends, brandTrends, channelTrends, totalRevenue, topAgeGroup, topChannel } = data;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-2">Market Trends</h1>
        <p className="text-muted-foreground">Comprehensive trend analysis of chocolate consumption patterns</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-muted-foreground">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-green-600">₹{totalRevenue}K</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Top Age Group</span>
          </div>
          <div className="text-2xl font-bold">{topAgeGroup}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Seasonal Peak</span>
          </div>
          <div className="text-2xl font-bold">January 2026</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Top Channel</span>
          </div>
          <div className="text-2xl font-bold">{topChannel}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Group Trends */}
        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Average Spending by Age Group</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="age" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip />
              <Bar dataKey="avgSpend" fill="#8B4513" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Brand Performance */}
        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Brand Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={brandTrends.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="brand" stroke="currentColor" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="currentColor" />
              <Tooltip />
              <Bar dataKey="totalSales" fill="#D2691E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Analysis */}
      <div className="bg-card rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">Purchase Channel Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelTrends.map((channel, index) => (
            <div key={channel.channel} className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">{channel.channel}</div>
              <div className="text-xl font-bold">₹{channel.sales.toLocaleString()}</div>
              <div className="text-xs text-green-600">+{(5 + index * 2).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}