import { useState } from "react";
import { Moon, Sun, Download, Trash2, Database, Shield } from "lucide-react";

export function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleExportData = () => {
    const link = document.createElement('a');
    link.href = '/data/chocolate-data.json';
    link.download = 'chocolate-data-backup.json';
    link.click();
  };

  const handleClearCache = () => {
    localStorage.clear();
    alert('Cache cleared successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your dashboard preferences</p>
      </div>

      {/* Appearance */}
      <div className="bg-card rounded-xl p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Moon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Appearance</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-card rounded-xl p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Data Management</h2>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Download className="w-5 h-5 text-primary" />
            <div className="text-left">
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground">Download current dataset as JSON</div>
            </div>
          </button>
          
          <button
            onClick={handleClearCache}
            className="w-full flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
            <div className="text-left">
              <div className="font-medium">Clear Cache</div>
              <div className="text-sm text-muted-foreground">Remove all cached data and preferences</div>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-card rounded-xl p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">About</h2>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Records</span>
            <span className="font-medium">794 consumers</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
