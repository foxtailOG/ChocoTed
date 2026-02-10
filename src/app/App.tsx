import { useState, useEffect } from "react";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { KPICards } from "./components/KPICards";
import { ConsumptionChart } from "./components/ConsumptionChart";
import { FlavorChart } from "./components/FlavorChart";
import { BrandChart } from "./components/BrandChart";
import { AIInsights } from "./components/AIInsights";
import { RegionalHeatmap } from "./components/RegionalHeatmap";
import { ConsumerInsights } from "./components/ConsumerInsights";
import { BrandAnalysis } from "./components/BrandAnalysis";
import { RegionalSpending } from "./components/RegionalSpending";
import { SalesHeatmap } from "./components/SalesHeatmap";
import { Trends } from "./components/Trends";
import { Forecast } from "./components/Forecast";
import ChocolateTable from "./components/ChocolateTable";
import { ChocolateDataService, ChocolateConsumerData } from "../data/chocolateData";

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [customerData, setCustomerData] = useState<ChocolateConsumerData[]>([]);
  const [loading, setLoading] = useState(true);

  /* Dark mode */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  /* Fetch data from JSON */
  useEffect(() => {
    fetchCustomerData();
  }, []);

  async function fetchCustomerData() {
    try {
      const data = await ChocolateDataService.loadRawData();
      setCustomerData(data);
    } catch (err) {
      console.error("Data loading error:", err);
      setCustomerData([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading data…</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "consumer-insights":
        return <ConsumerInsights />;
      case "sales-heatmap":
        return <SalesHeatmap />;
      case "trends":
        return <Trends />;
      case "forecast":
        return <Forecast />;
      default:
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl tracking-tight mb-2">
                Chocolate Trend Consumption Analyzer
              </h1>
              <p className="text-muted-foreground">
                Real-time analytics from chocolate consumption data
              </p>
            </div>

            <KPICards data={customerData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="lg:col-span-2">
                <ConsumptionChart />
              </div>
              <BrandAnalysis />
              <RegionalSpending />
            </div>

            <div className="mb-6">
              <RegionalHeatmap
                onNavigate={setCurrentPage}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FlavorChart />
              <BrandChart />
              <AIInsights />
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">
                Customer Data Table
              </h2>
              <ChocolateTable data={customerData} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <div className={isSidebarCollapsed ? "ml-20" : "ml-64"}>
        <DashboardHeader
          onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />

        <main className="p-6 max-w-[1800px] mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
