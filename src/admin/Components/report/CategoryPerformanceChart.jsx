import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CategoryPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">No category data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: "Courses Published",
        data: data.map(item => item.courses),
        backgroundColor: "rgba(99, 102, 241, 0.7)", // Indigo-500 with transparency
        borderRadius: 6,
      }
    ]
  };

  const options = {
    indexAxis: "y", // Horizontal bar chart
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Category Performance",
        font: { size: 16 }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CategoryPerformanceChart;
