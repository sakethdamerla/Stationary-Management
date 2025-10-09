import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="page-wrapper">
      <div className="home-container">
        <div className="home-content">
          <h1>Welcome to the College Stationary Management System</h1>
          <p>Please log in to access the administrator dashboard.</p>
          <Link to="/login" className="login-button-home">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;