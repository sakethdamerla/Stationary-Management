import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import AddStudent from './AddStudent';
import Login from './Login';
import ItemsList from './ItemsList';
import HomePage from './HomePage';
import './App.css';

// Hardcoded credentials for login
const credentials = [
  { id: 'admin1', password: 'password1' },
  { id: 'admin2', password: 'password2' },
  { id: 'admin3', password: 'password3' },
];

// Placeholder component for other routes
const Settings = () => <div className="placeholder-page"><h1>Settings</h1><p>This page is a placeholder for settings.</p></div>;

function App() {
  const [students, setStudents] = useState([]);
  const [itemCategories, setItemCategories] = useState(['books', 'uniform', 'blazer', 'apron']);
  // Initialize isAuthenticated from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('isAuthenticated'));
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Persist authentication state
      localStorage.setItem('isAuthenticated', 'true');

      // Use relative path to leverage the Vite proxy
      fetch('/api/users')
        .then((res) => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then((data) => {
          // Mongoose uses `_id` by default
          const formattedStudents = data.map(s => ({ ...s, id: s._id }));
          setStudents(formattedStudents);
        })
        .catch((err) => console.error('Failed to fetch students:', err));
    } else {
      // Clear authentication state
      localStorage.removeItem('isAuthenticated');
    }
  }, [isAuthenticated]);

  const addStudent = async (newStudent) => {
    try {
      // The newStudent object from the form should now contain name, studentId, course, and year
      // We'll add the other required fields before sending to the backend.
      const studentWithDefaults = {
        ...newStudent,
        email: `${newStudent.studentId}@pydah.com`, // Example email generation
        password: 'password123', // Default or generated password
      };
      // Use the correct relative endpoint for registration
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentWithDefaults),
      });

      if (!response.ok) {
        // Try to parse error JSON, but fallback to status text if it fails
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        if (response.status === 404) {
          throw new Error('API endpoint not found. Is the backend server running on port 5000?');
        }
        throw new Error(errorData.message || 'Failed to add student');
      }

      // The backend likely wraps the new user in a property, e.g., { user: { ... } }
      const responseData = await response.json();
      const savedStudent = responseData.user || responseData; // Adjust if the property name is different

      setStudents((prevStudents) => [...prevStudents, { ...savedStudent, id: savedStudent._id }]);
      return { success: true };
    } catch (error) {
      console.error('Error adding student:', error);
      return { success: false, message: error.message };
    }
  };

  const addItemCategory = (newItem) => {
    if (itemCategories.includes(newItem) || newItem.trim() === '') return;
    const newItemCategory = newItem.toLowerCase().replace(/\s+/g, '_');
    setItemCategories((prev) => [...prev, newItemCategory]);
    // Add the new item with a default value to all existing students
    setStudents((prevStudents) =>
      prevStudents.map((student) => ({
        ...student,
        items: {
          ...student.items,
          [newItemCategory]: false,
        },
      }))
    );
  };

  const handleLogin = (id, password) => {
    const user = credentials.find(cred => cred.id === id && cred.password === password);
    if (user) {
      setIsAuthenticated(true);
      navigate('/');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // No need to navigate here; the component will re-render to the public routes
  };

  return (
    <div className="app-container">
      {isAuthenticated ? (
        <>
          <Sidebar onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route
                path="/"
                element={<Dashboard students={students} setStudents={setStudents} itemCategories={itemCategories} />}
              />
              <Route
                path="/add-student"
                element={<AddStudent addStudent={addStudent} />}
              />
              <Route
                path="/items"
                element={<ItemsList itemCategories={itemCategories} addItemCategory={addItemCategory} />}
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
