import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddStudent.css';

const AddStudent = ({ addStudent }) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !studentId || !course || !year) {
      setMessage('All fields are required.');
      return;
    }

    const newStudent = {
      name,
      studentId,
      course,
      year: parseInt(year, 10), // Ensure year is a number
    };

    const result = await addStudent(newStudent);

    if (result.success) {
      setMessage('Student added successfully!');
      // Reset form and navigate away after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      // Display the error message from the backend
      setMessage(result.message || 'An error occurred.');
    }
  };

  return (
    <div className="add-student-container">
      <h1>Add New Student</h1>
      <form onSubmit={handleSubmit} className="add-student-form">
        <div className="form-group">
          <label htmlFor="name">Student Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="studentId">Pin Number</label>
          <input type="text" id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="course">Course</label>
          <input type="text" id="course" value={course} onChange={(e) => setCourse(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)} />
        </div>
        <button type="submit">Add Student</button>
        {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}
      </form>
    </div>
  );
};

export default AddStudent;