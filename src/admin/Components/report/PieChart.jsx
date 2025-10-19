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

const PieChart = ({ invoices = [] }) => {
  console.log("📈 PieChart received invoices:", invoices);

  // ✅ Process invoice data for the chart
  const processInvoiceData = (invoices) => {
    if (!invoices || invoices.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#9CA3AF'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      };
    }

    // ✅ Calculate status distribution
    const statusData = invoices.reduce((acc, invoice) => {
      const status = invoice.status?.toLowerCase() || 'unknown';

      let finalStatus = 'Unknown';
      if (status.includes('paid') || status === 'completed' || status === 'success') {
        finalStatus = 'Paid';
      } else if (status.includes('pending') || status === 'processing') {
        finalStatus = 'Pending';
      } else if (status.includes('overdue') || status.includes('failed') || status === 'expired') {
        finalStatus = 'Overdue';
      }

      acc[finalStatus] = (acc[finalStatus] || 0) + 1;
      return acc;
    }, {});

    console.log("📊 Processed status data:", statusData);

    // ✅ Ensure consistent order
    const statusOrder = ['Paid', 'Pending', 'Overdue', 'Unknown'];
    const labels = statusOrder;
    const data = statusOrder.map(status => statusData[status] || 0);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#10B981', // Paid - green
          '#F59E0B', // Pending - amber  
          '#EF4444', // Overdue - red
          '#9CA3AF'  // Unknown - gray
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 8
      }]
    };
  };

  const chartData = processInvoiceData(invoices);

  // ✅ Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} invoice${value !== 1 ? 's' : ''} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '0%'
  };

  // ✅ Totals for display
  const totalInvoices = invoices.length;
  const paidValue = invoices
    .filter(inv => inv.status?.toLowerCase().includes('paid') || inv.status?.toLowerCase() === 'completed')
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  const pendingValue = invoices
    .filter(inv => inv.status?.toLowerCase().includes('pending') || inv.status?.toLowerCase() === 'processing')
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  const overdueValue = invoices
    .filter(inv => inv.status?.toLowerCase().includes('overdue') || inv.status?.toLowerCase().includes('failed') || inv.status?.toLowerCase() === 'expired')
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  const totalValue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Invoice Status Distribution</h3>
          <p className="text-sm text-gray-500 mt-1">
            Real-time overview of all invoices (paid, pending, overdue)
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700">
            {totalInvoices} total
          </div>
          <div className="text-xs text-green-600">
            {paidValue.toLocaleString('en-US', { style: 'currency', currency: 'GHS' })} paid
          </div>
        </div>
      </div>
      
      <div className="h-64">
        {invoices.length > 0 ? (
          <Pie data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No invoice data available</p>
              <p className="text-sm mt-1">Invoices will appear here once created</p>
            </div>
          </div>
        )}
      </div>

      {invoices.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="text-center">
              <div className="font-semibold text-gray-700">Total Value</div>
              <div className="text-green-700 font-medium">
                GHS {totalValue.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">Paid</div>
              <div className="text-green-600 font-medium">
                GHS {paidValue.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">Pending</div>
              <div className="text-amber-600 font-medium">
                GHS {pendingValue.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">Overdue</div>
              <div className="text-red-600 font-medium">
                GHS {overdueValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChart;
