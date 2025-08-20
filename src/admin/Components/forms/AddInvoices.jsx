import React, { useState, useEffect } from "react";
import axios from "axios";

const AddInvoices = ({ onClose, refreshInvoices, existingInvoice, isEditing }) => {
  const [learners, setLearners] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    userId: existingInvoice?.userId || "",
    email: existingInvoice?.learnerEmail || "",
    learnerName:existingInvoice?.learnerName || "",
    amount: existingInvoice?.amount || "",
     currency: existingInvoice?.currency || "GHS",
    dueDate: existingInvoice?.dueDate || "",
    items: existingInvoice?.items || [], // Added items field
    status: existingInvoice?.status || "pending",
    paymentDetails: existingInvoice?.paymentDetails || "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/learners");
        setLearners(res.data);
      } catch (err) {
        console.error("Failed to load learners", err);
      }
    };
    fetchLearners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

    // Handle learner selection to auto-fill email
  const handleLearnerSelect = (e) => {
    const selectedLearnerId = e.target.value;
    const selectedLearner = learners.find(learner => learner.id === selectedLearnerId);
    
    if (selectedLearner) {
      setInvoiceData(prev => ({
        ...prev,
        userId: selectedLearnerId,
        email: selectedLearner.email
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && existingInvoice?.id) {
        await axios.put(`http://localhost:5000/api/invoices/${existingInvoice.id}`, invoiceData);
        setMessage("✅ Invoice updated!");
      } else {
        await axios.post("http://localhost:5000/api/invoices", invoiceData);
        setMessage("✅ Invoice added!");
      }
      refreshInvoices?.();
      onClose();
    } catch (err) {
      console.error("Error saving invoice:", err);
      setMessage("❌ Failed to save invoice");
    }
  };

  return (
    <div className="w-full max-w-md h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden relative">
      <div className="h-full overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isEditing ? "Edit Invoice" : "Add New Invoice"}
          </h2>

          {/* Select Learner */}
          <label className="block">
            <span className="text-sm text-gray-700 font-medium mb-1 block">Select Learner</span>
            <select
              name="userId"
              value={invoiceData.userId}
              onChange={handleLearnerSelect}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a learner</option>
              {learners.map((learner) => (
                <option key={learner.id} value={learner.id}>
                  {learner.learnerName || learner.email}
                </option>
              ))}
            </select>
          </label>

          {/* Amount */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Amount</span>
            <input
              type="number"
              name="amount"
              value={invoiceData.amount}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </label>

          {/* Due Date */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Due Date</span>
            <input
              type="date"
              name="dueDate"
              value={invoiceData.dueDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </label>

          {/* Status Dropdown */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              name="status"
              value={invoiceData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </label>

          {/* Payment Details */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Payment Details</span>
            <textarea
              name="paymentDetails"
              value={invoiceData.paymentDetails}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. PayPal, MTN Mobile Money"
            />
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? "Update Invoice" : "Create Invoice"}
          </button>

          {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddInvoices;

