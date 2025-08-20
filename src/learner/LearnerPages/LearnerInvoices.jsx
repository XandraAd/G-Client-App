// src/learner/LearnerPages/LearnerInvoices.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LearnerInvoices({ learnerId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`http://localhost:5000/api/invoices/${learnerId}`);
        if (Array.isArray(res.data)) {
          setInvoices(res.data);
        } else {
          setInvoices([]);
        }
      } catch (err) {
        console.error("Fetch invoices error:", err);
        setError("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    if (learnerId) {
      fetchInvoices();
    }
  }, [learnerId]);

  return (
    <div>
      <h2 className="font-bold mb-4">Past Invoices</h2>

      {loading && <p className="text-gray-500">Loading invoices…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && invoices.length === 0 && (
        <p className="text-gray-500">No invoices found.</p>
      )}

      {!loading && invoices.length > 0 && (
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
            {invoices.map((inv, i) => (
              <tr key={inv.reference || i}>
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">
                  {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="border p-2">
                  {inv.currency === "GHS"
                    ? `₵${inv.amount}`
                    : `$${inv.amount}`}
                </td>
                <td className="border p-2">{inv.status}</td>
                <td className="border p-2">
                  <button className="text-blue-600">👁</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
