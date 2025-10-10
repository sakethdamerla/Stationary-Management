import { useState, useEffect, useMemo } from 'react';
import './AddStudent.css';

const StudentManagement = ({ students = [], setStudents, addStudent }) => {
  // add form fields (modal)
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('b.tech');
  const [year, setYear] = useState('1');
  const [branch, setBranch] = useState('CSE');
  const [message, setMessage] = useState('');
  // Bulk upload state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkMessage, setBulkMessage] = useState('');

  // editing
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});

  // Filters (like Dashboard)
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !studentId || !course || !year) {
      setMessage('All fields are required.');
      return;
    }

    const newStudent = { name, studentId, course, year: Number(year), branch };
    const result = await addStudent(newStudent);
    if (result.success) {
      setMessage('Student added successfully!');
      setName(''); setStudentId(''); setYear('1'); setBranch('CSE'); setCourse('b.tech');
    } else setMessage(result.message || 'Add failed');
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditFields({ name: s.name, studentId: s.studentId, course: s.course, year: s.year, branch: s.branch });
  };

  const cancelEdit = () => { setEditingId(null); setEditFields({}); };

  const saveEdit = async (id) => {
    try {
      // PATCH via existing update endpoint: update only course/year/branch/name/studentId not available in backend, so we'll simulate by deleting+recreating? Instead, call backend register is only for create; updateUser only edits items/paid. So implement client-side update by calling backend PUT on /api/users/:id to update allowed fields via a small endpoint.
      // We'll call a new backend route `/api/users/:id` (PUT) that supports updating basic profile fields if available.
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFields),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setStudents(prev => prev.map(p => p.id === id ? { ...p, ...editFields } : p));
      cancelEdit();
    } catch (err) {
      console.error('Edit failed', err);
      setMessage('Edit failed: ' + (err.message || ''));
    }
  };

  const deleteStudent = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      setMessage('Delete failed');
    }
  };

  return (
    <div className="add-student-container">
      <div className="page-header">
        <h1 className="page-title">Student Management</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Student</button>
          <button className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => setShowBulkModal(true)}>Bulk Add</button>
        </div>
      </div>

      {/* Filters (search / course / year) */}
      <div className="controls" style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
        <input
          type="text"
          placeholder="Search by name or roll no..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '6px 8px', flex: '1 1 300px' }}
        />
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="all">All Courses</option>
          {Array.from(new Set((students || []).map(s => s.course).filter(Boolean))).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="all">All Years</option>
          {Array.from(new Set((students || []).map(s => String(s.year)).filter(Boolean))).sort().map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* compute filtered list */}
      {/**
       * Note: we compute filteredStudents below so the table shows the same
       * behaviour as the Dashboard filter (search + course + year)
       */}
      <div className="management-layout">
        <div className="management-right card">
          <div className="card-header"><h3>Students</h3></div>
          <div className="students-list">
            <table className="students-table">
              <thead>
                <tr><th>Name</th><th>Pin</th><th>Course</th><th>Year</th><th>Branch</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {(students || [])
                  .filter(student => {
                    const term = (searchTerm || '').toLowerCase();
                    if (term) {
                      const match = (String(student.name || '').toLowerCase().includes(term) || String(student.studentId || '').toLowerCase().includes(term));
                      if (!match) return false;
                    }
                    if (courseFilter !== 'all' && String(student.course) !== String(courseFilter)) return false;
                    if (yearFilter !== 'all' && String(student.year) !== String(yearFilter)) return false;
                    return true;
                  })
                  .map(s => (
                  <tr key={s.id} className="students-row">
                    <td className="cell-name">{editingId === s.id ? <input value={editFields.name} onChange={e => setEditFields(prev => ({...prev, name: e.target.value}))} /> : s.name}</td>
                    <td className="cell-pin">{editingId === s.id ? <input value={editFields.studentId} onChange={e => setEditFields(prev => ({...prev, studentId: e.target.value}))} /> : s.studentId}</td>
                    <td className="cell-course">{editingId === s.id ? <select value={editFields.course} onChange={e => setEditFields(prev => ({...prev, course: e.target.value}))}><option value="b.tech">b.tech</option><option value="diploma">diploma</option></select> : s.course}</td>
                    <td className="cell-year">{editingId === s.id ? <input value={editFields.year} onChange={e => setEditFields(prev => ({...prev, year: e.target.value}))} className="small-input" /> : s.year}</td>
                    <td className="cell-branch">{editingId === s.id ? <input value={editFields.branch} onChange={e => setEditFields(prev => ({...prev, branch: e.target.value}))} /> : s.branch}</td>
                    <td className="cell-actions">
                      {editingId === s.id ? (
                        <>
                          <button className="btn btn-primary" onClick={() => saveEdit(s.id)}>Save</button>
                          <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-outline" onClick={() => startEdit(s)}>Edit</button>
                          <button className="btn btn-danger" onClick={() => deleteStudent(s.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="modal-backdrop bulk-modal" onClick={() => setShowBulkModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Bulk Add Students (Excel)</h3>
            <p>Upload an Excel (.xlsx or .csv) file with columns: name, studentId, course, year, branch</p>
            <div className="file-input">
              <input type="file" accept=".xlsx,.xls,.csv" onChange={e => { setBulkFile(e.target.files && e.target.files[0]); setBulkMessage(''); }} />
            </div>
            <div className="bulk-actions">
              <button className="btn-upload" onClick={async () => {
                if (!bulkFile) { setBulkMessage('Please select a file'); return; }
                try {
                  setBulkMessage('Uploading...');
                  const fd = new FormData();
                  fd.append('file', bulkFile);
                  const res = await fetch('/api/users/import', { method: 'POST', body: fd });
                  if (!res.ok) throw new Error('Upload failed');
                  const data = await res.json();
                  // Expect backend to return { imported: [...students] }
                  if (data && Array.isArray(data.imported)) {
                    setStudents(prev => [...(prev||[]), ...data.imported]);
                    setBulkMessage(`Imported ${data.imported.length} students`);
                    setBulkFile(null);
                  } else {
                    setBulkMessage('Import finished but no students returned');
                  }
                } catch (err) {
                  console.error('Bulk upload failed', err);
                  setBulkMessage('Bulk upload failed: ' + (err.message || ''));
                }
              }}>Upload</button>
              <button className="btn-cancel" onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(''); }}>Cancel</button>
            </div>
            {bulkMessage && <div className="bulk-message">{bulkMessage}</div>}
          </div>
        </div>
      )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <h3>Add Student</h3>
              <form onSubmit={(e) => { handleSubmit(e); setShowAddModal(false); }} className="add-student-form">
                <div className="form-group"><label>Student Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="form-group"><label>Pin Number</label><input value={studentId} onChange={e => setStudentId(e.target.value)} /></div>
                <div className="form-group"><label>Course</label>
                  <select value={course} onChange={e => setCourse(e.target.value)}>
                    <option value="b.tech">B.Tech</option>
                    <option value="diploma">Diploma</option>
                    <option value="degree">Degree</option>
                  </select>
                </div>
                <div className="form-group"><label>Year</label>
                  <select value={year} onChange={e => setYear(e.target.value)}>
                    {(course === 'b.tech' ? [1,2,3,4] : [1,2,3]).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Branch</label>
                  <select value={branch} onChange={e => setBranch(e.target.value)}>
                    {course === 'b.tech' ? <>
                      <option value="CSE">CSE</option><option value="ECE">ECE</option>
                    </> : <>
                      <option value="General">General</option>
                    </>}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary">Add Student</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default StudentManagement;
