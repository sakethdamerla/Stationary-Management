import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddStudent.css';

const AddStudent = ({ addStudent }) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('b.tech');
  const [year, setYear] = useState('1');
  const [branch, setBranch] = useState('CSE');
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
      branch,
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
          <select id="course" value={course} onChange={(e) => {
            const newCourse = e.target.value;
            setCourse(newCourse);
            // reset year/branch to first valid option for that course
            setYear('1');
            if (newCourse === 'b.tech') setBranch('CSE');
            else setBranch('General');
          }}>
            <option value="b.tech">B.Tech</option>
            <option value="diploma">Diploma</option>
            <option value="degree">Degree</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
            {(course === 'b.tech' ? [1,2,3,4] : [1,2,3]).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="branch">Branch</label>
          <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
            {course === 'b.tech' ? (
              <>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="EEE">EEE</option>
              </>
            ) : (
              <>
                <option value="General">General</option>
                <option value="IT">IT</option>
                <option value="Management">Management</option>
              </>
            )}
          </select>
        </div>
  <button type="submit" className="btn btn-primary">Add Student</button>
        {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}
      </form>
    </div>
  );
};

export default AddStudent;