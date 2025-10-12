import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Dashboard from './pages/Dashboard';
import StudentDetail from './pages/StudentDetail';
import CourseDashboard from './pages/CourseDashboard';
import AddStudent from './pages/AddStudent';
import StudentManagement from './pages/StudentManagement';
import Login from './pages/Login';
import ItemsList from './pages/ItemsList';
import HomePage from './pages/HomePage';

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
  const [itemCategories, setItemCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentCourse, setCurrentCourse] = useState('');
  // Initialize isAuthenticated from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('isAuthenticated'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Fetch global products on app load to populate products and itemCategories
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        const cats = Array.from(new Set((data || []).map(p => p.name.toLowerCase().replace(/\s+/g, '_'))));
        setItemCategories(cats);
      })
      .catch((err) => {
        console.warn('Could not fetch products on app load:', err);
      });
  }, []);

  // Listen to item category edit/delete events dispatched from ItemsList
  useEffect(() => {
    const onRemove = (e) => {
      const name = e.detail;
      setItemCategories((prev) => prev.filter((i) => i !== name));
      // Remove the item key from all students
      setStudents((prev) => prev.map(s => {
        if (!s.items) return s;
        const { [name]: removed, ...rest } = s.items;
        return { ...s, items: rest };
      }));
    };

    const onEdit = (e) => {
      const { oldVal, newVal } = e.detail;
      const normalizedNew = newVal.toLowerCase().replace(/\s+/g, '_');
      setItemCategories((prev) => prev.map(i => i === oldVal ? normalizedNew : i));
      setStudents((prev) => prev.map(s => {
        const items = s.items || {};
        if (items.hasOwnProperty(oldVal)) {
          const val = items[oldVal];
          const { [oldVal]: removed, ...rest } = items;
          return { ...s, items: { ...rest, [normalizedNew]: val } };
        }
        return s;
      }));
    };

    window.addEventListener('removeItemCategory', onRemove);
    window.addEventListener('editItemCategory', onEdit);
    return () => {
      window.removeEventListener('removeItemCategory', onRemove);
      window.removeEventListener('editItemCategory', onEdit);
    };
  }, []);

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
    // This method now only updates client-side categories; server products are source of truth
    if (itemCategories.includes(newItem) || newItem.trim() === '') return;
    const newItemCategory = newItem.toLowerCase().replace(/\s+/g, '_');
    setItemCategories((prev) => [...prev, newItemCategory]);
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
    <div className="flex min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <>
          <Sidebar 
            onLogout={handleLogout} 
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <main className={`
            flex-1 min-h-screen bg-gray-50 flex justify-center items-start transition-all duration-300
            ${isMobile 
              ? 'ml-0 pt-20 px-4' 
              : 'ml-80 px-8'
            }
          `}>
            {isMobile && (
              <button 
                className="fixed top-4 left-4 z-50 w-12 h-12 rounded-xl bg-primary-500 border-none text-white flex items-center justify-center cursor-pointer shadow-strong transition-all duration-200 hover:bg-primary-600 hover:scale-105"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={24} />
              </button>
            )}
            <div className="w-full max-w-7xl mx-auto">
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard />}
                />
                <Route
                  path="/course/:course"
                  element={<CourseDashboard products={products} />}
                />
                <Route
                  path="/student/:id"
                  element={<StudentDetail students={students} setStudents={setStudents} products={products} />}
                />
                <Route
                  path="/add-student"
                  element={<AddStudent addStudent={addStudent} />}
                />
                <Route
                  path="/student-management"
                  element={<StudentManagement students={students} setStudents={setStudents} addStudent={addStudent} />}
                />
                <Route
                  path="/items"
                  element={<ItemsList itemCategories={itemCategories} addItemCategory={addItemCategory} setItemCategories={setItemCategories} currentCourse={currentCourse} products={products} setProducts={setProducts} />}
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
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
