import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { salesReturnsAPI, salesInvoicesAPI, itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SalesReturns = () => {
  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    salesInvoice: '',
    customerName: '',
    items: [{ item: '', quantity: '', rate: '', amount: 0 }],
    reason: '',
  });
  
  const { canWrite } = useAuth();

  useEffect(() => {
    fetchReturns();
    fetchInvoices();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await salesReturnsAPI.getAll();
      setReturns(response.data.data);
    } catch (error) {
      console.error('Error fetching sales returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await salesInvoicesAPI.getAll({ status: 'Completed' });
      setInvoices(response.data.data);
    } catch (error) {
      console.error('Error fetching sales invoices:', error);
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

  const handleSalesInvoiceChange = async (invoiceId) => {
    if (!invoiceId) {
      setFormData({ ...formData, salesInvoice: '' });
      return;
    }

    try {
      const response = await salesInvoicesAPI.getOne(invoiceId);
      const invoice = response.data.data;

      const populatedItems = invoice.items.map(invItem => ({
        item: invItem.item._id || invItem.item,
        quantity: invItem.quantity,
        rate: invItem.rate,
        amount: invItem.quantity * invItem.rate,
      }));

      setFormData({
        ...formData,
        salesInvoice: invoiceId,
        customerName: invoice.customerName,
        items: populatedItems,
        reason: '',
      });
    } catch (error) {
      console.error('Error fetching sales invoice details:', error);
      alert('Error loading sales invoice details');
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
      const returnData = {
        ...formData,
        totalAmount: calculateTotal(),
      };
      
      await salesReturnsAPI.create(returnData);
      setShowForm(false);
      resetForm();
      fetchReturns();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving sales return');
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Complete this sales return? This will increase stock levels.')) {
      try {
        await salesReturnsAPI.complete(id);
        fetchReturns();
        alert('Sales return completed! Stock levels updated.');
      } catch (error) {
        alert(error.response?.data?.message || 'Error completing sales return');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sales return?')) {
      try {
        await salesReturnsAPI.delete(id);
        fetchReturns();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting sales return');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      salesInvoice: '',
      customerName: '',
      items: [{ item: '', quantity: '', rate: '', amount: 0 }],
      reason: '',
    });
  };

  const getStatusBadge = (status) => {
    return status === 'Completed' ? 'badge-success' : 'badge-warning';
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
              <h1>↩️ Sales Returns</h1>
              <p>Manage customer returns and refunds</p>
            </div>
            {canWrite('salesReturns') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                }}
              >
                + New Sales Return
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="content-card">
            <h2>New Sales Return</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Sales Invoice *</label>
                <select
                  className="form-select"
                  value={formData.salesInvoice}
                  onChange={(e) => handleSalesInvoiceChange(e.target.value)}
                  required
                >
                  <option value="">Select Invoice</option>
                  {invoices.map((invoice) => (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.invoiceNumber} - {invoice.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <h3 style={{ marginTop: '20px' }}>Returned Items</h3>
              {formData.items.map((returnItem, index) => (
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
                    value={returnItem.item}
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
                    value={returnItem.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Rate"
                    value={returnItem.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={returnItem.amount.toFixed(2)}
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
                <label className="form-label">Reason for Return *</label>
                <textarea
                  className="form-input"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
                  required
                  placeholder="e.g., Defective product, Wrong item, Customer changed mind..."
                />
              </div>

              <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Total Refund Amount: ${calculateTotal().toFixed(2)}
              </div>

              <div className="flex gap-10 mt-20">
                <button type="submit" className="btn btn-primary">
                  Create Sales Return (Draft)
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
          <h2>All Sales Returns ({returns.length})</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Return Number</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnItem) => (
                <tr key={returnItem._id}>
                  <td>{returnItem.returnNumber}</td>
                  <td>{returnItem.salesInvoice?.invoiceNumber || '-'}</td>
                  <td>{returnItem.customerName || returnItem.salesInvoice?.customerName || '-'}</td>
                  <td>${(returnItem.totalAmount || 0).toFixed(2)}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {returnItem.reason}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(returnItem.status)}`}>
                      {returnItem.status}
                    </span>
                  </td>
                  <td>{new Date(returnItem.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-10">
                      {canWrite('salesReturns') &&
                        returnItem.status === 'Draft' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleComplete(returnItem._id)}
                            >
                              Complete & Update Stock
                            </button>
                            {canWrite('salesReturns') && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(returnItem._id)}
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      {returnItem.status === 'Completed' && (
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Stock Updated</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReturns;
