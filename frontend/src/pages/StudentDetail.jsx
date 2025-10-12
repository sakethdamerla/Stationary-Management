import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Student not found</h2>
          <p className="text-gray-600 mb-6">Either the student doesn't exist or it hasn't loaded yet.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Back</button>
        </div>
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{student.name}</h1>
        <p className="text-gray-600">Student Details & Stationery Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Student ID:</span>
                <p className="text-gray-900 font-semibold">{student.studentId}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Course:</span>
                <p className="text-gray-900 font-semibold">{student.course.toUpperCase()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Year:</span>
                <p className="text-gray-900 font-semibold">Year {student.year}</p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-500">Payment Status:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={Boolean(student.paid)} 
                    onChange={handlePaidToggle}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {student.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </label>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="btn btn-primary w-full" onClick={() => navigate(-1)}>
                ← Back
              </button>
              {saving && (
                <div className="mt-2 text-sm text-gray-500 text-center">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
                    Saving...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stationery Items</h3>
            {visibleItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-500">No items configured for this course/year.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleItems.map(p => {
                  const key = p.name.toLowerCase().replace(/\s+/g, '_');
                  const isChecked = Boolean(student.items && student.items[key]);
                  return (
                    <label 
                      key={key} 
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isChecked 
                          ? 'border-primary-200 bg-primary-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => handleItemToggle(key)}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className={`font-medium ${isChecked ? 'text-primary-700' : 'text-gray-700'}`}>
                        {p.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
