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

const BarChart = ({ invoices }) => {
  if (!invoices || !Array.isArray(invoices)) {
    return (
      <div className="bg-white p-6 rounded shadow-md w-full mx-auto min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Loading revenue data...</p>
      </div>
    );
  }

  // ✅ Convert Firestore timestamps or strings/numbers into JS Date
  const normalizeDate = (rawDate, invoiceId) => {
    if (!rawDate) {
      console.warn(`❌ No date provided for invoice ${invoiceId}`);
      return null;
    }

    try {
      // Handle Firestore Timestamp objects
      if (typeof rawDate === 'object' && rawDate !== null) {
        if (typeof rawDate.toDate === "function") {
          return rawDate.toDate(); // Firestore Timestamp
        }
        if (rawDate.seconds !== undefined) {
          return new Date(rawDate.seconds * 1000);
        }
        if (rawDate._seconds !== undefined) {
          return new Date(rawDate._seconds * 1000);
        }
      }
      
      // Handle strings and numbers
      if (typeof rawDate === "string" || typeof rawDate === "number") {
        // Check if it's a valid timestamp number
        if (typeof rawDate === "number" && rawDate > 0) {
          return new Date(rawDate);
        }
        
        // Check if it's a valid date string
        if (typeof rawDate === "string" && rawDate.trim() !== "") {
          const d = new Date(rawDate);
          // Check if the date is valid
          if (!isNaN(d.getTime())) {
            return d;
          }
        }
        
        console.warn(`❌ Invalid date string/number for invoice ${invoiceId}:`, rawDate);
        return null;
      }
      
      console.warn(`❌ Unknown date format for invoice ${invoiceId}:`, rawDate);
      return null;
    } catch (err) {
      console.warn(`❌ Could not parse date for invoice ${invoiceId}:`, rawDate, err);
      return null;
    }
  };

  const getMonthlyRevenues = (invoices) => {
    const monthlyRevenues = {};

    invoices.forEach((invoice) => {
      // Try multiple possible date fields
      let rawDate = invoice.createdAt || invoice.paidAt || invoice.updatedAt || invoice.date;
      
      // Skip if no date field found
      if (!rawDate) {
        console.warn("⚠️ Skipping invoice with no date field:", invoice.id);
        return;
      }

      const date = normalizeDate(rawDate, invoice.id);

      // Skip if date is invalid or amount is missing
      if (!date || isNaN(date.getTime()) || !invoice.amount) {
        console.warn("⚠️ Skipping invalid payment:", invoice.id);
        return;
      }

      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;
      const amount = parseFloat(invoice.amount) || 0;

      if (amount > 0) {
        monthlyRevenues[monthYear] =
          (monthlyRevenues[monthYear] || 0) + amount;
      }
    });

    // Sort months chronologically
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const months = Object.keys(monthlyRevenues).sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");
      const dateA = new Date(parseInt(yearA), monthNames.indexOf(monthA));
      const dateB = new Date(parseInt(yearB), monthNames.indexOf(monthB));
      return dateA - dateB;
    });

    const revenues = months.map((month) => monthlyRevenues[month]);

    return { months, revenues };
  };

  const { months, revenues } = getMonthlyRevenues(invoices);

  if (revenues.length === 0 || revenues.every((rev) => rev === 0)) {
    return (
      <div className="bg-white p-6 rounded shadow-md w-full mx-auto min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No revenue data available</p>
      </div>
    );
  }

  // --- Chart setup ---
  const maxRevenue = Math.max(...revenues, 1000);
  const segmentSize = maxRevenue > 10000 ? 10000 : 1000;
  const segmentCount = Math.ceil(maxRevenue / segmentSize);

  const baseColors = [
    "#c9ddff",
    "#8cb4fa",
    "#4784ee",
    "#256fff",
    "#005cff",
    "#0038a4",
  ];
  const colors = [];
  for (let i = 0; i < segmentCount; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  const getSegmentValue = (total, segmentIndex) => {
    const base = segmentIndex * segmentSize;
    const remaining = total - base;
    return Math.max(0, Math.min(remaining, segmentSize));
  };

  const isTopSegment = (total, segmentIndex) => {
    const nextBase = (segmentIndex + 1) * segmentSize;
    return total <= nextBase;
  };

  const datasets = colors.map((color, i) => ({
    label:
      segmentSize === 1000
        ? `${(i + 1) * segmentSize} ₵`
        : `₵${(((i + 1) * segmentSize) / 1000).toLocaleString()}k`,
    data: revenues.map((value) => getSegmentValue(value, i)),
    backgroundColor: color,
    stack: "stack1",
    barPercentage: 0.8,
    borderRadius: revenues.map((value) =>
      isTopSegment(value, i) ? { topLeft: 8, topRight: 8 } : 0
    ),
    borderSkipped: false,
  }));

  const data = { labels: months, datasets };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return value > 0 ? `₵${value.toLocaleString()}` : "";
          },
          footer: (tooltipItems) => {
            const dataIndex = tooltipItems[0].dataIndex;
            const total = revenues[dataIndex];
            return `Total: ₵${total.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: segmentSize,
          callback: (v) =>
            v > 0 ? `₵${(v / 1000).toLocaleString()}k` : "",
        },
        max: Math.ceil(maxRevenue / segmentSize) * segmentSize,
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full mx-auto min-h-[400px] text-[#615E83]">
      <p className="flex items-center mb-2 font-semibold text-[20px] ml-6">
        Recent Revenue
      </p>
      <hr className="w-[90%] text-gray-300 ml-6 mb-8 h-[1px]" />
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;