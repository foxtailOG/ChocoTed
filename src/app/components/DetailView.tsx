import { useEffect, useState } from "react";
import { ChocolateDataService } from "../../data/chocolateData";
import { ArrowLeft, TrendingUp, Users, DollarSign, ShoppingCart } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DetailViewProps {
  searchData: any;
  onBack: () => void;
}

export function DetailView({ searchData, onBack }: DetailViewProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetailedAnalytics = async () => {
      const rawData = await ChocolateDataService.loadRawData();
      
      let filteredData = rawData;
      if (searchData.data?.brand) {
        filteredData = rawData.filter(d => d.brand_preference === searchData.data.brand);
      } else if (searchData.data?.region) {
        filteredData = rawData.filter(d => d.region === searchData.data.region);
      }

      const totalRevenue = filteredData.reduce((sum, item) => sum + item.average_spend_inr, 0);
      const totalConsumers = filteredData.length;
      const avgSpend = Math.round(totalRevenue / totalConsumers);

      // Region breakdown
      const regionStats = filteredData.reduce((acc: any, item) => {
        if (!acc[item.region]) acc[item.region] = 0;
        acc[item.region] += item.average_spend_inr;
        return acc;
      }, {});
      const regionData = Object.entries(regionStats).map(([region, revenue]) => ({ region, revenue }));

      // Age breakdown
      const ageStats = filteredData.reduce((acc: any, item) => {
        let range;
        if (item.age >= 13 && item.age <= 20) range = '13-20';
        else if (item.age >= 21 && item.age <= 30) range = '21-30';
        else if (item.age >= 31 && item.age <= 40) range = '31-40';
        else if (item.age >= 41 && item.age <= 50) range = '41-50';
        else if (item.age >= 51 && item.age <= 60) range = '51-60';
        else range = '60+';
        if (!acc[range]) acc[range] = 0;
        acc[range] += 1;
        return acc;
      }, {});
      const ageData = Object.entries(ageStats).map(([age, count]) => ({ age, count }));

      // Gender breakdown
      const genderStats = filteredData.reduce((acc: any, item) => {
        if (!acc[item.gender]) acc[item.gender] = 0;
        acc[item.gender] += 1;
        return acc;
      }, {});
      const genderData = Object.entries(genderStats).map(([gender, count]) => ({ gender, count }));

      // Channel breakdown
      const channelStats = filteredData.reduce((acc: any, item) => {
        if (!acc[item.purchase_channel]) acc[item.purchase_channel] = 0;
        acc[item.purchase_channel] += item.average_spend_inr;
        return acc;
      }, {});
      const channelData = Object.entries(channelStats).map(([channel, revenue]) => ({ channel, revenue }));

      // Brand breakdown
      const brandStats = filteredData.reduce((acc: any, item) => {
        if (!acc[item.brand_preference]) acc[item.brand_preference] = 0;
        acc[item.brand_preference] += item.average_spend_inr;
        return acc;
      }, {});
      const brandData = Object.entries(brandStats)
        .map(([brand, revenue]) => ({ brand, revenue }))
        .sort((a: any, b: any) => b.revenue - a.revenue);

      setAnalytics({ totalRevenue, totalConsumers, avgSpend, regionData, ageData, genderData, channelData, brandData });
      setLoading(false);
    };

    loadDetailedAnalytics();
  }, [searchData]);

  if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

  const COLORS = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C'];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Search
      </button>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-2">{searchData.title} - Detailed Analytics</h1>
        <p className="text-muted-foreground">{searchData.description}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold">₹{(analytics.totalRevenue / 1000).toFixed(1)}K</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Consumers</span>
          </div>
          <div className="text-2xl font-bold">{analytics.totalConsumers}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Average Spend</span>
          </div>
          <div className="text-2xl font-bold">₹{analytics.avgSpend}</div>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Market Share</span>
          </div>
          <div className="text-2xl font-bold">{searchData.data?.percentage || 'N/A'}%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {searchData.data?.region && (
          <div className="bg-card rounded-xl p-6 border">
            <h3 className="text-lg font-semibold mb-4">Brand Performance in {searchData.data.region}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.brandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8B4513" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">{searchData.data?.brand ? 'Revenue by Region' : 'Revenue Distribution'}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#8B4513" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#D2691E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analytics.genderData} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={80} label>
                {analytics.genderData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Revenue by Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analytics.channelData} dataKey="revenue" nameKey="channel" cx="50%" cy="50%" outerRadius={80} label>
                {analytics.channelData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Brand Analysis Table for Regions */}
      {searchData.data?.region && analytics.brandData.length > 0 && (
        <div className="bg-card rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">Top Brands in {searchData.data.region}</h3>
          <div className="space-y-3">
            {analytics.brandData.map((brand: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                <div>
                  <span className="font-semibold">{brand.brand}</span>
                  <span className="text-xs text-muted-foreground ml-2">#{index + 1}</span>
                </div>
                <span className="text-lg font-bold text-primary">₹{(brand.revenue / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
