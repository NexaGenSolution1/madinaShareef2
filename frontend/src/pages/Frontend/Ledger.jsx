import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import './Ledger.css';

const Ledger = () => {
  const getCurrentYearStart = () => {
    const now = new Date();
    return `${now.getFullYear()}-01-01`;
  };

  const [filters, setFilters] = useState({
    dateFrom: getCurrentYearStart(),
    dateTo: new Date().toISOString().split("T")[0],
  });

  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate totals
  const calculateTotals = () => {
    const debit = ledgerData.reduce((sum, item) => sum + (item.debit || 0), 0);
    const credit = ledgerData.reduce((sum, item) => sum + (item.credit || 0), 0);
    const closingBalance = debit - credit;
    
    return { debit, credit, closingBalance };
  };

  const fetchLedger = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get("/payment/ledger", {
        params: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        },
      });

      if (response.data.success) {
        setLedgerData(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching ledger:", error);
      setError("Failed to fetch ledger data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilter = () => {
    fetchLedger();
  };

  const filteredData = ledgerData.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.voucherId?.toString().includes(search) ||
      item.ticketNumber?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
    );
  });

  const totals = calculateTotals();

  return (
    <div className="ledger-container">
      <div className="ledger-header">
        <h2>Ledger</h2>
        <div className="breadcrumb">
          <span>Home</span> / <span>Ledger</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-inputs">
          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>
          <button className="filter-btn" onClick={handleFilter}>
            Filter
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <label>Search:</label>
        <input
          type="text"
          placeholder="Search by voucher, ticket, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="ledger-table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Voucher Id</th>
                <th>Date</th>
                <th>Ticket #</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.voucherId || "-"}</td>
                    <td>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                    <td>{item.ticketNumber || "-"}</td>
                    <td>{item.description || "-"}</td>
                    <td>{item.debit ? item.debit.toFixed(2) : "0"}</td>
                    <td>{item.credit ? item.credit.toFixed(2) : "0"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="total-label">Total:</td>
                <td className="total-value">{totals.debit.toFixed(2)}</td>
                <td className="total-value">{totals.credit.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Summary */}
      <div className="ledger-summary">
        <div className="summary-item">
          <label>Debit</label>
          <span>{totals.debit.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <label>Credit</label>
          <span>{totals.credit.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <label>Closing Balance</label>
          <span>{totals.closingBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="pagination-info">
        Showing {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of {filteredData.length} entries
      </div>
    </div>
  );
};

export default Ledger;
