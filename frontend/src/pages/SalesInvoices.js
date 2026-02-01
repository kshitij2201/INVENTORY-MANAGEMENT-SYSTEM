import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { salesInvoicesAPI, salesOrdersAPI, itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    salesOrder: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ item: '', quantity: '', rate: '', amount: 0 }],
    notes: '',
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    reference: '',
    notes: ''
  });
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState(null);
  
  const { canWrite } = useAuth();

  useEffect(() => {
    fetchInvoices();
    fetchSalesOrders();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await salesInvoicesAPI.getAll();
      setInvoices(response.data.data);
    } catch (error) {
      console.error('Error fetching sales invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesOrders = async () => {
    try {
      const response = await salesOrdersAPI.getAll({ status: 'Confirmed' });
      setSalesOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching sales orders:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await itemsAPI.getAll();
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = qty * rate;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSalesOrderChange = async (soId) => {
    if (!soId) {
      setFormData({ ...formData, salesOrder: '' });
      return;
    }

    try {
      const response = await salesOrdersAPI.getOne(soId);
      const so = response.data.data;

      const populatedItems = so.items.map(soItem => ({
        item: soItem.item._id || soItem.item,
        quantity: soItem.quantity,
        rate: soItem.rate,
        amount: soItem.quantity * soItem.rate,
      }));

      setFormData({
        ...formData,
        salesOrder: soId,
        customerName: so.customerName,
        customerEmail: so.customerEmail || '',
        customerPhone: so.customerPhone || '',
        items: populatedItems,
        notes: so.notes || '',
      });
    } catch (error) {
      console.error('Error fetching sales order details:', error);
      alert('Error loading sales order details');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: '', quantity: '', rate: '', amount: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        grandTotal: calculateTotal(),
      };
      
      await salesInvoicesAPI.create(invoiceData);
      setShowForm(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving sales invoice');
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Complete this sales invoice? This will reduce stock levels.')) {
      try {
        await salesInvoicesAPI.complete(id);
        fetchInvoices();
        alert('Sales invoice completed! Stock levels updated.');
      } catch (error) {
        alert(error.response?.data?.message || 'Error completing sales invoice');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sales invoice?')) {
      try {
        await salesInvoicesAPI.delete(id);
        fetchInvoices();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting sales invoice');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      salesOrder: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [{ item: '', quantity: '', rate: '', amount: 0 }],
      notes: '',
    });
  };

  const getStatusBadge = (status) => {
    return status === 'Completed' ? 'badge-success' : 'badge-warning';
  };

  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return 'badge-success';
      case 'Partially Paid': return 'badge-warning';
      case 'Unpaid': return 'badge-danger';      case 'Overpaid': return 'badge-info';      default: return 'badge-secondary';
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    const adjustedTotal = (invoice.grandTotal || 0) - (invoice.totalReturned || 0);
    const remaining = adjustedTotal - (invoice.paidAmount || 0);
    setPaymentData({
      amount: remaining.toFixed(2),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      reference: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      reference: '',
      notes: ''
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await salesInvoicesAPI.addPayment(selectedInvoice._id, {
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      });
      alert('Payment recorded successfully!');
      closePaymentModal();
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Error recording payment');
    }
  };

  const openPaymentHistory = async (invoice) => {
    try {
      const response = await salesInvoicesAPI.getPayments(invoice._id);
      setPaymentHistory(response.data.data);
      setSelectedInvoice(invoice);
      setShowPaymentHistory(true);
    } catch (error) {
      alert('Error fetching payment history');
    }
  };

  const closePaymentHistory = () => {
    setShowPaymentHistory(false);
    setPaymentHistory(null);
    setSelectedInvoice(null);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div className="flex justify-between align-center">
            <div>
              <h1>💰 Sales Invoices</h1>
              <p>Manage sales invoices and update stock</p>
            </div>
            {canWrite('salesInvoices') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                }}
              >
                + New Sales Invoice
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="content-card">
            <h2>New Sales Invoice</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Sales Order (Optional)</label>
                  <select
                    className="form-select"
                    value={formData.salesOrder}
                    onChange={(e) => handleSalesOrderChange(e.target.value)}
                  >
                    <option value="">Select SO (Optional)</option>
                    {salesOrders.map((so) => (
                      <option key={so._id} value={so._id}>
                        {so.orderNumber} - {so.customerName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Customer Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Customer Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px' }}>Items</h3>
              {formData.items.map((invoiceItem, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <select
                    className="form-select"
                    value={invoiceItem.item}
                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} ({item.sku}) - Stock: {item.currentStock}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Quantity"
                    value={invoiceItem.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Rate"
                    value={invoiceItem.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={invoiceItem.amount.toFixed(2)}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addItem}>
                + Add Item
              </button>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Total Amount: ${calculateTotal().toFixed(2)}
              </div>

              <div className="flex gap-10 mt-20">
                <button type="submit" className="btn btn-primary">
                  Create Sales Invoice (Draft)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="content-card">
          <h2>All Sales Invoices ({invoices.length})</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.customerPhone}</td>
                  <td>
                    ${(invoice.grandTotal || 0).toFixed(2)}
                    {invoice.totalReturned > 0 && (
                      <div style={{ fontSize: '11px', color: '#d9534f', marginTop: '2px' }}>
                        ↩️ Returns: ${invoice.totalReturned.toFixed(2)}<br/>
                        <strong>Net: ${((invoice.grandTotal || 0) - invoice.totalReturned).toFixed(2)}</strong>
                      </div>
                    )}
                  </td>
                  <td>
                    {invoice.status === 'Completed' && (
                      <>
                        <span className={`badge ${getPaymentStatusBadge(invoice.paymentStatus || 'Unpaid')}`}>
                          {invoice.paymentStatus || 'Unpaid'}
                        </span>
                        {(invoice.paymentStatus === 'Partially Paid' || invoice.paymentStatus === 'Overpaid') && (
                          <div style={{ fontSize: '11px', marginTop: '4px' }}>
                            ${(invoice.paidAmount || 0).toFixed(2)} / ${((invoice.grandTotal || 0) - (invoice.totalReturned || 0)).toFixed(2)}
                          </div>
                        )}
                      </>
                    )}
                    {invoice.status === 'Draft' && <span style={{ color: '#999' }}>N/A</span>}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-10">
                      {canWrite('salesInvoices') &&
                        invoice.status === 'Draft' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleComplete(invoice._id)}
                            >
                              Complete & Update Stock
                            </button>
                            {canWrite('salesInvoices') && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(invoice._id)}
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      {invoice.status === 'Completed' && (
                        <>
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Stock Updated</span>
                          {canWrite('salesInvoices') && (invoice.paymentStatus !== 'Paid') && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => openPaymentModal(invoice)}
                            >
                              💰 Record Payment
                            </button>
                          )}
                          {(invoice.payments && invoice.payments.length > 0) && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => openPaymentHistory(invoice)}
                            >
                              📜 History
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="modal-overlay" onClick={closePaymentModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>💰 Record Payment</h2>
              <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div><strong>Invoice:</strong> {selectedInvoice.invoiceNumber}</div>
                <div><strong>Customer:</strong> {selectedInvoice.customerName}</div>
                <div><strong>Original Total:</strong> ${(selectedInvoice.grandTotal || 0).toFixed(2)}</div>
                {selectedInvoice.totalReturned > 0 && (
                  <>
                    <div style={{ color: '#d9534f' }}><strong>Returns:</strong> -${selectedInvoice.totalReturned.toFixed(2)}</div>
                    <div style={{ borderTop: '1px solid #ddd', marginTop: '4px', paddingTop: '4px' }}>
                      <strong>Adjusted Total:</strong> ${((selectedInvoice.grandTotal || 0) - selectedInvoice.totalReturned).toFixed(2)}
                    </div>
                  </>
                )}
                <div><strong>Paid Amount:</strong> ${(selectedInvoice.paidAmount || 0).toFixed(2)}</div>
                <div><strong>Remaining:</strong> ${(((selectedInvoice.grandTotal || 0) - (selectedInvoice.totalReturned || 0)) - (selectedInvoice.paidAmount || 0)).toFixed(2)}</div>
              </div>
              
              <form onSubmit={handlePaymentSubmit}>
                <div className="form-group">
                  <label className="form-label">Payment Amount *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    required
                    min="0.01"
                    max={(((selectedInvoice.grandTotal || 0) - (selectedInvoice.totalReturned || 0)) - (selectedInvoice.paidAmount || 0)).toFixed(2)}
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    className="form-select"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reference/Transaction ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter transaction reference"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-input"
                    placeholder="Enter any notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="flex gap-10 mt-20">
                  <button type="submit" className="btn btn-primary">
                    Record Payment
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={closePaymentModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment History Modal */}
        {showPaymentHistory && selectedInvoice && paymentHistory && (
          <div className="modal-overlay" onClick={closePaymentHistory}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
              <h2>📜 Payment History</h2>
              <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div><strong>Invoice:</strong> {selectedInvoice.invoiceNumber}</div>
                <div><strong>Customer:</strong> {selectedInvoice.customerName}</div>
                <div><strong>Original Total:</strong> ${(paymentHistory.grandTotal || 0).toFixed(2)}</div>
                {paymentHistory.totalReturned > 0 && (
                  <>
                    <div style={{ color: '#d9534f' }}><strong>Returns:</strong> -${paymentHistory.totalReturned.toFixed(2)}</div>
                    <div style={{ borderTop: '1px solid #ddd', marginTop: '4px', paddingTop: '4px' }}>
                      <strong>Adjusted Total:</strong> ${(paymentHistory.adjustedTotal || 0).toFixed(2)}
                    </div>
                  </>
                )}
                <div><strong>Paid Amount:</strong> ${(paymentHistory.paidAmount || 0).toFixed(2)}</div>
                <div><strong>Remaining:</strong> ${(paymentHistory.remainingAmount || 0).toFixed(2)}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${getPaymentStatusBadge(paymentHistory.paymentStatus)}`}>
                    {paymentHistory.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '20px', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '10px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    width: `${Math.min((paymentHistory.paidAmount / (paymentHistory.adjustedTotal || paymentHistory.grandTotal)) * 100, 100)}%`, 
                    height: '100%', 
                    backgroundColor: paymentHistory.paymentStatus === 'Overpaid' ? '#17a2b8' : '#28a745',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px', color: '#666' }}>
                  {((paymentHistory.paidAmount / (paymentHistory.adjustedTotal || paymentHistory.grandTotal)) * 100).toFixed(1)}% Paid
                </div>
              </div>

              <h3>Payment Records</h3>
              {paymentHistory.payments && paymentHistory.payments.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th>Recorded By</th>
                      <th>Recorded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.payments.map((payment, index) => (
                      <tr key={index}>
                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td>${(payment.amount || 0).toFixed(2)}</td>
                        <td>{payment.paymentMethod}</td>
                        <td>{payment.reference || '-'}</td>
                        <td>{payment.recordedBy?.name || 'N/A'}</td>
                        <td>{new Date(payment.recordedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No payment records found.</p>
              )}

              <div className="flex gap-10 mt-20">
                <button className="btn btn-secondary" onClick={closePaymentHistory}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesInvoices;
