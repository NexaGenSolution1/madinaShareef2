import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
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
      setFetching(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem('frontend_user'));
      const userId = user?._id || user?.id;
      
      if (!userId) {
        setError('User not authenticated. Please login again.');
        setFetching(false);
        return;
      }
      
      const response = await axiosInstance.get(`/payment/ledger/${userId}`, {
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
      setInitialLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: getCurrentYearStart(),
      dateTo: new Date().toISOString().split("T")[0],
    });
    setSearchTerm("");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (type) => {
    try {
      const user = JSON.parse(localStorage.getItem('frontend_user'));
      const userId = user?._id || user?.id;
      const userName = user?.name || 'User';
      
      if (type === 'copy') {
        const tableData = filteredData.map(entry => 
          `${entry.voucherId || '-'}\t${entry.date ? new Date(entry.date).toLocaleDateString() : '-'}\t${entry.ticketNumber || '-'}\t${entry.description || '-'}\t${entry.debit > 0 ? entry.debit.toFixed(2) : ''}\t${entry.credit > 0 ? entry.credit.toFixed(2) : ''}`
        ).join('\n');
        
        const header = 'Voucher Id\tDate\tTicket #\tDescription\tDebit\tCredit\n';
        const totals = `\nTotal\t\t\t\t${calculateTotals().debit.toFixed(2)}\t${calculateTotals().credit.toFixed(2)}`;
        const fullText = `Ledger of ${userName.toUpperCase()}\nFrom ${filters.dateFrom} To ${filters.dateTo}\n\n${header}${tableData}${totals}`;
        
        await navigator.clipboard.writeText(fullText);
        alert('Table data copied to clipboard!');
        return;
      }

      const exportUrl = `/payment/ledger/${userId}/export/${type}`;
      
      const response = await axiosInstance.get(exportUrl, {
        params: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          userName,
        },
        responseType: 'blob',
      });

      if (response.headers['content-type']?.includes('application/json')) {
        const reader = new FileReader();
        const errorText = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsText(response.data);
        });
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Export failed');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = type === 'csv' ? 'csv' : type === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `ledger-${userName}-${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting as ${type}:`, error);
      alert(`Failed to export as ${type.toUpperCase()}. ${error.message || ''}`);
    }
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

  if (initialLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ledger...</p>
        </div>
      </div>
    );
  }

  if (error && ledgerData.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchLedger}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen mx-auto">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          nav, aside, header, footer, .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white !important; }
          .print-title { color: #dc2626 !important; font-size: 18pt !important; margin-bottom: 8pt !important; font-weight: bold !important; }
          .print-date-range { color: #16a34a !important; font-size: 11pt !important; margin-bottom: 16pt !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 10pt !important; }
          thead { display: table-header-group !important; background: #1f2937 !important; -webkit-print-color-adjust: exact !important; }
          thead th { background: #1f2937 !important; color: white !important; padding: 8pt 4pt !important; }
          tbody td { padding: 6pt 4pt !important; border-bottom: 1px solid #e5e7eb !important; }
          tfoot { background: #f3f4f6 !important; -webkit-print-color-adjust: exact !important; }
          tfoot td { background: #f3f4f6 !important; font-weight: bold !important; padding: 8pt 4pt !important; }
          .print-only { display: block !important; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ledger</h1>
        <p className="text-gray-600">View and manage your financial ledger</p>
      </div>

      {/* Print Title - Only visible in print */}
      <div className="print-only" style={{ display: 'none' }}>
        <h2 className="print-title">
          LEDGER OF {JSON.parse(localStorage.getItem('frontend_user') || '{}')?.name?.toUpperCase() || 'USER'}
        </h2>
        <p className="print-date-range">
          From {new Date(filters.dateFrom).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} To {new Date(filters.dateTo).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Date Range & Export</h3>
          <button
            onClick={resetFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2 no-print">
          <button
            onClick={() => handleExport('copy')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Copy
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by voucher, ticket, or description..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {fetching && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-linear-to-r from-[#1e3a5f] to-[#2d5a8f]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Voucher Id
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Ticket #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Credit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No ledger entries found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.voucherId || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.ticketNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.description || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {item.debit ? item.debit.toFixed(2) : ""}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {item.credit ? item.credit.toFixed(2) : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr className="border-t-2 border-gray-300">
                <td colSpan="4" className="px-4 py-3 text-sm font-bold text-right text-gray-900">
                  Total:
                </td>
                <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">
                  {totals.debit.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">
                  {totals.credit.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Total Debit</div>
          <div className="text-2xl font-bold text-blue-600">{totals.debit.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Total Credit</div>
          <div className="text-2xl font-bold text-green-600">{totals.credit.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Closing Balance</div>
          <div className={`text-2xl font-bold ${totals.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totals.closingBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Showing {filteredData.length} of {ledgerData.length} entries
      </div>
    </div>
  );
};

export default Ledger;
