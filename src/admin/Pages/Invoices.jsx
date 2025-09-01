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
    <div className="container mx-auto px-4 py-6">
      <h4 className="mt-4 text-xl font-semibold md:mt-6 md:text-2xl">Manage Invoices</h4>
      <p className="text-gray-400 text-base font-normal md:text-lg">
        Filter, sort, and access detailed invoices
      </p>

      <div className="flex flex-col gap-4 my-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-1/2">
          <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search invoice..."
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full"
          />
        </div>
        <button
          onClick={() => setIsAddInvoiceModalOpen(true)}
          className="bg-[#01589A] text-white py-2 px-4 rounded-xl capitalize text-base font-semibold w-full sm:w-auto"
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
        className="rounded-lg p-4 w-11/12 max-w-md mx-auto mt-10 outline-none relative sm:p-6"
        contentLabel="Add New Invoice"
        overlayClassName="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50"
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

      <section className="py-4 min-h-full mb-6 md:py-6 md:mb-10">
        {/* Table headers - hidden on mobile, shown on larger screens */}
        <div className="hidden sm:grid sm:grid-cols-6 text-sm font-medium text-gray-600 mb-2 px-2 md:px-4">
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
          <div className="space-y-3 md:space-y-4">
            {paginatedInvoices.map((invoice) => {
             const latestName =
  (nameCache[invoice.userId] &&
   `${nameCache[invoice.userId].firstName || ""} ${nameCache[invoice.userId].lastName || ""}`.trim()) ||
  invoice.learnerName ||
  "—";


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
                  className="grid grid-cols-1 gap-3 p-4 shadow-sm rounded-lg bg-white hover:shadow-md transition sm:grid-cols-6 sm:gap-0 sm:items-center sm:px-2 sm:py-3 md:px-4"
                >
                  {/* Mobile view label-value pairs */}
                  <div className="sm:hidden grid grid-cols-2 gap-2">
                    <p className="font-medium text-gray-600">Learner:</p>
                    <p className="text-gray-800 font-semibold">{latestName}</p>
                    
                    <p className="font-medium text-gray-600">Email:</p>
                    <p className="text-gray-600">{invoice.email || invoice.learnerEmail || "—"}</p>
                    
                    <p className="font-medium text-gray-600">Date:</p>
                    <p className="text-gray-500">{formatDate(invoice.createdAt)}</p>
                    
                    <p className="font-medium text-gray-600">Amount:</p>
                    <p className="text-gray-700">{amountDisplay}</p>
                    
                    <p className="font-medium text-gray-600">Status:</p>
                    <span className={`text-sm font-medium rounded px-2 py-1 inline-block w-fit ${statusClass}`}>
                      {invoice.status || "pending"}
                    </span>
                    
                    <p className="font-medium text-gray-600">Actions:</p>
                    <div className="flex gap-2">
                      <FiEdit2
                        className="text-green-700 text-[20px] p-1 rounded-full hover:bg-green-100 cursor-pointer"
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setSelectedInvoice(invoice);
                          handleEdit(invoice);
                        }}
                      />
                      <MdDeleteOutline
                        className="text-red-600 text-[20px] p-1 rounded-full hover:bg-red-100 cursor-pointer"
                        onClick={() => handleDelete(invoice.id)}
                      />
                    </div>
                  </div>

                  {/* Desktop view */}
                  <div className="hidden sm:block text-gray-800 font-semibold truncate">
                    {latestName}
                  </div>
                  <div className="hidden sm:block text-center text-sm text-gray-600 truncate px-1">
                    {invoice.email || invoice.learnerEmail || "—"}
                  </div>
                  <div className="hidden sm:block text-center text-sm text-gray-500">
                    {formatDate(invoice.createdAt)}
                  </div>
                  <div className="hidden sm:block text-center text-sm text-gray-700">
                    {amountDisplay}
                  </div>
                  <div className="hidden sm:flex sm:justify-center">
                    <span className={`text-sm font-medium rounded px-2 py-1 ${statusClass}`}>
                      {invoice.status || "pending"}
                    </span>
                  </div>
                  <div className="hidden sm:flex sm:justify-center sm:gap-2">
                    <FiEdit2
                      className="text-green-700 text-[20px] p-1 rounded-full hover:bg-green-100 cursor-pointer"
                      onClick={() => {
                        setIsEditModalOpen(true);
                        setSelectedInvoice(invoice);
                      }}
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
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
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
              // Show limited page numbers on mobile
              if (window.innerWidth < 640 && 
                  Math.abs(page - currentPage) > 1 && 
                  page !== 1 && 
                  page !== totalPages) {
                if (Math.abs(page - currentPage) === 2) {
                  return <span key={page} className="px-1">...</span>;
                }
                return null;
              }
              
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
    </div>
  );
};

export default Invoices;

