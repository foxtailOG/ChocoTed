import { motion } from "motion/react";
import { Search, Calendar, MapPin, Bell, Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onMenuToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function DashboardHeader({ onMenuToggle, isDark, onThemeToggle }: HeaderProps) {
  const [selectedRegion, setSelectedRegion] = useState("Global");
  const [selectedDate, setSelectedDate] = useState("Last 12 Months");

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
              className="pl-10 pr-4 py-2 w-80 rounded-xl bg-muted/50 border border-border/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Date filter */}
          <div className="relative hidden lg:block">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last 12 Months</option>
              <option>Year to Date</option>
              <option>All Time</option>
            </select>
          </div>

          {/* Region selector */}
          <div className="relative hidden lg:block">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option>Global</option>
              <option>North America</option>
              <option>Europe</option>
              <option>Asia Pacific</option>
              <option>Latin America</option>
              <option>Middle East</option>
              <option>Africa</option>
            </select>
          </div>

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

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary hover:scale-105 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary hover:scale-105 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm">
              JD
            </div>
            <span className="text-sm hidden xl:block">John Doe</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
