import { useState, useEffect } from "react";
import { ChocolateDataService } from "../../data/chocolateData";
import { FileText, Download, TrendingUp, Users, ShoppingBag, Target } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export function Reports() {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await ChocolateDataService.loadRawData();
        
        // Calculate all metrics
        const totalRevenue = rawData.reduce((sum, item) => sum + item.average_spend_inr, 0);
        const totalConsumers = rawData.length;
        const avgSpend = Math.round(totalRevenue / totalConsumers);
        
        // Brand data
        const brandStats = rawData.reduce((acc: any, item) => {
          if (!acc[item.brand_preference]) acc[item.brand_preference] = { revenue: 0, count: 0 };
          acc[item.brand_preference].revenue += item.average_spend_inr;
          acc[item.brand_preference].count += 1;
          return acc;
        }, {});
        
        const brandData = Object.entries(brandStats)
          .map(([brand, stats]: [string, any]) => ({
            brand,
            revenue: stats.revenue,
            consumers: stats.count,
            share: ((stats.revenue / totalRevenue) * 100).toFixed(1)
          }))
          .sort((a, b) => b.revenue - a.revenue);
        
        // Region data
        const regionStats = rawData.reduce((acc: any, item) => {
          if (!acc[item.region]) acc[item.region] = { revenue: 0, count: 0 };
          acc[item.region].revenue += item.average_spend_inr;
          acc[item.region].count += 1;
          return acc;
        }, {});
        
        const regionData = Object.entries(regionStats).map(([region, stats]: [string, any]) => ({
          region,
          revenue: stats.revenue,
          consumers: stats.count,
          avgSpend: Math.round(stats.revenue / stats.count)
        }));
        
        // Channel data
        const channelStats = rawData.reduce((acc: any, item) => {
          if (!acc[item.purchase_channel]) acc[item.purchase_channel] = 0;
          acc[item.purchase_channel] += item.average_spend_inr;
          return acc;
        }, {});
        
        const channelData = Object.entries(channelStats).map(([channel, revenue]: [string, any]) => ({
          channel,
          revenue
        }));
        
        // Age group data
        const ageGroups = rawData.reduce((acc: any, item) => {
          let range;
          if (item.age >= 13 && item.age <= 20) range = '13-20';
          else if (item.age >= 21 && item.age <= 30) range = '21-30';
          else if (item.age >= 31 && item.age <= 40) range = '31-40';
          else if (item.age >= 41 && item.age <= 50) range = '41-50';
          else if (item.age >= 51 && item.age <= 60) range = '51-60';
          else range = '60+';
          
          if (!acc[range]) acc[range] = { count: 0, spend: 0 };
          acc[range].count += 1;
          acc[range].spend += item.average_spend_inr;
          return acc;
        }, {});
        
        const ageOrder = ['13-20', '21-30', '31-40', '41-50', '51-60', '60+'];
        const ageData = ageOrder
          .filter(range => ageGroups[range])
          .map(range => ({
            age: range,
            consumers: ageGroups[range].count,
            avgSpend: Math.round(ageGroups[range].spend / ageGroups[range].count)
          }));
        
        // Gender data
        const genderStats = rawData.reduce((acc: any, item) => {
          if (!acc[item.gender]) acc[item.gender] = 0;
          acc[item.gender] += 1;
          return acc;
        }, {});
        
        const genderData = Object.entries(genderStats).map(([gender, count]) => ({
          gender,
          count
        }));
        
        // Purchase frequency
        const frequencyStats = rawData.reduce((acc: any, item) => {
          if (!acc[item.purchase_frequency]) acc[item.purchase_frequency] = 0;
          acc[item.purchase_frequency] += 1;
          return acc;
        }, {});
        
        const frequencyData = Object.entries(frequencyStats).map(([frequency, count]) => ({
          frequency,
          count
        }));
        
        setReportData({
          totalRevenue,
          totalConsumers,
          avgSpend,
          brandData,
          regionData,
          channelData,
          ageData,
          genderData,
          frequencyData,
          topBrand: brandData[0].brand,
          topRegion: regionData.sort((a: any, b: any) => b.revenue - a.revenue)[0].region
        });
        
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleExport = (format: string) => {
    if (format === 'pdf') {
      // Show loading state
      const button = document.activeElement as HTMLButtonElement;
      if (button) button.textContent = 'Generating PDF...';
      
      setTimeout(() => {
        exportToPDF().finally(() => {
          if (button) button.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Export PDF';
        });
      }, 100);
    } else if (format === 'csv') {
      exportToCSV();
    }
  };

  const captureChart = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return await html2canvas(element, {
      scale: 1.5,
      backgroundColor: '#fff',
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('*').forEach((el: any) => {
          const style = el.style;
          if (style.color?.includes('oklab')) style.color = '#000';
          if (style.backgroundColor?.includes('oklab')) style.backgroundColor = '#fff';
          if (style.borderColor?.includes('oklab')) style.borderColor = '#000';
        });
      }
    });
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('ChocoTed Analytics Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    
    if (activeReport === 'executive') {
      doc.setFontSize(16);
      doc.text('Executive Summary', 14, 45);
      doc.setFontSize(10);
      doc.text(`Total Revenue: Rs ${(reportData.totalRevenue / 1000).toFixed(1)}K`, 14, 55);
      doc.text(`Total Consumers: ${reportData.totalConsumers}`, 14, 62);
      doc.text(`Average Spend: Rs ${reportData.avgSpend}`, 14, 69);
      doc.text(`Top Brand: ${reportData.topBrand}`, 14, 76);
      
      autoTable(doc, {
        startY: 85,
        head: [['Brand', 'Revenue', 'Consumers', 'Market Share']],
        body: reportData.brandData.slice(0, 5).map((brand: any) => [
          brand.brand,
          `Rs ${brand.revenue.toLocaleString()}`,
          brand.consumers,
          `${brand.share}%`
        ]),
      });
    } else if (activeReport === 'sales') {
      doc.setFontSize(16);
      doc.text('Sales Performance Report', 14, 45);
      
      const regionCanvas = await captureChart('region-chart');
      if (regionCanvas) {
        doc.addImage(regionCanvas.toDataURL('image/png'), 'PNG', 14, 55, 180, 80);
      }
      
      autoTable(doc, {
        startY: 145,
        head: [['Region', 'Revenue', 'Consumers', 'Avg Spend']],
        body: reportData.regionData.map((region: any) => [
          region.region,
          `Rs ${region.revenue.toLocaleString()}`,
          region.consumers,
          `Rs ${region.avgSpend}`
        ]),
      });
      
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Top Brands Performance', 14, 20);
      
      const brandCanvas = await captureChart('brand-chart');
      if (brandCanvas) {
        doc.addImage(brandCanvas.toDataURL('image/png'), 'PNG', 14, 30, 180, 80);
      }
      
      autoTable(doc, {
        startY: 120,
        head: [['Brand', 'Revenue', 'Consumers']],
        body: reportData.brandData.slice(0, 6).map((brand: any) => [
          brand.brand,
          `Rs ${brand.revenue.toLocaleString()}`,
          brand.consumers
        ]),
      });
      
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Revenue by Channel', 14, 20);
      
      const channelCanvas = await captureChart('channel-chart');
      if (channelCanvas) {
        doc.addImage(channelCanvas.toDataURL('image/png'), 'PNG', 14, 30, 180, 90);
        
        let yPos = 130;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Channel Performance Analysis:', 14, yPos);
        yPos += 8;
        
        const totalChannelRevenue = reportData.channelData.reduce((sum: number, c: any) => sum + c.revenue, 0);
        reportData.channelData.forEach((channel: any, i: number) => {
          const percentage = ((channel.revenue / totalChannelRevenue) * 100).toFixed(1);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`${i + 1}. ${channel.channel}`, 20, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(`Rs ${(channel.revenue / 1000).toFixed(1)}K (${percentage}% of total)`, 30, yPos + 5);
          yPos += 12;
        });
      }
    } else if (activeReport === 'consumer') {
      doc.setFontSize(16);
      doc.text('Consumer Behavior Report', 14, 45);
      
      const ageCanvas = await captureChart('age-chart');
      if (ageCanvas) {
        doc.addImage(ageCanvas.toDataURL('image/png'), 'PNG', 14, 55, 180, 80);
      }
      
      autoTable(doc, {
        startY: 145,
        head: [['Age Group', 'Consumers', 'Avg Spend']],
        body: reportData.ageData.map((age: any) => [
          age.age,
          age.consumers,
          `Rs ${age.avgSpend}`
        ]),
      });
      
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Gender Distribution', 14, 20);
      
      const genderCanvas = await captureChart('gender-chart');
      if (genderCanvas) {
        doc.addImage(genderCanvas.toDataURL('image/png'), 'PNG', 14, 30, 180, 90);
        
        let yPos = 130;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Gender Distribution Analysis:', 14, yPos);
        yPos += 8;
        
        const totalGender = reportData.genderData.reduce((sum: number, g: any) => sum + g.count, 0);
        reportData.genderData.forEach((gender: any) => {
          const percentage = ((gender.count / totalGender) * 100).toFixed(1);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`${gender.gender}:`, 20, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(`${gender.count} consumers (${percentage}% of total base)`, 30, yPos + 5);
          yPos += 12;
        });
        
        yPos += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Total Consumer Base: ${totalGender} consumers`, 20, yPos);
      }
    }
    
    doc.save(`ChocoTed-${activeReport}-report-${Date.now()}.pdf`);
  };

  const exportToCSV = () => {
    let csvContent = '';
    
    if (activeReport === 'executive') {
      csvContent += 'ChocoTed Executive Summary Report\n\n';
      csvContent += `Generated,${new Date().toLocaleDateString()}\n\n`;
      csvContent += 'Key Metrics\n';
      csvContent += `Total Revenue,Rs ${(reportData.totalRevenue / 1000).toFixed(1)}K\n`;
      csvContent += `Total Consumers,${reportData.totalConsumers}\n`;
      csvContent += `Average Spend,Rs ${reportData.avgSpend}\n`;
      csvContent += `Top Brand,${reportData.topBrand}\n\n`;
      csvContent += 'Brand,Revenue,Consumers,Market Share\n';
      reportData.brandData.slice(0, 5).forEach((brand: any) => {
        csvContent += `${brand.brand},Rs ${brand.revenue},${brand.consumers},${brand.share}%\n`;
      });
    } else if (activeReport === 'sales') {
      csvContent += 'ChocoTed Sales Performance Report\n\n';
      csvContent += 'Region,Revenue,Consumers,Avg Spend\n';
      reportData.regionData.forEach((region: any) => {
        csvContent += `${region.region},Rs ${region.revenue},${region.consumers},Rs ${region.avgSpend}\n`;
      });
      csvContent += '\nBrand,Revenue,Consumers\n';
      reportData.brandData.slice(0, 6).forEach((brand: any) => {
        csvContent += `${brand.brand},Rs ${brand.revenue},${brand.consumers}\n`;
      });
    } else if (activeReport === 'consumer') {
      csvContent += 'ChocoTed Consumer Behavior Report\n\n';
      csvContent += 'Age Group,Consumers,Avg Spend\n';
      reportData.ageData.forEach((age: any) => {
        csvContent += `${age.age},${age.consumers},Rs ${age.avgSpend}\n`;
      });
      csvContent += '\nGender,Count\n';
      reportData.genderData.forEach((gender: any) => {
        csvContent += `${gender.gender},${gender.count}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ChocoTed-${activeReport}-report-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center">Loading Reports...</div>;

  const COLORS = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C'];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl tracking-tight mb-2">Reports</h1>
        <p className="text-muted-foreground">Generate comprehensive analytics reports</p>
      </div>

      {/* Report Cards */}
      {!activeReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setActiveReport('executive')}
            className="bg-card rounded-xl p-6 border hover:border-primary cursor-pointer transition-all hover:scale-105"
          >
            <FileText className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Executive Summary</h3>
            <p className="text-sm text-muted-foreground">Overview of key metrics and performance indicators</p>
          </div>

          <div 
            onClick={() => setActiveReport('sales')}
            className="bg-card rounded-xl p-6 border hover:border-primary cursor-pointer transition-all hover:scale-105"
          >
            <TrendingUp className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sales Performance</h3>
            <p className="text-sm text-muted-foreground">Detailed sales analysis by region, brand, and channel</p>
          </div>

          <div 
            onClick={() => setActiveReport('consumer')}
            className="bg-card rounded-xl p-6 border hover:border-primary cursor-pointer transition-all hover:scale-105"
          >
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Consumer Behavior</h3>
            <p className="text-sm text-muted-foreground">Demographics and purchasing pattern analysis</p>
          </div>
        </div>
      )}

      {/* Executive Summary Report */}
      {activeReport === 'executive' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveReport(null)}
              className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
            >
              ← Back to Reports
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-8 border">
            <h2 className="text-2xl font-bold mb-6">Executive Summary Report</h2>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                <div className="text-2xl font-bold">₹{(reportData.totalRevenue / 1000).toFixed(1)}K</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Consumers</div>
                <div className="text-2xl font-bold">{reportData.totalConsumers}</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Average Spend</div>
                <div className="text-2xl font-bold">₹{reportData.avgSpend}</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Top Brand</div>
                <div className="text-2xl font-bold">{reportData.topBrand}</div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-600">Top Performing Brand</div>
                      <div className="text-sm">{reportData.topBrand} leads with {reportData.brandData[0].share}% market share</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-blue-600">Regional Leader</div>
                      <div className="text-sm">{reportData.topRegion} region generates highest revenue</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-purple-600">Consumer Base</div>
                      <div className="text-sm">{reportData.totalConsumers} active consumers across 4 regions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Brands Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Top 5 Brands Performance</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Brand</th>
                    <th className="text-right p-3">Revenue</th>
                    <th className="text-right p-3">Consumers</th>
                    <th className="text-right p-3">Market Share</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.brandData.slice(0, 5).map((brand: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-3 font-medium">{brand.brand}</td>
                      <td className="p-3 text-right">₹{brand.revenue.toLocaleString()}</td>
                      <td className="p-3 text-right">{brand.consumers}</td>
                      <td className="p-3 text-right">{brand.share}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sales Performance Report */}
      {activeReport === 'sales' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveReport(null)}
              className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
            >
              ← Back to Reports
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-8 border">
            <h2 className="text-2xl font-bold mb-6">Sales Performance Report</h2>

            {/* Regional Performance */}
            <div className="mb-8" id="region-chart">
              <h3 className="text-lg font-semibold mb-4">Revenue by Region</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8B4513" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Brand Performance */}
            <div className="mb-8" id="brand-chart">
              <h3 className="text-lg font-semibold mb-4">Top Brands Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.brandData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="brand" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#D2691E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Channel Performance */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Revenue by Channel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="channel-chart" style={{ width: '400px', height: '300px' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.channelData}
                        dataKey="revenue"
                        nameKey="channel"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {reportData.channelData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {reportData.channelData.map((channel: any, i: number) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{channel.channel}</span>
                        <span className="text-lg font-bold">₹{(channel.revenue / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consumer Behavior Report */}
      {activeReport === 'consumer' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveReport(null)}
              className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
            >
              ← Back to Reports
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-8 border">
            <h2 className="text-2xl font-bold mb-6">Consumer Behavior Report</h2>

            {/* Age Demographics */}
            <div className="mb-8" id="age-chart">
              <h3 className="text-lg font-semibold mb-4">Consumer Distribution by Age</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consumers" fill="#8B4513" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gender Distribution */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="gender-chart" style={{ width: '400px', height: '250px' }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={reportData.genderData}
                        dataKey="count"
                        nameKey="gender"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {reportData.genderData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-3">
                  {reportData.genderData.map((gender: any, i: number) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{gender.gender}</span>
                        <span className="text-lg font-bold">{gender.count} consumers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Purchase Frequency */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Purchase Frequency</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportData.frequencyData.map((freq: any, i: number) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">{freq.frequency}</div>
                    <div className="text-2xl font-bold">{freq.count}</div>
                    <div className="text-xs text-muted-foreground">consumers</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
