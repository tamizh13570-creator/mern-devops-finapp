import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { getCurrentMonthYear, getMonthName } from '../../utils/helpers';

const Reports = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMonth = queryParams.get('monthYear') || getCurrentMonthYear();

  const [monthYear, setMonthYear] = useState(initialMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({ csv: false, pdf: false, json: false });

  useEffect(() => {
    fetchMonthData(monthYear);
  }, [monthYear]);

  const fetchMonthData = async (mYear) => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/summary/${mYear}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Download CSV to Local Disk
  const handleDownloadCSV = async () => {
    setDownloading((prev) => ({ ...prev, csv: true }));
    try {
      const res = await api.get(`/reports/download/csv/${monthYear}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finapp-report-${monthYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download CSV: ' + (err.message || 'Error'));
    } finally {
      setDownloading((prev) => ({ ...prev, csv: false }));
    }
  };

  // 2. Download PDF to Local Disk
  const handleDownloadPDF = async () => {
    setDownloading((prev) => ({ ...prev, pdf: true }));
    try {
      const res = await api.get(`/reports/download/pdf/${monthYear}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finapp-statement-${monthYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF: ' + (err.message || 'Error'));
    } finally {
      setDownloading((prev) => ({ ...prev, pdf: false }));
    }
  };

  // 3. Download JSON to Local Disk
  const handleDownloadJSON = async () => {
    setDownloading((prev) => ({ ...prev, json: true }));
    try {
      const res = await api.get(`/reports/download/json/${monthYear}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finapp-backup-${monthYear}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download JSON: ' + (err.message || 'Error'));
    } finally {
      setDownloading((prev) => ({ ...prev, json: false }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-cloud-arrow-down-fill text-primary me-2"></i>
            Export & Local Disk Downloads
          </h2>
          <p className="text-muted mb-0">
            Download your financial records directly to your local computer disk in CSV, PDF, or JSON formats
          </p>
        </div>

        {/* Month Selector */}
        <div className="d-flex align-items-center gap-2">
          <label className="fw-semibold small text-muted text-nowrap">Select Month:</label>
          <input
            type="month"
            className="form-control fw-bold border shadow-sm"
            style={{ width: '180px' }}
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
          />
        </div>
      </div>

      {/* Prominent Hero Banner with Selected Month Stats */}
      <div className="download-hero-card">
        <div className="row align-items-center">
          <div className="col-lg-7 mb-3 mb-lg-0">
            <span className="badge bg-primary px-3 py-2 rounded-pill mb-2 fw-semibold">
              <i className="bi bi-calendar3 me-1"></i> Statement for {getMonthName(monthYear)}
            </span>
            <h3 className="fw-bold text-white mb-2">Ready to Save to Your Hard Drive</h3>
            <p className="text-white-50 mb-0 small">
              Click any of the download buttons below to export all income, expenses, and category summaries for{' '}
              <strong>{getMonthName(monthYear)}</strong> straight to your local storage.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="d-flex justify-content-lg-end gap-3 flex-wrap">
              <div className="bg-white bg-opacity-10 p-3 rounded-3 text-center" style={{ minWidth: '110px' }}>
                <div className="small text-white-50">Income</div>
                <div className="fw-bold text-success fs-5">₹{data?.totalIncome?.toLocaleString('en-IN') || 0}</div>
              </div>
              <div className="bg-white bg-opacity-10 p-3 rounded-3 text-center" style={{ minWidth: '110px' }}>
                <div className="small text-white-50">Expenses</div>
                <div className="fw-bold text-danger fs-5">₹{data?.totalExpense?.toLocaleString('en-IN') || 0}</div>
              </div>
              <div className="bg-white bg-opacity-10 p-3 rounded-3 text-center" style={{ minWidth: '110px' }}>
                <div className="small text-white-50">Net Savings</div>
                <div className="fw-bold text-warning fs-5">₹{data?.netSavings?.toLocaleString('en-IN') || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THREE PROMINENT DOWNLOAD CARDS (USER REQUIREMENT 3) */}
      <div className="row g-4 mb-5">
        {/* CSV Download Card */}
        <div className="col-12 col-md-4">
          <div className="download-btn-card csv-btn" onClick={handleDownloadCSV}>
            <div className="download-icon-circle bg-success bg-opacity-10 text-success">
              <i className="bi bi-file-earmark-spreadsheet-fill"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">Download CSV Spreadsheet</h5>
            <p className="text-muted small mb-3">
              Excel-compatible raw data with full transaction breakdown, tags & notes
            </p>
            <button className="btn btn-success rounded-pill px-4 py-2 fw-semibold w-100 shadow-sm" disabled={downloading.csv}>
              {downloading.csv ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Exporting to Disk...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i> Save CSV to Disk
                </>
              )}
            </button>
          </div>
        </div>

        {/* PDF Statement Download Card */}
        <div className="col-12 col-md-4">
          <div className="download-btn-card pdf-btn" onClick={handleDownloadPDF}>
            <div className="download-icon-circle bg-danger bg-opacity-10 text-danger">
              <i className="bi bi-file-earmark-pdf-fill"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">Download PDF Statement</h5>
            <p className="text-muted small mb-3">
              Formatted official statement with executive summary, categories & tables
            </p>
            <button className="btn btn-danger rounded-pill px-4 py-2 fw-semibold w-100 shadow-sm" disabled={downloading.pdf}>
              {downloading.pdf ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <i className="bi bi-file-pdf me-2"></i> Save PDF to Disk
                </>
              )}
            </button>
          </div>
        </div>

        {/* JSON Complete Backup Download Card */}
        <div className="col-12 col-md-4">
          <div className="download-btn-card json-btn" onClick={handleDownloadJSON}>
            <div className="download-icon-circle bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-file-earmark-code-fill"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">Download JSON Backup</h5>
            <p className="text-muted small mb-3">
              Structured raw JSON data for developer backups, migrations & archive
            </p>
            <button className="btn btn-primary rounded-pill px-4 py-2 fw-semibold w-100 shadow-sm" disabled={downloading.json}>
              {downloading.json ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving JSON...
                </>
              ) : (
                <>
                  <i className="bi bi-hdd-fill me-2"></i> Save JSON to Disk
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="fin-card">
        <div className="fin-card-header">
          <div>
            <h5 className="fw-bold mb-1">Monthly Data Preview ({getMonthName(monthYear)})</h5>
            <p className="text-muted small mb-0">
              Showing {data?.expenseCount || 0} expenses and {data?.incomeCount || 0} incomes ready for export
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Category / Source</th>
                  <th>Payment Method</th>
                  <th>Note</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(!data?.expenses?.length && !data?.incomes?.length) ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No records found for {getMonthName(monthYear)}. Log some expenses or incomes first!
                    </td>
                  </tr>
                ) : (
                  <>
                    {data?.incomes?.map((inc) => (
                      <tr key={`inc-${inc.id}`}>
                        <td>
                          <span className="badge bg-success bg-opacity-10 text-success fw-semibold">
                            <i className="bi bi-arrow-down-left me-1"></i> Income
                          </span>
                        </td>
                        <td>{inc.date}</td>
                        <td className="fw-semibold">{inc.source}</td>
                        <td className="text-muted small">{inc.paymentMethod}</td>
                        <td className="text-muted small">{inc.note || '-'}</td>
                        <td className="text-end fw-bold text-success">+₹{inc.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    {data?.expenses?.map((exp) => (
                      <tr key={`exp-${exp.id}`}>
                        <td>
                          <span className="badge bg-danger bg-opacity-10 text-danger fw-semibold">
                            <i className="bi bi-arrow-up-right me-1"></i> Expense
                          </span>
                        </td>
                        <td>{exp.date}</td>
                        <td className="fw-semibold">{exp.category}</td>
                        <td className="text-muted small">{exp.paymentMethod}</td>
                        <td className="text-muted small">{exp.note || '-'}</td>
                        <td className="text-end fw-bold text-danger">-₹{exp.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
