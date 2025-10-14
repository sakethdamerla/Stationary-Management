import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const PageStyles = () => (
  <style>{`
    .items-list-page .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .items-list-page .page-title {
      font-size: 1.875rem;
      font-weight: bold;
    }
    .items-list-page .page-subtitle {
      color: #6b7280;
      margin-top: 0.25rem;
    }
    .items-list-page .controls-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 768px) {
      .items-list-page .controls-card {
        grid-template-columns: repeat(2, 1fr);
        align-items: end;
      }
    }
    .items-list-page .filter-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .items-list-page .add-item-form {
      display: flex;
      gap: 0.5rem;
    }
    .items-list-page .add-item-form input {
      flex-grow: 1;
    }
    .items-list-page .items-container {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
    }
    .items-list-page .items-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-list-page .items-header h2 {
      font-size: 1.125rem;
      font-weight: 600;
    }
    .items-list-page .item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-list-page .item-row:last-child {
      border-bottom: none;
    }
    .items-list-page .item-row.editing {
      gap: 0.5rem;
    }
    .items-list-page .item-row.editing input {
      flex-grow: 1;
    }
    .items-list-page .item-actions {
      display: flex;
      gap: 0.5rem;
    }
  `}</style>
);

/**
 * @typedef {object} Product
 * @property {string} _id
 * @property {string} name
 * @property {string} [forCourse]
 * @property {number} [year]
 */

const ItemsList = ({ itemCategories, addItemCategory, setItemCategories, currentCourse, products = [], setProducts }) => {
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(currentCourse || '');
  const [selectedYear, setSelectedYear] = useState('');
  const [config, setConfig] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/config/academic');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          if (!selectedCourse && data.courses?.[0]) {
            setSelectedCourse(data.courses[0].name);
            setSelectedYear(String(data.courses[0].years?.[0] || ''));
          }
        }
      } catch (_) {}
    })();
  }, []);
  const [statusMsg, setStatusMsg] = useState('');

  // when the global products change, sync categories
  useEffect(() => {
    const cats = Array.from(new Set((products || []).map(p => p.name.toLowerCase().replace(/\s+/g, '_'))));
    setItemCategories && setItemCategories(cats);
  }, [products, setItemCategories]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter(p => {
      if (selectedCourse && p.forCourse && p.forCourse !== selectedCourse) return false;
      if (selectedYear && p.year && String(p.year) !== String(selectedYear)) return false;
      return true;
    });
  }, [products, selectedCourse, selectedYear]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = newItem.trim();
    if (!name) return;
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: name, price: 0, category: 'Other', forCourse: selectedCourse || undefined, year: selectedYear ? Number(selectedYear) : undefined }),
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

  /**
   * @param {{
   *  product: Product,
   *  idx: number
   * }} props
   */
  const ItemRow = ({ product, idx }) => {
    const isEditing = editingIndex === idx;
    const normalizedName = product.name.toLowerCase().replace(/\s+/g, '_');

    if (isEditing) {
      return (
        <div className="item-row editing">
          <input className="form-input" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} />
          <div className="item-actions">
            <button className="btn btn-success btn-sm" onClick={() => saveEdit(normalizedName)}>Save</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingIndex(-1)}>Cancel</button>
          </div>
        </div>
      );
    }

    return (
      <div className="item-row">
        <span>{product.name}</span>
        <div className="item-actions">
          <button className="btn btn-outline btn-sm btn-with-icon" onClick={() => startEdit(idx, normalizedName)}>
            <Edit size={14} />
          </button>
          <button className="btn btn-danger btn-sm btn-with-icon" onClick={() => handleDelete(product._id, normalizedName)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="items-list-page container">
      <PageStyles />
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Items</h1>
          <p className="page-subtitle">Add, edit, or delete items available for students.</p>
        </div>
      </div>

      <div className="controls-card">
        <div className="filter-group">
          <div>
            <label className="form-label">Course</label>
            <select className="form-select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">All Courses</option>
              {(config?.courses || []).map(c => (
                <option key={c.name} value={c.name}>{c.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Year</label>
            <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">All Years</option>
              {(config?.courses?.find(c => c.name === selectedCourse)?.years || []).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="add-item-form">
          <input
            type="text"
            className="form-input"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add new item name..."
          />
          <button type="submit" className="btn btn-primary btn-with-icon">
            <Plus size={16} />
            Add
          </button>
        </form>
      </div>

      {statusMsg && <div className={`mb-4 p-2 rounded text-sm ${statusMsg.startsWith('Created') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{statusMsg}</div>}

      <div className="items-container">
        <div className="items-header">
          <h2>Current Items ({filteredProducts.length})</h2>
        </div>
        <div>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, idx) => (
            <ItemRow key={product._id} product={product} idx={idx} />
          ))
        ) : (
          <p className="p-6 text-gray-500">No items found for the selected filters.</p>
        )}
        </div>
      </div>
    </div>
  );
};

export default ItemsList;