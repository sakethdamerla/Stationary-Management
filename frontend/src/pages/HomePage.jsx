import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-strong border border-gray-200 p-12">
          <div className="mb-8">
            <div className="text-8xl mb-6 animate-bounce-gentle">🎓</div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to the College Stationery Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Streamline your college's stationery distribution and student management with our comprehensive platform.
            </p>
          </div>
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-white font-semibold text-lg rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-soft hover:shadow-medium hover:-translate-y-1"
            >
              <span className="text-xl">🔐</span>
              Admin Login
            </Link>
            <div className="text-sm text-gray-500">
              Access the administrator dashboard to manage students and stationery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;