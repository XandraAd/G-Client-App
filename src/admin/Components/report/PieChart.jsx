// Components/report/PieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

const InvoicePieChart = ({ invoices = [] }) => {
  // Calculate status distribution
  const statusData = invoices.reduce((acc, invoice) => {
    const status = invoice.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(statusData),
    datasets: [{
      data: Object.values(statusData),
      backgroundColor: [
       
        '#F59E0B',  // Paid - green
        '#10B981', // Pending - amber
        '#EF4444', // Overdue - red
        '#9CA3AF'  // Unknown - gray
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Invoice Status</h3>
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default InvoicePieChart;
