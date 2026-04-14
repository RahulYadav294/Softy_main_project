import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

const SalesPurchase = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // Sale State
  const [saleProduct, setSaleProduct] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('');

  // Purchase State
  const [purchaseProduct, setPurchaseProduct] = useState('');
  const [purchaseSupplier, setPurchaseSupplier] = useState('');
  const [purchaseQuantity, setPurchaseQuantity] = useState('');

  useEffect(() => {
    // Load products and suppliers for dropdowns
    api.get('/products').then(res => setProducts(res.data)).catch(() => {});
    api.get('/suppliers').then(res => setSuppliers(res.data)).catch(() => {});
  }, []);

  const handleSale = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/sales', {
        product_id: saleProduct,
        quantity: parseInt(saleQuantity)
      });
      toast.success(res.data.message);
      if (res.data.alert_generated) {
        toast.warning("Stock below minimum level!");
      }
      setSaleQuantity('');
      setSaleProduct('');
      // refresh stock
      api.get('/products').then(res => setProducts(res.data)).catch(() => {});
    } catch (e) {
      toast.error(e.response?.data?.message || 'Sale failed');
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/purchase', {
        product_id: purchaseProduct,
        supplier_id: purchaseSupplier,
        quantity: parseInt(purchaseQuantity)
      });
      toast.success(res.data.message);
      setPurchaseQuantity('');
      setPurchaseProduct('');
      setPurchaseSupplier('');
      api.get('/products').then(res => setProducts(res.data)).catch(() => {});
    } catch (e) {
      toast.error(e.response?.data?.message || 'Purchase failed');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Sales & Purchase</h1>
          <p>Record transactions to update inventory in real-time</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Record Sale */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1rem', background: '#F3F4F6', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <TrendingUp size={24} color="var(--text-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Record Sale</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Deduct stock from products</p>
            </div>
          </div>

          <form onSubmit={handleSale} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Product</label>
              <select value={saleProduct} onChange={e => setSaleProduct(e.target.value)} required>
                <option value="">Select a product...</option>
                {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name} (Stock: {p.quantity})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Quantity Sold</label>
              <input type="number" min="1" value={saleQuantity} onChange={e => setSaleQuantity(e.target.value)} required placeholder="0" />
            </div>
            <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Complete Sale</button>
          </form>
        </div>

        {/* Record Purchase */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1rem', background: '#F3F4F6', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <TrendingDown size={24} color="var(--text-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Record Purchase</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Add stock from suppliers</p>
            </div>
          </div>

          <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Product</label>
              <select value={purchaseProduct} onChange={e => setPurchaseProduct(e.target.value)} required>
                <option value="">Select a product...</option>
                {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Supplier</label>
              <select value={purchaseSupplier} onChange={e => setPurchaseSupplier(e.target.value)} required>
                <option value="">Select a supplier...</option>
                {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Quantity Purchased</label>
              <input type="number" min="1" value={purchaseQuantity} onChange={e => setPurchaseQuantity(e.target.value)} required placeholder="0" />
            </div>
            <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Complete Purchase</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SalesPurchase;
