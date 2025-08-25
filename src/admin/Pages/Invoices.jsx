// src/admin/Pages/Invoices.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { CiSearch } from "react-icons/ci";
import AddInvoices from "../Components/forms/AddInvoices";
import ReactModal from "react-modal";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";

const db = getFirestore();

function toMillis(anyDate) {
  if (!anyDate) return 0;
  if (typeof anyDate === "number") return anyDate;
  // Firestore Timestamp-like
  if (anyDate._seconds) return anyDate._seconds * 1000;
  if (anyDate.seconds) return anyDate.seconds * 1000;
  if (typeof anyDate.toDate === "function") return anyDate.toDate().getTime();
  // ISO/string
  const t = new Date(anyDate).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function formatDate(anyDate) {
  const ms = toMillis(anyDate);
  return ms ? new Date(ms).toLocaleDateString() : "—";
}

function formatAmountDisplay(amount, currency) {
  const n = typeof amount === "number" ? amount : parseFloat(amount || 0);
  const c = currency || "GHS";
  if (Number.isNaN(n)) return "—";
  return c === "GHS" ? `GHS ${n.toFixed(2)}` : `$${n.toFixed(2)}`;
}

const Invoices = () => {
  const [query, setQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [nameCache, setNameCache] = useState({}); // userId -> latest name

  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🔹 Resolve latest learner name from Firestore users/{userId}
  const fetchAndCacheName = async (userId) => {
    if (!userId) return "—";
    if (nameCache[userId]) return nameCache[userId];
    try {
      const snap = await getDoc(doc(db, "users", userId));
      let name = "—";
      if (snap.exists()) {
        const d = snap.data() || {};
        name =
          d.displayName ||
          [d.firstName, d.lastName].filter(Boolean).join(" ").trim() ||
          d.learnerName ||
          "—";
      }
      setNameCache((p) => ({ ...p, [userId]: name }));
      return name;
    } catch (e) {
      console.error("Error fetching user name:", e);
      return "—";
    }
  };

  const preloadNames = (invList) => {
    // Kick off fetches in the background (no await needed)
    const ids = Array.from(
      new Set(invList.map((i) => i.userId).filter(Boolean))
    );
    ids.forEach((id) => {
      if (!nameCache[id]) fetchAndCacheName(id);
    });
  };

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("/api/invoices");
      const list = Array.isArray(res.data) ? res.data : [];

      // Robust sort by createdAt (handles timestamp object or string)
      const sorted = [...list].sort(
        (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)
      );

      setInvoices(sorted);
      setFilteredInvoices(sorted);
      preloadNames(sorted);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]);
      setFilteredInvoices([]);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value.trim().toLowerCase();
    setQuery(q);

    const result = invoices.filter((inv) => {
      const latestName = nameCache[inv.userId] || inv.learnerName || "";
      return (
        latestName.toLowerCase().includes(q) ||
        inv.email?.toLowerCase().includes(q) ||
        inv.status?.toLowerCase().includes(q)
      );
    });

    setFilteredInvoices(result);
    setCurrentPage(1);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (invoiceId) => {
    try {
      await axios.delete(`http://localhost:5000/api/invoices/${invoiceId}`);
      const updated = invoices.filter((inv) => inv.id !== invoiceId);
      setInvoices(updated);
      setFilteredInvoices(updated);
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };

  return (
    <>
      <h4 className="mt-10 text-[24px] font-semibold">Manage Invoices</h4>
      <p className="text-gray-400 text-[18px] font-normal">
        Filter, sort, and access detailed invoices
      </p>

      <div className="flex items-center justify-between gap-2 my-4">
        <CiSearch className="absolute left-[17px] lg:left-[250px] xl:left-[430px] top-[13.5rem] lg:top-[11.5rem] transform -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search invoice..."
          className="border border-gray-300 pl-6 lg:pl-12 py-2 rounded-lg w-1/2 max-w-md"
        />
        <button
          onClick={() => setIsAddInvoiceModalOpen(true)}
          className="bg-[#01589A] text-white h-10 w-[30%] rounded-xl capitalize text-[16px] font-semibold leading-[20px]"
        >
          + Add Invoice
        </button>
      </div>

      <ReactModal
        isOpen={isAddInvoiceModalOpen || isEditModalOpen}
        onRequestClose={() => {
          setIsAddInvoiceModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
        }}
        className="rounded-lg p-6 w-full max-w-md mx-auto mt-20 outline-none relative"
        contentLabel="Add New Invoice"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <AddInvoices
          onClose={() => {
            setIsAddInvoiceModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedInvoice(null);
          }}
          refreshInvoices={fetchInvoices}
          existingInvoice={selectedInvoice}
          isEditing={isEditModalOpen}
        />
      </ReactModal>

      <section className="py-6 min-h-full mb-10">
        <div className="grid grid-cols-6 text-sm font-medium text-gray-600 mb-2 px-4">
          <p>Learner</p>
          <p className="text-center">Email Address</p>
          <p className="text-center">Date</p>
          <p className="text-center">Amount</p>
          <p className="text-center">Status</p>
          <p className="text-center">Actions</p>
        </div>

        {filteredInvoices.length === 0 ? (
          <p className="text-gray-500 mt-6 text-center">
            No matching invoices found.
          </p>
        ) : (
          <div className="space-y-4">
            {paginatedInvoices.map((invoice) => {
              const latestName = nameCache[invoice.userId] || invoice.learnerName || "—";
              const amountDisplay =
                invoice.amountDisplay ||
                formatAmountDisplay(invoice.amount, invoice.currency);

              let statusClass = "";
              if (invoice.status === "Paid") statusClass = "bg-green-100 text-green-800";
              else if (invoice.status === "Overdue") statusClass = "bg-red-100 text-red-800";
              else statusClass = "bg-yellow-100 text-yellow-800";

              return (
                <div
                  key={invoice.id}
                  className="grid grid-cols-6 items-center px-4 py-3 shadow-sm rounded-lg bg-white hover:shadow-md transition"
                >
                  {/* Learner Name (live) */}
                  <div className="text-gray-800 font-semibold">
                    {latestName}
                  </div>

                  {/* Email */}
                  <div className="text-center text-sm text-gray-600">
                    {invoice.email || invoice.learnerEmail || "—"}
                  </div>

                  {/* Date */}
                  <div className="text-center text-sm text-gray-500">
                    {formatDate(invoice.createdAt)}
                  </div>

                  {/* Amount */}
                  <div className="text-center text-sm text-gray-700">
                    {amountDisplay}
                  </div>

                  {/* Status */}
                  <div className="flex justify-center">
                    <span className={`text-sm font-medium rounded px-2 py-1 ${statusClass}`}>
                      {invoice.status || "pending"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-2">
                    <FiEdit2
                      className="text-green-700 text-[20px] p-1 rounded-full hover:bg-green-100 cursor-pointer"
                      onClick={() => setIsEditModalOpen(true) || setSelectedInvoice(invoice)}
                    />
                    <MdDeleteOutline
                      className="text-red-600 text-[20px] p-1 rounded-full hover:bg-red-100 cursor-pointer"
                      onClick={() => handleDelete(invoice.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-blue-600 border-blue-500 hover:bg-blue-50"
              }`}
            >
              ← Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium border ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-blue-600 border-blue-500 hover:bg-blue-50"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default Invoices;

