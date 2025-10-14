import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, X } from 'lucide-react';

// A simple modal component for creating/editing sub-admins
const SubAdminModal = ({ isOpen, onClose, onSave, subAdmin }) => {
  const [name, setName] = useState(subAdmin?.name || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(subAdmin?.role || 'Editor');

  useEffect(() => {
    if (isOpen) {
      setName(subAdmin?.name || '');
      setRole(subAdmin?.role || 'Editor');
      setPassword(''); // Always clear password field when modal opens
    }
  }, [isOpen, subAdmin]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subAdmin && !password) {
      alert('Password is required for new sub-admins.');
      return;
    }
    // Only include password if it has been set
    onSave({ ...subAdmin, name, role, ...(password && { password }) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-soft w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{subAdmin ? 'Edit' : 'Create'} Sub-Admin</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sub-admin name"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={subAdmin ? "Enter new password to change" : "Enter password"}
              required={!subAdmin} // Password is required only for new sub-admins
            />
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Editor</option>
              <option>Viewer</option>
              <option>Accountant</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Sub-Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubAdminManagement = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        const response = await fetch('/api/subadmins');
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Unexpected response from server');
        }
        const data = await response.json();
        setSubAdmins((data || []).map(sa => ({ ...sa, id: sa._id })));
      } catch (error) {
        console.error("Failed to fetch sub-admins:", error);
      }
    };
    fetchSubAdmins();
  }, []);

  const handleCreate = () => {
    setEditingSubAdmin(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subAdmin) => {
    setEditingSubAdmin(subAdmin);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this sub-admin?')) return;

    fetch(`/api/subadmins/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        setSubAdmins(prev => prev.filter(sa => sa.id !== id));
      })
      .catch(err => alert(`Error: ${err.message}`));
  };

  const handleSave = async (subAdminData) => {
    const isUpdating = !!subAdminData.id;
    const url = isUpdating ? `/api/subadmins/${subAdminData.id}` : '/api/subadmins';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subAdminData),
      });

      if (!response.ok) {
        // Try to parse error JSON, but fallback to status text if it fails
        const errorData = await response.json().catch(() => ({ 
          message: `Request failed with status: ${response.status} ${response.statusText}` 
        }));
        throw new Error(errorData.message || 'Save operation failed');
      }

      const savedSubAdmin = await response.json();
      const formattedAdmin = { ...savedSubAdmin, id: savedSubAdmin._id };

      setSubAdmins(prev => isUpdating
        ? prev.map(sa => sa.id === formattedAdmin.id ? formattedAdmin : sa)
        : [...prev, formattedAdmin]);
      setIsModalOpen(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Users size={32} />
            Manage Sub-Admins
          </h1>
          <button onClick={handleCreate} className="btn btn-primary btn-with-icon">
            <Plus size={16} />
            Create Sub-Admin
          </button>
        </div>
        <div className="table-card">
          <div className="table-container">
            <table className="students-table-modern">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subAdmins.map(sa => (
                  <tr key={sa.id}>
                    <td>{sa.name}</td>
                    <td><span className="branch-text">{sa.role}</span></td>
                    <td className="actions-cell text-right">
                      <button onClick={() => handleEdit(sa)} className="btn btn-outline btn-sm btn-with-icon"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(sa.id)} className="btn btn-danger btn-sm btn-with-icon"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SubAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} subAdmin={editingSubAdmin} />
    </>
  );
};

export default SubAdminManagement;