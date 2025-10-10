import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Accept products so we can compute which items apply to which course/year
const Dashboard = ({ students, setStudents, itemCategories, products = [], setCurrentCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // default filters: show All by default
  const [courseFilter, setCourseFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const updateStudentOnServer = async (student) => {
    try {
      const response = await fetch(`/api/users/${student.id}`, {
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
          // mark dirty
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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByCourseYear = filteredStudents.filter(student => {
    if (courseFilter !== 'all' && student.course !== courseFilter) return false;
    if (yearFilter !== 'all' && String(student.year) !== String(yearFilter)) return false;
    return true;
  });

  const navigate = useNavigate();

  // Build option lists from both students and products so filters show available values even when no students exist
  const courseOptions = useMemo(() => {
    const fromStudents = students.map(s => s.course).filter(Boolean);
    const fromProducts = products.map(p => p.forCourse).filter(Boolean);
    return Array.from(new Set(['b.tech','diploma','degree', ...fromStudents, ...fromProducts]));
  }, [students, products]);

  const yearOptions = useMemo(() => {
    const fromStudents = students.map(s => Number(s.year)).filter(Boolean);
    const fromProducts = products.map(p => Number(p.year)).filter(Boolean);
    const vals = Array.from(new Set([1,2,3,4, ...fromStudents, ...fromProducts]));
    return vals.sort((a,b) => a - b);
  }, [students, products]);

  // Normalize helper
  const normalize = (s) => (s || '').toString().toLowerCase().replace(/\s+/g, '_');

  // Determine which products should be columns: products that match the active filters (strict)
  const visibleItems = useMemo(() => {
    return Array.from(new Set((products || []).filter(p => {
      if (courseFilter !== 'all' && p.forCourse && p.forCourse !== courseFilter) return false;
      if (yearFilter !== 'all' && p.year && Number(p.year) !== Number(yearFilter)) return false;
      return true;
    }).map(p => normalize(p.name))));
  }, [products, courseFilter, yearFilter]);

  // Map normalized name -> product
  const productByKey = useMemo(() => {
    const m = new Map();
    (products || []).forEach(p => m.set(normalize(p.name), p));
    return m;
  }, [products]);

  // (courseOptions, yearOptions, visibleItems computed above)

  return (
    <div className="dashboard-container container">
      <h1 className="mb-2">Student Dashboard</h1>
      <div className="course-cards" style={{ width: '100%', maxWidth: 1100, display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        {courseOptions.map(c => (
          <div key={c} className="course-card card" onClick={() => { navigate(`/course/${c}`); setCourseFilter(c); }} style={{ cursor: 'pointer', padding: 12, minWidth: 160, flex: '0 0 160px' }}>
            <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{c}</h4>
            <div style={{ color: '#6b7280', fontSize: 14 }}>{students.filter(s => s.course === c).length} students</div>
          </div>
        ))}
      </div>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or roll no..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setCurrentCourse && setCurrentCourse(e.target.value === 'all' ? '' : e.target.value); }}>
          <option value="all">All Courses</option>
          {courseOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="all">All Years</option>
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
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
              <th>Paid</th>
              {visibleItems.map(item => (
                <th key={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredByCourseYear.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.studentId}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={student.paid}
                    onChange={() => handlePaidToggle(student.id)}
                  />
                </td>
                {visibleItems.map(item => {
                  const prod = productByKey.get(item);
                  const applies = prod ? ((prod.forCourse === '' || prod.forCourse === student.course) && (prod.year === 0 || Number(prod.year) === Number(student.year))) : true;
                  return (
                    <td key={item}>
                      {applies ? (
                        <input
                          type="checkbox"
                          checked={Boolean(student.items && student.items[item])}
                          onChange={() => handleItemToggle(student.id, item)}
                        />
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

      {/* course modal removed; navigation now goes to dedicated course page */}
    </div>
  );
};

export default Dashboard;