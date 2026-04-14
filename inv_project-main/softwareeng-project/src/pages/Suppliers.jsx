import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (e) {
      toast.error('Failed to load suppliers');
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await api.post('/suppliers', { name, contact });
      toast.success('Supplier added successfully!');
      setName(''); setContact('');
      fetchSuppliers();
    } catch (e) {
      toast.error('Failed to add supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success('Supplier deleted');
      fetchSuppliers();
    } catch (e) {
      toast.error('Failed to delete supplier');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Suppliers</h1>
          <p>Manage your supplier relationships</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2.5fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'start' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem' }}>
            <div style={{ padding: '0.5rem', background: '#F3F4F6', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <UserPlus size={18} color="var(--text-primary)" />
            </div>
            Add New Supplier
          </h2>
          <form onSubmit={handleAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Supplier Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Global Supply Co." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Contact Info</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)} required placeholder="Email or Phone" />
            </div>
            <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Add Supplier</button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Supplier Directory</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.supplier_id}>
                    <td style={{ color: 'var(--text-secondary)' }}>#{s.supplier_id}</td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.contact}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleDelete(s.supplier_id)} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr><td colSpan="4" className="text-center" style={{ padding: '3rem 0' }}>No suppliers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
