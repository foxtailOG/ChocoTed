# 🍫 ChocoTed - Chocolate Trend Analytics 

<div align="center">

![Chocolate Analytics](https://img.shields.io/badge/Analytics-Chocolate-8B4513?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

**An interactive analytics dashboard for visualizing chocolate consumption trends across India**

[Live Demo](#) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage)

</div>

---

## 📊 Overview

ChocoTed is a comprehensive analytics platform that transforms chocolate consumption data into actionable insights. Built with modern web technologies, it provides real-time visualizations, AI-powered insights, and interactive heatmaps to understand consumer behavior patterns across different regions of India.

## ✨ Features

### 🎯 Core Analytics
- **Real-time KPI Dashboard** - Track key metrics including total consumers, average spending, and top brands
- **Consumer Insights** - Deep dive into demographics, age groups, and purchasing patterns
- **Regional Analysis** - Interactive heatmaps showing sales intensity across North, South, East, and West regions
- **Trend Analysis** - Visualize consumption trends over time with dynamic charts

### 📈 Advanced Visualizations
- **Interactive Charts** - Bar charts, line charts, pie charts, and scatter plots using Recharts
- **Sales Heatmap** - Color-coded regional performance indicators
- **Brand Performance** - Comprehensive brand analysis with sales and spending metrics
- **Behavioral Insights** - Purchase frequency, mood-based purchases, and occasion analysis

### 🤖 AI-Powered Features
- **Auto-generated Insights** - Smart recommendations based on data patterns
- **Predictive Analytics** - Forecast future trends and seasonal peaks
- **Market Intelligence** - Automated analysis of consumer preferences

### 🎨 Modern UI/UX
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered transitions
- **Glassmorphism Effects** - Modern, elegant design language

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS, CSS Variables |
| **Charts** | Recharts, Custom SVG |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Data** | JSON, Custom Data Service |

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/foxtailOG/ChocoTed.git
cd ChocoTed
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

5. **Preview production build**
```bash
npm run preview
```

## 📱 Usage

### Navigation
- **Dashboard** - Overview of key metrics and trends
- **Trends** - Market trends and growth analysis
- **Consumer Insights** - Detailed consumer behavior analysis
- **Sales Heatmap** - Regional performance visualization
- **Forecast** - Predictive analytics and future trends

### Key Metrics
- **Total Revenue**: ₹850.6K
- **Total Consumers**: 794
- **Average Spend**: ₹1,071 per consumer
- **Top Age Group**: 21-30 years
- **Top Channel**: Local Shop
- **Seasonal Peak**: January 2026

## 📂 Project Structure

```
ChocoTed/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── AIInsights.tsx
│   │   │   ├── BehavioralInsights.tsx
│   │   │   ├── BrandAnalysis.tsx
│   │   │   ├── ConsumerInsights.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── Forecast.tsx
│   │   │   ├── Trends.tsx
│   │   │   └── ui/
│   │   └── App.tsx
│   ├── data/
│   │   ├── chocolateData.ts
│   │   └── chocolate-data.json
│   ├── styles/
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   └── main.tsx
├── public/
│   └── data/
│       └── chocolate-data.json
├── package.json
├── vite.config.ts
└── README.md
```

## 🎨 Features Breakdown

### Dashboard
- KPI cards with real-time metrics
- Consumption trends chart
- Brand performance analysis
- Regional spending visualization
- AI-powered insights panel

### Consumer Insights
- **Overview Tab**: Age group analysis, regional spending, gender distribution
- **Behavioral Tab**: Purchase frequency, occasion analysis, mood-based purchases

### Trends Page
- Total revenue tracking
- Top age group identification
- Seasonal peak analysis
- Top purchase channel
- Age-based spending patterns
- Brand performance trends

### Forecast
- Interactive India heatmap
- Regional sales intensity
- Color-coded performance indicators
- Hover tooltips with detailed stats

## 🔧 Configuration

### Theme Customization
Edit `src/styles/theme.css` to customize colors and styling:
```css
:root {
  --primary: #8B4513;
  --gold: #D4A574;
  /* Add your custom colors */
}
```

### Data Source
Update `public/data/chocolate-data.json` with your own dataset following the schema:
```json
{
  "age": 25,
  "gender": "Male",
  "region": "North",
  "brand_preference": "Cadbury",
  "average_spend_inr": 1200,
  "purchase_frequency": "Weekly",
  "occasion": "Birthday",
  "mood": "Happy",
  "satisfaction_score": 4.5,
  "purchase_channel": "Online"
}
```

## 📊 Data Insights

The dashboard analyzes **794 consumers** across **4 regions** with:
- 8+ chocolate brands
- 11+ purchase occasions
- 4 purchase channels
- Age range: 13-60+ years

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vishnu Chaudhary**
- GitHub: [@foxtailOG](https://github.com/foxtailOG)

## 🙏 Acknowledgments

- Data visualization powered by [Recharts](https://recharts.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ and 🍫**

⭐ Star this repo if you find it helpful!

</div>
