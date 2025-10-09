import { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ students, setStudents, itemCategories }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
        const updatedStudent = { ...student, items: { ...student.items, [itemName]: !student.items[itemName] } };
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
        updateStudentOnServer(updatedStudent);
        return updatedStudent;
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or roll no..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Paid</th>
              {itemCategories.map(item => (
                <th key={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
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
                {itemCategories.map(item => (
                  <td key={item}>
                    <input
                      type="checkbox"
                      checked={student.items[item]}
                      onChange={() => handleItemToggle(student.id, item)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;