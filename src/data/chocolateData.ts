// Types for your actual chocolate consumption data

export interface ChocolateConsumerData {
  age: number;
  gender: string;
  region: string;
  brand_preference: string;
  purchase_frequency: string;
  average_spend_inr: number;
  purchase_channel: string;
  occasion: string;
  mood: string;
  satisfaction_score: number;
}

export interface ProcessedChartData {
  month: string;
  darkChocolate: number;
  milkChocolate: number;
  whiteChocolate: number;
}

export interface KPIData {
  totalConsumption: string;
  popularBrand: string;
  avgSpend: string;
  topRegion: string;
  changes: {
    totalConsumption: string;
    popularBrand: string;
    avgSpend: string;
    topRegion: string;
  };
}

// Data service to load and process your actual dataset
export class ChocolateDataService {
  private static rawData: ChocolateConsumerData[] = [];

  static async loadRawData(): Promise<ChocolateConsumerData[]> {
    if (this.rawData.length > 0) {
      return this.rawData;
    }

    try {
      const response = await fetch('/data/chocolate-data.json');
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      const data = await response.json();
      this.rawData = data;
      return data;
    } catch (error) {
      console.error('Error loading chocolate data:', error);
      return [];
    }
  }


  static async loadConsumptionData(): Promise<ProcessedChartData[]> {
    const data = await this.loadRawData();
    
    // Group by brand preference to create chart data
    const brandData = data.reduce((acc, item) => {
      const brand = item.brand_preference;
      if (!acc[brand]) acc[brand] = 0;
      acc[brand] += item.average_spend_inr;
      return acc;
    }, {} as Record<string, number>);

    // Create monthly trends based on actual data patterns
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const brands = Object.keys(brandData);
    
    return months.map((month, index) => {
      const darkBrands = brands.filter(b => b.includes('Dark') || b.includes('Amul'));
      const milkBrands = brands.filter(b => b.includes('Dairy') || b.includes('KitKat') || b.includes('5 Star'));
      const premiumBrands = brands.filter(b => b.includes('Ferrero') || b.includes('Toblerone'));
      
      return {
        month,
        darkChocolate: darkBrands.reduce((sum, brand) => sum + (brandData[brand] || 0), 0) / 12,
        milkChocolate: milkBrands.reduce((sum, brand) => sum + (brandData[brand] || 0), 0) / 12,
        whiteChocolate: premiumBrands.reduce((sum, brand) => sum + (brandData[brand] || 0), 0) / 12,
      };
    });
  }

    static async loadKPIData(): Promise<KPIData> {
    const data = await this.loadRawData();

    if (data.length === 0) {
      return {
        totalConsumption: "0",
        popularBrand: "N/A",
        avgSpend: "₹0",
        topRegion: "N/A",
        changes: {
          totalConsumption: "0%",
          popularBrand: "0%",
          avgSpend: "0%",
          topRegion: "0%"
        }
      };
    }

    // 1️⃣ Total rows = Excel rows
    const totalConsumption = data.length.toString();

    // 2️⃣ Average spend from Excel
    const avgSpendValue =
      data.reduce((sum, row) => sum + row.average_spend_inr, 0) / data.length;

    // 3️⃣ Popular brand from Excel
    const brandCount: Record<string, number> = {};
    data.forEach(row => {
      brandCount[row.brand_preference] =
        (brandCount[row.brand_preference] || 0) + 1;
    });
    const popularBrand = Object.keys(brandCount).reduce((a, b) =>
      brandCount[a] > brandCount[b] ? a : b
    );

    // 4️⃣ Top region from Excel
    const regionCount: Record<string, number> = {};
    data.forEach(row => {
      regionCount[row.region] =
        (regionCount[row.region] || 0) + 1;
    });
    const topRegion = Object.keys(regionCount).reduce((a, b) =>
      regionCount[a] > regionCount[b] ? a : b
    );

    return {
      totalConsumption,
      popularBrand,
      avgSpend: `₹${Math.round(avgSpendValue)}`,
      topRegion,
      changes: {
        totalConsumption: "+0%",
        popularBrand: "+0%",
        avgSpend: "+0%",
        topRegion: "+0%"
      }
    };
  }


  // CSV parser for your data format
  static parseCSV(csvText: string): ChocolateConsumerData[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const item: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'age' || header === 'average_spend_inr' || header === 'satisfaction_score') {
          item[header] = parseFloat(value) || 0;
        } else {
          item[header] = value || '';
        }
      });
      
      return item as ChocolateConsumerData;
    }).filter(item => item.age > 0);
  }
}