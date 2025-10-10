import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const normalize = (s) => (s || '').toString().toLowerCase().replace(/\s+/g, '_');

const CourseDashboard = ({ students = [], setStudents, products = [] }) => {
  const { course } = useParams();
  const navigate = useNavigate();
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const courseStudents = students.filter(s => s.course === course);

  const filteredStudents = courseStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Determine visible items for this course (all years combined)
  const visibleItems = useMemo(() => {
    return Array.from(new Set((products || []).filter(p => {
      if (p.forCourse && p.forCourse !== course) return false;
      return true;
    }).map(p => normalize(p.name))));
  }, [products, course]);

  const productByKey = useMemo(() => {
    const m = new Map();
    (products || []).forEach(p => m.set(normalize(p.name), p));
    return m;
  }, [products]);

  const updateStudentOnServer = async (student) => {
    try {
      await fetch(`/api/users/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: student.paid, items: student.items }),
      });
    } catch (err) {
      console.error('Failed to update student:', err);
    }
  };

  const handleItemToggle = (studentId, itemName) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const items = { ...(student.items || {}) };
        items[itemName] = !Boolean(items[itemName]);
        const updatedStudent = { ...student, items };
        setDirtyIds(prev => new Set(prev).add(studentId));
        updateStudentOnServer(updatedStudent);
        return updatedStudent;
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const handlePaidToggle = (studentId) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const updatedStudent = { ...student, paid: !student.paid };
        setDirtyIds(prev => new Set(prev).add(studentId));
        updateStudentOnServer(updatedStudent);
        return updatedStudent;
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const ids = Array.from(dirtyIds);
      await Promise.all(ids.map(id => {
        const student = students.find(s => s.id === id);
        if (!student) return Promise.resolve();
        return fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paid: student.paid, items: student.items }),
        });
      }));
      setDirtyIds(new Set());
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container container">
      <h1 className="mb-2">Course: {course}</h1>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or roll no..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
        <button className="btn btn-primary" onClick={saveChanges} disabled={dirtyIds.size === 0 || saving}>
          {saving ? 'Saving...' : `Save Changes${dirtyIds.size > 0 ? ` (${dirtyIds.size})` : ''}`}
        </button>
      </div>

      <div className="table-wrapper card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Year</th>
              <th>Paid</th>
              {visibleItems.map(item => (
                <th key={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.studentId}</td>
                <td>{student.year}</td>
                <td>
                  <input type="checkbox" checked={student.paid} onChange={() => handlePaidToggle(student.id)} />
                </td>
                {visibleItems.map(item => {
                  const prod = productByKey.get(item);
                  const applies = prod ? ((prod.forCourse === '' || prod.forCourse === student.course) && (prod.year === 0 || Number(prod.year) === Number(student.year))) : true;
                  return (
                    <td key={item}>
                      {applies ? (
                        <input type="checkbox" checked={Boolean(student.items && student.items[item])} onChange={() => handleItemToggle(student.id, item)} />
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseDashboard;
