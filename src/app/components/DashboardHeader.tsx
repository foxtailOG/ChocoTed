import { motion } from "motion/react";
import { Search, Menu, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { ChocolateDataService } from "../../data/chocolateData";

interface HeaderProps {
  onMenuToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onNavigate: (page: string) => void;
  onSearchDetail: (data: any) => void;
}

interface SearchResult {
  title: string;
  description: string;
  category: string;
  page: string;
  data?: any;
}

export function DashboardHeader({ onMenuToggle, isDark, onThemeToggle, onNavigate, onSearchDetail }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const rawData = await ChocolateDataService.loadRawData();
      
      // Calculate analytics
      const totalConsumers = rawData.length;
      const totalRevenue = rawData.reduce((sum, item) => sum + item.average_spend_inr, 0);
      const avgSpend = Math.round(totalRevenue / totalConsumers);
      
      // Brand analytics
      const brandRevenue = rawData.reduce((acc: any, item) => {
        if (!acc[item.brand_preference]) acc[item.brand_preference] = 0;
        acc[item.brand_preference] += item.average_spend_inr;
        return acc;
      }, {});
      
      const brandCounts = rawData.reduce((acc: any, item) => {
        acc[item.brand_preference] = (acc[item.brand_preference] || 0) + 1;
        return acc;
      }, {});
      
      // Region analytics
      const regionStats = rawData.reduce((acc: any, item) => {
        if (!acc[item.region]) acc[item.region] = { count: 0, revenue: 0 };
        acc[item.region].count++;
        acc[item.region].revenue += item.average_spend_inr;
        return acc;
      }, {});
      
      // Age group analytics
      const ageGroups = rawData.reduce((acc: any, item) => {
        let range;
        if (item.age >= 13 && item.age <= 20) range = '13-20';
        else if (item.age >= 21 && item.age <= 30) range = '21-30';
        else if (item.age >= 31 && item.age <= 40) range = '31-40';
        else if (item.age >= 41 && item.age <= 50) range = '41-50';
        else if (item.age >= 51 && item.age <= 60) range = '51-60';
        else range = '60+';
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {});
      
      // Channel analytics
      const channelStats = rawData.reduce((acc: any, item) => {
        acc[item.purchase_channel] = (acc[item.purchase_channel] || 0) + 1;
        return acc;
      }, {});
      
      setAnalyticsData({
        totalConsumers,
        totalRevenue,
        avgSpend,
        brands: brandCounts,
        brandRevenue,
        regions: regionStats,
        ageGroups,
        channels: channelStats,
        rawData
      });
    };
    
    loadAnalytics();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim() || !analyticsData) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    const results: SearchResult[] = [];
    const q = query.toLowerCase();
    
    // Search in brands
    Object.entries(analyticsData.brands).forEach(([brand, count]: [string, any]) => {
      if (brand.toLowerCase().includes(q)) {
        const brandRevenue = analyticsData.rawData
          .filter((d: any) => d.brand_preference === brand)
          .reduce((sum: number, d: any) => sum + d.average_spend_inr, 0);
        results.push({
          title: brand,
          description: `${count} consumers (${((count / analyticsData.totalConsumers) * 100).toFixed(1)}%) • Revenue: ₹${(brandRevenue / 1000).toFixed(1)}K`,
          category: "Brand",
          page: "dashboard",
          data: { brand, count, revenue: brandRevenue, percentage: ((count / analyticsData.totalConsumers) * 100).toFixed(1) }
        });
      }
    });
    
    // Search in regions
    Object.entries(analyticsData.regions).forEach(([region, stats]: [string, any]) => {
      if (region.toLowerCase().includes(q)) {
        results.push({
          title: `${region} Region`,
          description: `${stats.count} consumers • Revenue: ₹${(stats.revenue / 1000).toFixed(1)}K • Avg: ₹${Math.round(stats.revenue / stats.count)}`,
          category: "Region",
          page: "forecast",
          data: { region, count: stats.count, revenue: stats.revenue, avgSpend: Math.round(stats.revenue / stats.count) }
        });
      }
    });
    
    // Search in age groups
    Object.entries(analyticsData.ageGroups).forEach(([age, count]: [string, any]) => {
      if (age.includes(q) || 'age'.includes(q)) {
        results.push({
          title: `Age ${age}`,
          description: `${count} consumers (${((count / analyticsData.totalConsumers) * 100).toFixed(1)}%)`,
          category: "Age Group",
          page: "consumer-insights"
        });
      }
    });
    
    // Search in channels
    Object.entries(analyticsData.channels).forEach(([channel, count]: [string, any]) => {
      if (channel.toLowerCase().includes(q)) {
        results.push({
          title: channel,
          description: `${count} purchases (${((count / analyticsData.totalConsumers) * 100).toFixed(1)}%)`,
          category: "Channel",
          page: "trends"
        });
      }
    });
    
    // General analytics keywords
    if ('revenue'.includes(q) || 'total'.includes(q)) {
      results.push({
        title: "Total Revenue",
        description: `₹${(analyticsData.totalRevenue / 1000).toFixed(1)}K from ${analyticsData.totalConsumers} consumers`,
        category: "Analytics",
        page: "trends"
      });
    }
    
    if ('average'.includes(q) || 'spend'.includes(q)) {
      results.push({
        title: "Average Spend",
        description: `₹${analyticsData.avgSpend} per consumer`,
        category: "Analytics",
        page: "consumer-insights"
      });
    }
    
    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trends, brands, regions..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-10 pr-4 py-2 w-80 rounded-xl bg-muted/50 border border-border/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-[500px] overflow-y-auto z-50">
                <div className="p-3 border-b border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground">{searchResults.length} results found</p>
                </div>
                <div className="max-h-[450px] overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSearchDetail(result);
                        setShowResults(false);
                        setSearchQuery("");
                      }}
                      className="w-full px-4 py-4 hover:bg-muted transition-colors border-b border-border/50 last:border-0 text-left cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-base group-hover:text-primary transition-colors">{result.title}</span>
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{result.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {showResults && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-4 z-50">
                <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2.5 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary hover:scale-105 transition-all"
            title={isDark ? "Switch to Light Cream Mode" : "Switch to Dark Cocoa Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedResult(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedResult.title}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{selectedResult.category}</span>
              </div>
              <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Overview</h3>
                <p className="text-lg leading-relaxed">{selectedResult.description}</p>
              </div>
              
              {selectedResult.data && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Detailed Information</h3>
                  {Object.entries(selectedResult.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-semibold">{typeof value === 'number' && value > 1000 ? `₹${(value as number).toLocaleString()}` : String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onSearchDetail(selectedResult);
                    setSelectedResult(null);
                    setSearchQuery("");
                  }}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  View Detailed Analytics
                </button>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="px-6 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}
