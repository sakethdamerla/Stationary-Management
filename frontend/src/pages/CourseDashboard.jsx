import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit, Trash2 } from 'lucide-react';

const PageStyles = () => (
  <style>{`
    .students-table-modern {
      border-collapse: collapse;
      width: 100%;
    }
    .students-table-modern th,
    .students-table-modern td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      vertical-align: middle;
    }
    .students-table-modern th {
      background-color: #f2f2f2;
    }
    .course-dashboard-page .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .course-dashboard-page .page-title-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .course-dashboard-page .page-icon {
      font-size: 2rem;
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      border-radius: 0.5rem;
    }
    .course-dashboard-page .page-title {
      font-size: 1.875rem;
      font-weight: bold;
    }
    .course-dashboard-page .page-subtitle {
      color: #6b7280;
    }
    .course-dashboard-page .page-actions {
      display: flex;
      gap: 0.75rem;
    }
    .course-dashboard-page .btn-with-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .course-dashboard-page .filters-card {
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
    .course-dashboard-page .search-wrapper {
      position: relative;
      flex-grow: 1;
    }
    .course-dashboard-page .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }
    .course-dashboard-page .search-input {
      width: 100%;
      padding-left: 2.5rem;
    }
    .items-cell .items-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  `}</style>
);

const CourseDashboard = ({ products = [] }) => {
  const { course } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${course}`);
        if (response.ok) {
          const data = (await response.json()).map(s => ({...s, id: s._id}));
          setStudents(data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    if (course) {
      fetchStudents();
    }
  }, [course]);

  const [yearFilter, setYearFilter] = useState('all');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'all' || String(student.year) === String(yearFilter);
      return matchesSearch && matchesYear;
    });
  }, [students, searchTerm, yearFilter]);

  const handleItemToggle = (studentId, itemName) => {
    const updatedStudents = students.map(student => {
      if (student._id === studentId) {
        const items = { ...(student.items || {}) };
        items[itemName] = !Boolean(items[itemName]);
        const updatedStudent = { ...student, items };
        fetch(`/api/users/${course}/${student._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paid: updatedStudent.paid, items: updatedStudent.items }),
        }).catch(err => console.error('Failed to update student:', err));
        return updatedStudent;
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const handlePaidToggle = (studentId) => {
    const updatedStudents = students.map(student => {
      if (student._id === studentId) {
        const updatedStudent = { ...student, paid: !student.paid };
        fetch(`/api/users/${course}/${student._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paid: updatedStudent.paid, items: updatedStudent.items }),
        }).catch(err => console.error('Failed to update student:', err));
        return updatedStudent;
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const yearOptions = Array.from(new Set(students.map(s => s.year))).sort((a, b) => a - b);

  const getCourseIcon = (course) => {
    switch (course) {
      case 'b.tech':
        return '🎓';
      case 'diploma':
        return '📜';
      case 'degree':
        return '🎖️';
      default:
        return '📚';
    }
  };

  const getCourseColor = (course) => {
    switch (course) {
      case 'b.tech':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'diploma':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'degree':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default:
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    }
  };

  const StudentRow = ({ student }) => {
    const visibleItems = useMemo(() => {
      return (products || []).filter(p => {
        if (p.forCourse && p.forCourse !== student.course) return false;
        if (p.year && Number(p.year) !== Number(student.year)) return false;
        return true;
      });
    }, [products, student.course, student.year]);

    const handleDelete = () => {
      if (window.confirm('Are you sure you want to delete this student?')) {
        fetch(`/api/users/${course}/${student._id}`, { method: 'DELETE' })
          .then(res => {
            if (res.ok) {
              setStudents(prev => prev.filter(s => s._id !== student._id));
            } else {
              throw new Error('Delete failed');
            }
          })
          .catch(err => console.error('Delete failed:', err));
      }
    };

    return (
      <tr key={student._id}>
        <td className="student-name-cell">
          <div className="student-info">
            <span className="student-name">{student.name}</span>
          </div>
        </td>
        <td className="student-id-cell">
          <span className="student-id-badge">{student.studentId}</span>
        </td>
        <td className="student-year-cell">
          <span className="year-badge">Year {student.year}</span>
        </td>
        <td className="student-branch-cell">
          <span className="branch-text">{student.branch || 'N/A'}</span>
        </td>
        <td className="paid-status-cell">
          <label className="toggle-switch-modern">
            <input
              type="checkbox"
              checked={student.paid}
              onChange={() => handlePaidToggle(student._id)}
            />
            <span className="slider-modern"></span>
          </label>
          <span className={`status-text ${student.paid ? 'paid' : 'unpaid'}`}>
            {student.paid ? 'Paid' : 'Unpaid'}
          </span>
        </td>
        <td className="items-cell">
          <div className="items-container">
            {visibleItems.map(item => {
              const key = item.name.toLowerCase().replace(/\s+/g, '_');
              return (
                <label key={key} className="item-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(student.items && student.items[key])}
                    onChange={() => handleItemToggle(student._id, key)}
                  />
                  <span className="item-name">{item.name}</span>
                </label>
              );
            })}
            {visibleItems.length === 0 && <span className="no-items text-xs text-gray-500">No items</span>}
          </div>
        </td>
        <td className="actions-cell">
          <div className="action-buttons">
            <button className="btn btn-outline btn-sm btn-with-icon" onClick={() => navigate(`/student/${student.id}`)}><Edit size={14} /></button>
            <button className="btn btn-danger btn-sm btn-with-icon" onClick={handleDelete}><Trash2 size={14} /></button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading {course} students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-dashboard-page container">
      <PageStyles />
      {/* Header Section */}
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-icon" style={{ background: getCourseColor(course), color: 'white' }}>
            {getCourseIcon(course)}
          </div>
          <div>
            <h1 className="page-title">{course.toUpperCase()} Students</h1>
            <p className="page-subtitle">
              {students.length} {students.length === 1 ? 'student' : 'students'} enrolled
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-with-icon" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <button className="btn btn-primary btn-with-icon" onClick={() => navigate('/add-student')}>
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* Controls Section */}
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
        <select 
          value={yearFilter} 
          onChange={(e) => setYearFilter(e.target.value)}
          className="form-select w-full sm:w-48"
        >
          <option value="all">All Years</option>
          {yearOptions.map(year => (
            <option key={year} value={year}>Year {year}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div>
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || yearFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Start by adding students to this course'
              }
            </p>
            {!searchTerm && yearFilter === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/add-student')}
              >
                Add First Student
              </button>
            )}
          </div>
        ) : (
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Student List</h3>
              <span className="table-count">{filteredStudents.length} students</span>
            </div>
            <div className="table-container">
              <table className="students-table-modern">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Year</th>
                    <th>Branch</th>
                    <th>Payment Status</th>
                    <th>Items</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <StudentRow key={student._id} student={student} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDashboard;