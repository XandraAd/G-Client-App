// src/learner/LearnerPages/LearnerInvoices.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../../admin/Config/Firebase";

export default function LearnerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [selectedInvoice, setSelectedInvoice] = useState(null);
  const learnerId = auth.currentUser?.uid; 
   const learnerName = auth.currentUser?.displayName || "—";


  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`http://localhost:5000/api/invoices/${learnerId}`);
        if (Array.isArray(res.data)) {
          setInvoices(res.data);
          console.log("Fetching invoices for learnerId:", learnerId);
          console.log("Invoices data:", res.data);
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
                 {inv.createdAt
    ? new Date(inv.createdAt._seconds * 1000).toLocaleDateString()
    : "—"}
                </td>
                <td className="border p-2">
                  {inv.currency === "GHS"
                    ? `₵${inv.amount}`
                    : `$${inv.amount}`}
                </td>
                <td className="border p-2">{inv.status}</td>
                <td className="border p-2">
                  <button onClick={() => setSelectedInvoice(inv)} className="text-blue-600">👁</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      


     {/* Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
              onClick={() => setSelectedInvoice(null)}
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-4">Invoice Details</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Reference:</span>{" "}
                {selectedInvoice.reference || "N/A"}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {selectedInvoice.createdAt
                  ? new Date(selectedInvoice.createdAt._seconds * 1000).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <span className="font-medium">Amount:</span>{" "}
                {selectedInvoice.currency === "GHS"
                  ? `₵${selectedInvoice.amount}`
                  : `$${selectedInvoice.amount}`}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {selectedInvoice.status}
              </p>
              <p>
                <span className="font-medium">Paid At:</span>{" "}
                {selectedInvoice.paidAt
                  ? new Date(selectedInvoice.paidAt._seconds * 1000).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <span className="font-medium">Learner:</span>{" "}
                {auth.currentUser?.displayName || "—"}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
