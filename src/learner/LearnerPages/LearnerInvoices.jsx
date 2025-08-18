// src/learner/LearnerPages/LearnerInvoices.js
import React from "react";

export default function LearnerInvoices() {
  const invoices = [
    { id: 1, date: "2025-03-15", amount: 350, status: "Paid" },
    { id: 2, date: "2025-03-15", amount: 750, status: "Paid" },
    { id: 3, date: "2025-03-15", amount: 950, status: "Paid" },
  ];

  return (
    <div>
      <h2 className="font-bold mb-4">Past Invoices</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="border p-2">{inv.id}</td>
              <td className="border p-2">{inv.date}</td>
              <td className="border p-2">${inv.amount}</td>
              <td className="border p-2">{inv.status}</td>
              <td className="border p-2">
                <button className="text-blue-600">👁</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
