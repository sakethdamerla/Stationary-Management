import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const StudentDetail = ({ students = [], setStudents, products = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = students.find(s => String(s.id) === String(id));
    setStudent(s || null);
  }, [id, students]);

  if (!student) {
    return (
      <div className="dashboard-container">
        <h2>Student not found</h2>
        <p>Either the student doesn't exist or it hasn't loaded yet.</p>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  const updateStudentOnServer = async (updated) => {
    try {
      setSaving(true);
      await fetch(`/api/users/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: updated.paid, items: updated.items }),
      });
    } catch (err) {
      console.error('Failed to update student:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePaidToggle = () => {
    const updated = { ...student, paid: !student.paid };
    setStudent(updated);
    setStudents(prev => prev.map(p => p.id === updated.id ? updated : p));
    updateStudentOnServer(updated);
  };

  const handleItemToggle = (itemKey) => {
    const items = { ...(student.items || {}) };
    items[itemKey] = !Boolean(items[itemKey]);
    const updated = { ...student, items };
    setStudent(updated);
    setStudents(prev => prev.map(p => p.id === updated.id ? updated : p));
    updateStudentOnServer(updated);
  };

  // derive visible items for this student's course/year
  const visibleItems = (products || []).filter(p => {
    if (p.forCourse && p.forCourse !== student.course) return false;
    if (p.year && Number(p.year) !== Number(student.year)) return false;
    return true;
  });

  return (
    <div className="dashboard-container">
      <h1>{student.name}</h1>
      <div className="controls" style={{ alignItems: 'flex-start' }}>
        <div style={{ minWidth: 220 }}>
          <p><strong>Student ID:</strong> {student.studentId}</p>
          <p><strong>Course:</strong> {student.course}</p>
          <p><strong>Year:</strong> {student.year}</p>
          <p>
            <strong>Paid:</strong>{' '}
            <input type="checkbox" checked={Boolean(student.paid)} onChange={handlePaidToggle} />
          </p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Back</button>
          <span style={{ marginLeft: 8 }}>{saving ? 'Saving...' : ''}</span>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Items</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
            {visibleItems.length === 0 && <div style={{ color: '#6b7280' }}>No items configured for this course/year.</div>}
            {visibleItems.map(p => {
              const key = p.name.toLowerCase().replace(/\s+/g, '_');
              return (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: 'var(--card)', borderRadius: 6 }}>
                  <input type="checkbox" checked={Boolean(student.items && student.items[key])} onChange={() => handleItemToggle(key)} />
                  <span>{p.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
