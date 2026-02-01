import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { purchaseBillsAPI, purchaseOrdersAPI, vendorsAPI, itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseBills = () => {
  const [bills, setBills] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    purchaseOrder: '',
    vendor: '',
    items: [{ item: '', quantity: '', rate: '', amount: 0 }],
    notes: '',
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
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
    fetchBills();
    fetchPurchaseOrders();
    fetchVendors();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBills = async () => {
    try {
      const response = await purchaseBillsAPI.getAll();
      setBills(response.data.data);
    } catch (error) {
      console.error('Error fetching purchase bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await purchaseOrdersAPI.getAll({ status: 'Approved' });
      setPurchaseOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
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

  const handlePurchaseOrderChange = async (poId) => {
    if (!poId) {
      // If no PO selected, just update the field
      setFormData({ ...formData, purchaseOrder: '' });
      return;
    }

    try {
      // Fetch the full purchase order details
      const response = await purchaseOrdersAPI.getOne(poId);
      const po = response.data.data;

      // Auto-populate vendor and items from the purchase order
      const populatedItems = po.items.map(poItem => ({
        item: poItem.item._id || poItem.item,
        quantity: poItem.quantity,
        rate: poItem.rate,
        amount: poItem.quantity * poItem.rate,
      }));

      setFormData({
        ...formData,
        purchaseOrder: poId,
        vendor: po.vendor._id || po.vendor,
        items: populatedItems,
        notes: po.notes || '',
      });
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      alert('Error loading purchase order details');
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
      const billData = {
        ...formData,
        grandTotal: calculateTotal(),
      };
      
      await purchaseBillsAPI.create(billData);
      setShowForm(false);
      resetForm();
      fetchBills();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving purchase bill');
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Complete this purchase bill? This will increase stock levels.')) {
      try {
        await purchaseBillsAPI.complete(id);
        fetchBills();
        alert('Purchase bill completed! Stock levels updated.');
      } catch (error) {
        alert(error.response?.data?.message || 'Error completing purchase bill');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase bill?')) {
      try {
        await purchaseBillsAPI.delete(id);
        fetchBills();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting purchase bill');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      purchaseOrder: '',
      vendor: '',
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
      case 'Unpaid': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    const remaining = (bill.grandTotal || 0) - (bill.paidAmount || 0);
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
    setSelectedBill(null);
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
      await purchaseBillsAPI.addPayment(selectedBill._id, {
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      });
      alert('Payment recorded successfully!');
      closePaymentModal();
      fetchBills();
    } catch (error) {
      alert(error.response?.data?.message || 'Error recording payment');
    }
  };

  const openPaymentHistory = async (bill) => {
    try {
      const response = await purchaseBillsAPI.getPayments(bill._id);
      setPaymentHistory(response.data.data);
      setSelectedBill(bill);
      setShowPaymentHistory(true);
    } catch (error) {
      alert('Error fetching payment history');
    }
  };

  const closePaymentHistory = () => {
    setShowPaymentHistory(false);
    setPaymentHistory(null);
    setSelectedBill(null);
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
              <h1>🧾 Purchase Bills</h1>
              <p>Manage purchase bills and update stock</p>
            </div>
            {canWrite('purchaseBills') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                }}
              >
                + New Purchase Bill
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="content-card">
            <h2>New Purchase Bill</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Purchase Order (Optional)</label>
                  <select
                    className="form-select"
                    value={formData.purchaseOrder}
                    onChange={(e) => handlePurchaseOrderChange(e.target.value)}
                  >
                    <option value="">Select PO (Optional)</option>
                    {purchaseOrders.map((po) => (
                      <option key={po._id} value={po._id}>
                        {po.orderNumber} - {po.vendor?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor *</label>
                  <select
                    className="form-select"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 style={{ marginTop: '20px' }}>Items</h3>
              {formData.items.map((billItem, index) => (
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
                    value={billItem.item}
                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} ({item.sku})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Quantity"
                    value={billItem.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Rate"
                    value={billItem.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={billItem.amount.toFixed(2)}
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
                  Create Purchase Bill (Draft)
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
          <h2>All Purchase Bills ({bills.length})</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Vendor</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.billNumber}</td>
                  <td>{bill.vendor?.name}</td>
                  <td>${(bill.grandTotal || 0).toFixed(2)}</td>
                  <td>
                    {bill.status === 'Completed' && (
                      <>
                        <span className={`badge ${getPaymentStatusBadge(bill.paymentStatus || 'Unpaid')}`}>
                          {bill.paymentStatus || 'Unpaid'}
                        </span>
                        {bill.paymentStatus !== 'Paid' && bill.paymentStatus !== 'Unpaid' && (
                          <div style={{ fontSize: '11px', marginTop: '4px' }}>
                            ${(bill.paidAmount || 0).toFixed(2)} / ${(bill.grandTotal || 0).toFixed(2)}
                          </div>
                        )}
                      </>
                    )}
                    {bill.status === 'Draft' && <span style={{ color: '#999' }}>N/A</span>}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-10">
                      {canWrite('purchaseBills') &&
                        bill.status === 'Draft' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleComplete(bill._id)}
                            >
                              Complete & Update Stock
                            </button>
                            {canWrite('purchaseBills') && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(bill._id)}
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      {bill.status === 'Completed' && (
                        <>
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Stock Updated</span>
                          {canWrite('purchaseBills') && (bill.paymentStatus !== 'Paid') && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => openPaymentModal(bill)}
                            >
                              💰 Record Payment
                            </button>
                          )}
                          {(bill.payments && bill.payments.length > 0) && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => openPaymentHistory(bill)}
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
        {showPaymentModal && selectedBill && (
          <div className="modal-overlay" onClick={closePaymentModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>💰 Record Payment</h2>
              <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div><strong>Bill:</strong> {selectedBill.billNumber}</div>
                <div><strong>Vendor:</strong> {selectedBill.vendor?.name}</div>
                <div><strong>Total Amount:</strong> ${(selectedBill.grandTotal || 0).toFixed(2)}</div>
                <div><strong>Paid Amount:</strong> ${(selectedBill.paidAmount || 0).toFixed(2)}</div>
                <div><strong>Remaining:</strong> ${((selectedBill.grandTotal || 0) - (selectedBill.paidAmount || 0)).toFixed(2)}</div>
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
                    max={((selectedBill.grandTotal || 0) - (selectedBill.paidAmount || 0)).toFixed(2)}
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
        {showPaymentHistory && selectedBill && paymentHistory && (
          <div className="modal-overlay" onClick={closePaymentHistory}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
              <h2>📜 Payment History</h2>
              <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div><strong>Bill:</strong> {selectedBill.billNumber}</div>
                <div><strong>Vendor:</strong> {selectedBill.vendor?.name}</div>
                <div><strong>Total Amount:</strong> ${(paymentHistory.grandTotal || 0).toFixed(2)}</div>
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
                    width: `${Math.min((paymentHistory.paidAmount / paymentHistory.grandTotal) * 100, 100)}%`, 
                    height: '100%', 
                    backgroundColor: '#28a745',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px', color: '#666' }}>
                  {((paymentHistory.paidAmount / paymentHistory.grandTotal) * 100).toFixed(1)}% Paid
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

export default PurchaseBills;
