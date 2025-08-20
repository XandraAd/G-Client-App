import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChart = ({ invoices, learners, tracks }) => {
  // Process invoice data to get monthly revenues
  const getMonthlyRevenues = () => {
    // Group invoices by month and sum their amounts
    const monthlyRevenues = {};
    
    invoices.forEach(invoice => {
      if (invoice.createdAt && invoice.amount) {
        const date = new Date(invoice.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthYear = `${month} ${year}`;
        const amount = Number(invoice.amount) || 0;
        
        if (monthlyRevenues[monthYear]) {
          monthlyRevenues[monthYear] += amount;
        } else {
          monthlyRevenues[monthYear] = amount;
        }
      }
    });
    
    // Get the last 6 months with year
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      months.push(`${month} ${year}`);
    }
    
    // Create revenue array for the last 6 months
    const revenues = months.map(month => monthlyRevenues[month] || 0);
    
    return { months, revenues };
  };

  const { months, revenues } = getMonthlyRevenues();
  
  // Calculate max revenue and adjust segment size based on data
  const maxRevenue = Math.max(...revenues, 1000);
  const segmentSize = maxRevenue > 10000 ? 10000 : 1000; // Use larger segments for large values
  const segmentCount = Math.ceil(maxRevenue / segmentSize);
  
  // Generate colors - we'll reuse them if we need more segments
  const baseColors = ["#c9ddff", "#8cb4fa", "#4784ee", "#256fff", "#005cff", "#0038a4"];
  const colors = [];
  
  for (let i = 0; i < segmentCount; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  // Helper to get how much of a segment should be filled
  const getSegmentValue = (total, segmentIndex) => {
    const base = segmentIndex * segmentSize;
    const remaining = total - base;
    return Math.max(0, Math.min(remaining, segmentSize));
  };

  // Helper to know if it's the top segment for that bar
  const isTopSegment = (total, segmentIndex) => {
    const nextBase = (segmentIndex + 1) * segmentSize;
    return total <= nextBase;
  };

  const datasets = colors.map((color, i) => ({
    label: segmentSize === 1000 ? `${i + 1}k` : `₵${((i + 1) * segmentSize / 1000).toLocaleString()}k`,
    data: revenues.map((value) => getSegmentValue(value, i)),
    backgroundColor: color,
    stack: "stack1",
    barPercentage: 0.8,
    borderRadius: revenues.map((value) =>
      isTopSegment(value, i) ? { topLeft: 8, topRight: 8 } : 0
    ),
    borderSkipped: false,
  }));

  const data = {
    labels: months,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return value > 0 ? `₵${value.toLocaleString()}` : '';
          },
          footer: (tooltipItems) => {
            // Calculate total for this bar
            const dataIndex = tooltipItems[0].dataIndex;
            const total = revenues[dataIndex];
            return `Total: ₵${total.toLocaleString()}`;
          }
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: segmentSize,
          callback: (v) => v > 0 ? `₵${(v / 1000).toLocaleString()}k` : '',
        },
        max: Math.ceil(maxRevenue / segmentSize) * segmentSize,
        grid: { display: false },
      },
    },
  };

  // Debug logs to see what's happening
  console.log("Revenues:", revenues);
  console.log("Max Revenue:", maxRevenue);
  console.log("Segment Size:", segmentSize);
  console.log("Segment Count:", segmentCount);

  // If no revenue data, show a message
  if (revenues.every(revenue => revenue === 0)) {
    return (
      <div className="bg-white p-6 rounded shadow-md w-full mx-auto min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow-md w-full mx-auto min-h-[400px]"
      style={{ textColor: "#615E83" }}>
      <p className="flex items-center mb-2 font-semibold text-[20px] ml-6">Recent Revenue</p>
      <hr className="w-[90%] text-gray-300 ml-6 mb-8 h-4" />
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;