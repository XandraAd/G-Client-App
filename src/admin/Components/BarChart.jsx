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

const BarChart = () => {
  const revenues = [4000, 3000, 6000, 3000, 3000, 3000];

  const colors = ["#c9ddff", "#8cb4fa", "#4784ee", "#256fff", "#005cff", "#0038a4",];

  // Helper to get how much of a segment should be filled
  const getSegmentValue = (total, segmentIndex) => {
    const base = segmentIndex * 1000;
    const remaining = total - base;
    return remaining > 0 ? Math.min(remaining, 1000) : undefined;
  };

  // Helper to know if it's the top segment for that bar
  const isTopSegment = (total, segmentIndex) => {
    const nextBase = (segmentIndex + 1) * 1000;
    return total <= nextBase;
  };

  const datasets = colors.map((color, i) => ({
    label: `${i + 1}k`,
    data: revenues.map((value) => getSegmentValue(value, i)),
    backgroundColor: color,
    stack: "stack1",
    barPercentage:0.8,
    borderRadius: revenues.map((value) =>
      isTopSegment(value, i) ? { topLeft: 8, topRight: 8 } : 0
    ),
 borderSkipped: revenues.map((value) =>
  isTopSegment(value, i) ? false : "start"
),
  }));

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = revenues[ctx.dataIndex];
            return `$${total.toLocaleString()}`;
          },
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
          stepSize: 1000,
          callback: (v) => `${v / 1000}k`,
        },
        max: 6000,
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full  mx-auto min-h-[400px] "
     style={{textColor:"#615E83"}}>
      <p className="flex items-center mb-2 font-semibold text-[20px] ml-6" >Recent  Revenue</p>
      <hr className="w-[90%] text-gray-300 ml-6 mb-8 h-4" />
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;

