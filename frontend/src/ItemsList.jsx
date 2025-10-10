import { useState, useEffect } from 'react';
import './ItemsList.css';

const ItemsList = ({ itemCategories, addItemCategory, setItemCategories, currentCourse, products = [], setProducts }) => {
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState('');
  // default to All
  const [selectedCourse, setSelectedCourse] = useState(currentCourse || '');
  const [selectedYear, setSelectedYear] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // when the global products change, sync categories
  useEffect(() => {
    const cats = Array.from(new Set((products || []).map(p => p.name.toLowerCase().replace(/\s+/g, '_'))));
    setItemCategories && setItemCategories(cats);
  }, [products, setItemCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = newItem.trim();
    if (!name) return;
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: name, price: 0, category: 'Other', forCourse: selectedCourse || '', year: selectedYear ? Number(selectedYear) : 0 }),
      });
      if (!response.ok) throw new Error('Failed to create product');
      const created = await response.json();
      // update global products
      setProducts && setProducts(prev => [...(prev || []), created]);
      setStatusMsg('Created');
      setNewItem('');
    } catch (err) {
      console.error('Create failed:', err);
      setStatusMsg('Create failed: ' + (err.message || 'unknown'));
      console.error(err);
    }
  };

  const handleDelete = async (productId, productName) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts && setProducts(prev => (prev || []).filter(p => p._id !== productId));
      setItemCategories && setItemCategories(prev => prev.filter(i => i !== productName));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const startEdit = (idx, val) => {
    setEditingIndex(idx);
    setEditingValue(val);
  };

  const saveEdit = async (oldVal) => {
    const newVal = editingValue.trim();
    if (!newVal) return;
    // find product by oldVal
  const product = (products || []).find(p => p.name.toLowerCase().replace(/\s+/g, '_') === oldVal);
  if (!product) return;
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVal }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setProducts && setProducts(prev => (prev || []).map(p => p._id === updated._id ? updated : p));
      const normalizedNew = updated.name.toLowerCase().replace(/\s+/g, '_');
      setItemCategories(prev => prev.map(i => i === oldVal ? normalizedNew : i));
      setEditingIndex(-1);
      setEditingValue('');
    } catch (err) {
      console.error('Edit failed', err);
    }
  };

  return (
    <div className="items-list-container container">
      <h1>Item Categories</h1>

      <div className="controls">
        <label>Course:</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">All</option>
          <option value="b.tech">B.Tech</option>
          <option value="diploma">Diploma</option>
          <option value="degree">Degree</option>
        </select>
        <label>Year:</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">All</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item category..."
        />
        <button type="submit" className="btn btn-primary">Add Item</button>
      </form>
      {statusMsg && <div style={{ marginTop: 8, color: statusMsg.startsWith('Created') ? '#16a34a' : '#dc2626' }}>{statusMsg}</div>}

  <div className="item-categories-list card">
        <h2>Current Items</h2>
        {(products && products.length) > 0 ? (
          <ul>
            {(products || []).filter(p => {
              if (selectedCourse && p.forCourse && p.forCourse !== selectedCourse) return false;
              if (selectedYear && p.year && String(p.year) !== String(selectedYear)) return false;
              return true;
            }).map((product, idx) => (
              <li key={product._id} className="item-row">
                {editingIndex === idx ? (
                  <>
                    <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} />
                    <button className="btn btn-primary" onClick={() => saveEdit(product.name.toLowerCase().replace(/\s+/g,'_'))}>Save</button>
                    <button className="btn btn-secondary" onClick={() => setEditingIndex(-1)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>{product.name}</span>
                    <div className="item-actions">
                      <button className="btn btn-outline" onClick={() => startEdit(idx, product.name.toLowerCase().replace(/\s+/g,'_'))}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(product._id, product.name.toLowerCase().replace(/\s+/g,'_'))}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No item categories found.</p>
        )}
      </div>
    </div>
  );
};

export default ItemsList;