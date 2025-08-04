import React, { useState, useEffect } from "react";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import AddInvoices from "../Components/forms/AddInvoices";
import ReactModal from "react-modal";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";

const Invoices = () => {
  const [query, setQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [invoices, setInvoices] = useState([]);
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

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/invoices");
      const sorted = res.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setInvoices(sorted);
      setFilteredInvoices(sorted);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleChange = (e) => {
    const searchQuery = e.target.value.trim().toLowerCase();
    setQuery(searchQuery);

    const result = invoices.filter((inv) => {
      return (
        inv.learnerName?.toLowerCase().includes(searchQuery) ||
        inv.email?.toLowerCase().includes(searchQuery)
      );
    });

    setFilteredInvoices(result);
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
          onChange={handleChange}
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
        isOpen={isAddInvoiceModalOpen}
        onRequestClose={() => setIsAddInvoiceModalOpen(false)}
        className="rounded-lg p-6 w-full max-w-md mx-auto mt-20 outline-none relative"
        contentLabel="Add New Invoice"
        overlayClassName="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50"
      >
        <AddInvoices
          onClose={() => setIsAddInvoiceModalOpen(false)}
          refreshInvoices={fetchInvoices}
        />
      </ReactModal>

      <ReactModal
        isOpen={isEditModalOpen}
        onRequestClose={() => {
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
        }}
        className="rounded-lg p-6 w-full max-w-md mx-auto mt-20 outline-none relative"
        contentLabel="Edit Invoice"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <AddInvoices
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedInvoice(null);
          }}
          refreshInvoices={fetchInvoices}
          existingInvoice={selectedInvoice}
          isEditing={true}
        />
      </ReactModal>

      <section className="py-6 min-h-full mb-10">
        <div className="grid grid-cols-6 text-sm font-medium text-gray-600 mb-2 px-4">
          <p>Learner</p>
          <p className="text-center">Email Address</p>
          <p className="text-center">Due Date</p>
          <p className="text-center">Amount</p>
          <p className="text-center">Status</p>
  <p className="text-center"></p>          
          
        </div>

        {filteredInvoices.length === 0 ? (
          <p className="text-gray-500 mt-6 text-center">
            No matching invoices found.
          </p>
        ) : (
          <div className="space-y-4">
            {paginatedInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="grid grid-cols-5 items-center px-4 py-3 shadow-sm rounded-lg bg-white hover:shadow-md transition"
              >
                <div className="text-gray-800 font-semibold">{invoice.learnerName}</div>
                <div className="text-center text-sm text-gray-600">{invoice.email}</div>
                <div className="text-center text-sm text-gray-500">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}
                </div>
                <div className="text-center text-sm text-gray-700">${invoice.amount}</div>
                <div className="flex justify-center gap-2">
                  <span className={`text-sm font-medium rounded px-2 py-1 ${
                    invoice.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "Overdue"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {invoice.status}
                  </span>
                  <FiEdit2
                    className="text-green-700 text-[20px] p-1 rounded-full hover:bg-green-100 cursor-pointer"
                    onClick={() => handleEdit(invoice)}
                  />
                  <MdDeleteOutline
                    className="text-red-600 text-[20px] p-1 rounded-full hover:bg-red-100 cursor-pointer"
                    onClick={() => handleDelete(invoice.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 border">
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
