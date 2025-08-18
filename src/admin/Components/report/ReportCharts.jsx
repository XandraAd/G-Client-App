import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler // Add this import
} from "chart.js";

// Register all required plugins
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler // Register the Filler plugin
);

const ReportChart = ({ data = [], loading }) => {
  // Prepare chart data from API response
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: "Learners",
        data: data.map(item => item.learners),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: {
          target: 'origin', // Proper fill configuration
          above: 'rgba(59, 130, 246, 0.1)'
        },
      },
      {
        label: "Revenue ($)",
        data: data.map(item => item.revenue),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: {
          target: 'origin',
          above: 'rgba(16, 185, 129, 0.1)'
        },
      },
     
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Format numbers with commas
              label += context.parsed.y.toLocaleString();
              // Add $ for revenue
              if (context.dataset.label === "Revenue ($)") {
                label += ' USD';
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-80 flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-80 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ReportChart;
