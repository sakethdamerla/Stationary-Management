import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!onLogin(id, password)) {
      setError('Invalid ID or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-strong border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-bounce-gentle">🎓</div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-2">Access the College Stationery Management System</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="id" className="form-label">User ID</label>
              <input
                type="text"
                id="id"
                className="form-input"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter your user ID"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary w-full">
              <span className="text-lg">🔐</span>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;