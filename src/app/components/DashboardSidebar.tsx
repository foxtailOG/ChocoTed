import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Map, 
  LineChart, 
  FileText, 
  Settings,
  Candy
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true, page: "dashboard" },
  { icon: TrendingUp, label: "Trends", active: false, page: "trends" },
  { icon: Users, label: "Consumer Insights", active: false, page: "consumer-insights" },
  { icon: Map, label: "Sales Heatmap", active: false, page: "sales-heatmap" },
  { icon: LineChart, label: "Forecast", active: false, page: "forecast" },
  { icon: FileText, label: "Reports", active: false, page: "reports" },
  { icon: Settings, label: "Settings", active: false, page: "settings" },
];

export function DashboardSidebar({ isCollapsed, currentPage, onNavigate }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed left-0 top-0 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] z-40 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-[var(--sidebar-border)]">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--sidebar-primary)] to-[var(--gold)] shrink-0">
            <Candy className="w-6 h-6 text-[var(--sidebar-primary-foreground)]" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-[var(--sidebar-foreground)] truncate text-lg">ChocoTed</h2>
              <p className="text-xs text-[var(--sidebar-foreground)]/60">Chocolate Trend Analytics Dashboard</p>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                    : "text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]"
                }`}
                onClick={() => onNavigate(item.page)}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                {!isCollapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );
}