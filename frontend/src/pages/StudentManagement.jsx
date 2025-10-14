import { useState, useEffect, useMemo } from 'react';
import { Plus, Upload, Search } from 'lucide-react';
//student management page with add/edit/delete and bulk upload

const TableStyles = () => (
  <style>{`
    .students-table-modern {
      border-collapse: collapse; /* This is crucial for table borders to look right */
      width: 100%;
    }
    .students-table-modern th,
    .students-table-modern td {
      border: 1px solid #ddd; /* Adds borders to all cells */
      padding: 8px;
      text-align: left;
    }
    .students-table-modern th {
      background-color: #f2f2f2; /* A light grey background for headers */
    }

    /* New styles for improved layout and components */
    .student-management-page .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .student-management-page .page-title-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .student-management-page .page-icon {
      background-color: #eef2ff;
      color: #4f46e5;
      border-radius: 0.5rem;
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      font-size: 1.5rem;
    }
    .student-management-page .page-title {
      font-size: 1.875rem;
      font-weight: bold;
      color: #111827;
    }
    .student-management-page .page-subtitle {
      color: #6b7280;
      margin-top: 0.25rem;
    }
    .student-management-page .page-actions {
      display: flex;
      gap: 0.75rem;
    }
    .student-management-page .btn-with-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .student-management-page .filters-card {
      background: white;
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }
    .student-management-page .search-wrapper {
      position: relative;
      flex-grow: 1;
    }
    .student-management-page .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }
    .student-management-page .search-input {
      width: 100%;
      padding-left: 2.5rem;
    }

    .student-management-page .add-student-form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .student-management-page .form-group.full-width {
      grid-column: 1 / -1;
    }
    .student-management-page .modal-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      grid-column: 1 / -1;
    }
    .student-management-page .bulk-modal .file-input {
      margin: 1rem 0;
      background: #f9fafb;
      border: 1px dashed #d1d5db;
      border-radius: 0.75rem;
      padding: 1rem;
    }
    .student-management-page .bulk-modal .file-input input[type="file"] {
      width: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #374151;
    }
    .student-management-page .bulk-modal h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.25rem;
    }
    .student-management-page .bulk-modal .bulk-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .student-management-page .bulk-modal .btn-upload {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.5rem 0.875rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: transform 120ms ease, background 120ms ease;
    }
    .student-management-page .bulk-modal .btn-upload:hover { background: #0ea371; transform: translateY(-1px); }
    .student-management-page .bulk-modal .btn-upload:active { transform: translateY(0); }
    .student-management-page .bulk-message {
      margin-top: 0.75rem;
      font-size: 0.875rem;
      color: #374151;
    }
    /* Modal presentation */
    .student-management-page .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(17, 24, 39, 0.5);
      display: grid;
      place-items: center;
      z-index: 50;
      padding: 1rem;
    }
    .student-management-page .modal-card {
      width: 100%;
      max-width: 640px;
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      padding: 1.25rem;
    }
  `}</style>
);

/**
 * @typedef {object} Student
 * @property {string} id
 * @property {string} name
 * @property {string} studentId
 * @property {string} course
 * @property {number} year
 * @property {string} branch
 */

/**
 * A single row in the student table.
 * Handles both display and edit states for a student.
 * @param {{
 *  student: Student,
 *  editingId: string | null,
 *  editFields: object,
 *  setEditFields: React.Dispatch<React.SetStateAction<object>>,
 *  startEdit: (student: Student) => void,
 *  saveEdit: (id: string) => Promise<void>,
 *  cancelEdit: () => void,
 *  deleteStudent: (student: Student) => Promise<void>
 * }} props
 */
const StudentRow = ({ student, editingId, editFields, setEditFields, startEdit, saveEdit, cancelEdit, deleteStudent }) => {
  const isEditing = editingId === student.id;

  if (isEditing) {
    return (
      <tr className="student-row editing">
        <td><input className="edit-input" value={editFields.name} onChange={e => setEditFields(prev => ({...prev, name: e.target.value}))} /></td>
        <td><input className="edit-input" value={editFields.studentId} onChange={e => setEditFields(prev => ({...prev, studentId: e.target.value}))} /></td>
        <td>
          <select className="edit-select" value={editFields.course} onChange={e => setEditFields(prev => ({...prev, course: e.target.value}))}>
            <option value="b.tech">B.Tech</option><option value="diploma">Diploma</option><option value="degree">Degree</option>
          </select>
        </td>
        <td><input className="edit-input small" type="number" value={editFields.year} onChange={e => setEditFields(prev => ({...prev, year: e.target.value}))} /></td>
        <td><input className="edit-input" value={editFields.branch} onChange={e => setEditFields(prev => ({...prev, branch: e.target.value}))} /></td>
        <td className="actions-cell">
          <div className="edit-actions"><button className="btn btn-success btn-sm" onClick={() => saveEdit(student.id)}>Save</button><button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button></div>
        </td>
      </tr>
    );
  }

  return (
    <tr key={student.id} className="student-row">
      <td className="student-name-cell">
        <div className="student-info">
          {/* <div className="student-avatar">{student.name.charAt(0).toUpperCase()}</div> */}
          <span className="student-name">{student.name}</span>
        </div>
      </td>
      <td className="student-id-cell"><span className="student-id-badge">{student.studentId}</span></td>
      <td className="course-cell"><span className="course-badge">{student.course.toUpperCase()}</span></td>
      <td className="year-cell"><span className="year-badge">Year {student.year}</span></td>
      <td className="branch-cell"><span className="branch-text">{student.branch || 'N/A'}</span></td>
      <td className="actions-cell">
        <div className="action-buttons">
          <button className="btn btn-outline btn-sm" onClick={() => startEdit(student)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => deleteStudent(student)}>Delete</button>
        </div>
      </td>
    </tr>
  );
};

const StudentManagement = ({ students = [], setStudents, addStudent }) => {
  // add form fields (modal)
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('1');
  const [branch, setBranch] = useState('');
  const [config, setConfig] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/config/academic');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          const firstCourse = data.courses?.[0];
          if (firstCourse) {
            setCourse(firstCourse.name);
            setYear(String(firstCourse.years?.[0] || '1'));
            setBranch(firstCourse.branches?.[0] || '');
          }
        }
      } catch (_) {}
    })();
  }, []);
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

  const filteredStudents = useMemo(() => {
    return (students || []).filter(student => {
      const term = (searchTerm || '').toLowerCase();
      if (term) {
        const nameMatch = String(student.name || '').toLowerCase().includes(term);
        const idMatch = String(student.studentId || '').toLowerCase().includes(term);
        if (!nameMatch && !idMatch) return false;
      }
      if (courseFilter !== 'all' && String(student.course) !== String(courseFilter)) return false;
      if (yearFilter !== 'all' && String(student.year) !== String(yearFilter)) return false;
      return true;
    });
  }, [students, searchTerm, courseFilter, yearFilter]);

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
      const original = (students || []).find(s => s.id === id);
      const courseParam = String(original?.course || editFields.course || '').toLowerCase();
      const res = await fetch(`/api/users/${courseParam}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFields.name,
          studentId: editFields.studentId,
          year: Number(editFields.year),
          branch: editFields.branch,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json(); // eslint-disable-line
      setStudents(prev => prev.map(p => p.id === id ? { ...p, ...editFields, year: Number(editFields.year) } : p));
      cancelEdit();
    } catch (err) {
      console.error('Edit failed', err);
      setMessage('Edit failed: ' + (err.message || ''));
    }
  };

  const deleteStudent = async (student) => {
    const { id, course } = student;
    try {
      const courseParam = String(course || '').toLowerCase();
      const res = await fetch(`/api/users/${courseParam}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      setMessage('Delete failed');
    }
  };

  return (
    <div className="student-management-page container">
      <TableStyles />
      {/* Header Section */}
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-icon">👥</div>
          <div>
            <h1 className="page-title">Student Management</h1>
            <p className="page-subtitle">Manage all student records and information</p>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-with-icon" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Student
          </button>
          <button className="btn btn-outline btn-with-icon" onClick={() => setShowBulkModal(true)}>
            <Upload size={16} />
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or student ID..."
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
            <select 
              value={courseFilter} 
              onChange={(e) => setCourseFilter(e.target.value)}
            className="form-select"
            >
              <option value="all">All Courses</option>
              {Array.from(new Set((students || []).map(s => s.course).filter(Boolean))).map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
            <select 
              value={yearFilter} 
              onChange={(e) => setYearFilter(e.target.value)}
            className="form-select"
            >
              <option value="all">All Years</option>
              {Array.from(new Set((students || []).map(s => String(s.year)).filter(Boolean))).sort().map(y => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>
      </div>

      {/* Students Table */}
      <div>
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">All Students</h3>
            <span className="table-count">{filteredStudents.length} students</span>
          </div>
          <div className="table-container">
            <table className="students-table-modern">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    editingId={editingId}
                    editFields={editFields}
                    setEditFields={setEditFields}
                    startEdit={startEdit}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                    deleteStudent={deleteStudent}
                  />
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
                  // require course selection for import
                  const importCourse = courseFilter !== 'all' ? courseFilter : (config?.courses?.[0]?.name || '');
                  const res = await fetch(`/api/users/import/${importCourse}`, { method: 'POST', body: fd });
                  if (!res.ok) throw new Error('Upload failed');
                  const data = await res.json(); // eslint-disable-line
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
              <button className="btn btn-secondary" onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(''); }}>Cancel</button>
            </div>
            {bulkMessage && <div className="bulk-message">{bulkMessage}</div>}
          </div>
        </div>
      )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-medium mb-4">Add New Student</h3>
              <form onSubmit={(e) => { handleSubmit(e); setShowAddModal(false); }} className="add-student-form">
                <div className="form-group full-width"><label>Student Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="form-group full-width"><label>Pin Number</label><input className="form-input" value={studentId} onChange={e => setStudentId(e.target.value)} /></div>
                <div className="form-group"><label>Course</label>
                  <select className="form-select" value={course} onChange={e => setCourse(e.target.value)}>
                    {(config?.courses || []).map(c => (
                      <option key={c.name} value={c.name}>{c.displayName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group"><label>Year</label>
                  <select className="form-select" value={year} onChange={e => setYear(e.target.value)}>
                    {(config?.courses?.find(c => c.name === course)?.years || [1]).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group full-width"><label>Branch</label>
                  <select className="form-select" value={branch} onChange={e => setBranch(e.target.value)}>
                    {(config?.courses?.find(c => c.name === course)?.branches || ['']).map(b => (
                      <option key={b} value={b}>{b || 'N/A'}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
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
