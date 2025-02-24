'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Color Palette (Professional, Aesthetic Colors)

// Function to Generate Gradient Colors
function getGradientColor(ctx: CanvasRenderingContext2D, color: string): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color); // Solid at top
  gradient.addColorStop(1, `${color}80`); // Faded at bottom
  return gradient;
}

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
    }[];
  };
  title: string;
}

export function BarChart({ data, title }: BarChartProps) {
  const enhancedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
     borderColor: "rgba(45, 212, 191, 1)",
      borderWidth: 3,
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(4, 47, 46, 0.9)");  // #042F2E - Deep Teal Green
        gradient.addColorStop(0.5, "rgba(1, 38, 33, 0.7)"); // #012621 - Dark Green
        gradient.addColorStop(1, "rgba(0, 42, 28, 0.6)");   // #002A1C - Forest Green Black
        // Darker teal at the bottom


        return gradient;
      },
      fill: true,
      tension: 1.0,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
      title: {
        display: false,
        text: title,
        font: {
          size: 18,
          weight: 'bold',
        },
        color: 'white',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: 'white',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'white',
        },
      },
    },
  };

  return (
    <div className="p-4 rounded-lg">
      <Bar options={options} data={enhancedData} />
    </div>
  );
}
