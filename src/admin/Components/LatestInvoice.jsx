import React from "react";

const LatestInvoice = ({ invoices,users }) => {
   // Create a map of userId -> updated user data
  const userMap = users
    ? users.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {})
    : {};

  // Sort invoices by date to get the latest ones
  const latestInvoices = invoices
    .sort((a, b) => {
      const dateA = a.createdAt || a.date || a.timestamp;
      const dateB = b.createdAt || b.date || b.timestamp;
      return new Date(dateB) - new Date(dateA);
    })
    .slice(0, 4);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format amount function
  const formatAmount = (amount, currency = "GHS") => {
    const amountNum = typeof amount === 'number' ? amount : parseFloat(amount || 0);
    return `${currency} ${amountNum.toFixed(2)}`;
  };

  // Get customer name from various possible fields
 // ✅ Always get the latest name from users collection
  const getCustomerName = (invoice) => {
    const user = userMap[invoice.userId]; // link by userId
    if (user) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Unknown";
    }
    return (
      invoice.learnerName ||
      invoice.customerName ||
      invoice.userName ||
      invoice.name ||
      "Unknown Customer"
    );
  };

  // Get customer email from various possible fields
  const getCustomerEmail = (invoice) => {
    const user = userMap[invoice.userId];
    if (user) return user.email || "No email";
    return (
      invoice.learnerEmail ||
      invoice.customerEmail ||
      invoice.email ||
      "No email"
    );
  };

  return (
   <div className="bg-white p-6 rounded shadow-md w-full mx-auto min-h-[400px]">
  <p className="mb-2 font-semibold text-[20px] ml-2 sm:ml-6">
    Latest Invoice
  </p>
  <hr className="w-[90%] text-gray-300 mx-auto mb-8 h-[1px]" />

  {/* Labels Row */}
  <div
    className="grid grid-cols-3 px-4 py-2 text-xs sm:text-sm lg:text-[12px] font-medium uppercase"
    style={{ color: "#7F7E83" }}
  >
    <span>Customer</span>
    <span className="text-center">Amount</span>
    <span className="text-center">Status</span>
  </div>

  {/* Invoice Rows */}
  <div className="space-y-2.5 h-[200px] overflow-y-auto">
    {latestInvoices.length === 0 ? (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No invoices found</p>
      </div>
    ) : (
      latestInvoices.map((invoice, index) => {
        const bgColor = index % 2 === 0 ? "bg-white" : "bg-gray-50";

        // Get status color
        let statusColor = "bg-gray-100 text-gray-800";
        if (invoice.status === "paid") {
          statusColor = "bg-green-100 text-green-800";
        } else if (invoice.status === "pending") {
          statusColor = "bg-yellow-100 text-yellow-800";
        } else if (invoice.status === "overdue") {
          statusColor = "bg-red-100 text-red-800";
        }

        return (
          <div
            key={invoice.id || invoice.reference || index}
            className={`grid grid-cols-3 items-center px-4 py-3 shadow ${bgColor} rounded-lg`}
          >
            {/* Customer */}
            <div className="truncate">
              <p className="text-sm font-semibold">{getCustomerName(invoice)}</p>
              <p className="text-xs text-gray-500 truncate">
                {getCustomerEmail(invoice)}
              </p>
            </div>

            {/* Amount */}
            <p className="text-sm font-semibold text-gray-700 text-center">
              {formatAmount(invoice.amount, invoice.currency)}
            </p>

            {/* Status */}
            <span
              className={`text-xs px-4 py-1 border rounded-full block text-center ${statusColor}`}
            >
              {invoice.status || "unknown"}
            </span>
          </div>
        );
      })
    )}
  </div>

  {/* Summary */}
  {latestInvoices.length > 0 && (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-sm text-gray-600 text-center sm:text-left">
          Showing {latestInvoices.length} of {invoices.length} invoices
        </p>
        <p className="text-sm font-semibold text-center sm:text-right">
          Total:{" "}
          {formatAmount(
            latestInvoices.reduce(
              (sum, inv) => sum + parseFloat(inv.amount || 0),
              0
            ),
            latestInvoices[0]?.currency || "GHS"
          )}
        </p>
      </div>
    </div>
  )}
</div>

  );
};

export default LatestInvoice;