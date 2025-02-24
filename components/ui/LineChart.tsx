"use client";

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface LineChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            borderColor?: string;
            backgroundColor?: string;
            fill?: boolean;
        }[];
    };
    title: string;
}

export function LineChart({ data, title }: LineChartProps) {
    const enhancedData = {
        ...data,
        datasets: data.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor: (context: any) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;

                // Dark Cyan - Teal gradient
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, "rgba(4, 47, 46, 0.9)");  // #042F2E - Deep Teal Green
                gradient.addColorStop(0.5, "rgba(1, 38, 33, 0.7)"); // #012621 - Dark Green
                gradient.addColorStop(1, "rgba(0, 42, 28, 0.6)");   // #002A1C - Forest Green Black

                return gradient;
            },
            fill: true,
            tension: 0.4, // Smooth curve
        })),
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Hide the legend
                position: "" as const,
                labels: {
                    color: "white", // Legend text in white
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(255, 255, 255, 0.2)", // Subtle white grid
                },
                ticks: {
                    color: "white", // Y-axis labels in white
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "white", // X-axis labels in white
                },
            },
        },
    };

    return (
        <div className="p-4 rounded-lg">
            <Line options={options} data={enhancedData} />
        </div>
    );
}
