import { useState } from 'react';
import './ItemsList.css';

const ItemsList = ({ itemCategories, addItemCategory }) => {
  const [newItem, setNewItem] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      addItemCategory(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div className="items-list-container">
      <h1>Item Categories</h1>

      <form onSubmit={handleSubmit} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item category..."
        />
        <button type="submit">Add Item</button>
      </form>

      <div className="item-categories-list">
        <h2>Current Items</h2>
        {itemCategories.length > 0 ? (
          <ul>
            {itemCategories.map((item) => (
              <li key={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</li>
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