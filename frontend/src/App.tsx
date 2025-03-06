import './App.css'
import { BrowserRouter, Link, Navigate, Route,  Routes , useLocation } from 'react-router-dom'
import Admin from './component/admin/Admin';
import Employee from './component/employee/Employee';

const Navigation: React.FC = () => {
  const location = useLocation();

  if (location.pathname !== '/') {
    return null;
  }

  return (
    <div className='main-container'>
        <nav className='user-select'>
          <h3 className='user-type-heading'>WHO ARE YOU?</h3>
          <ul className='link-container'>
            <li className='link-item'><Link to="/admin/">Admin</Link></li>
            <li className='link-item'><Link to="/employee/">Emplooyee</Link></li>
          </ul>
        </nav>
    </div>
    
  );
};

const Home: React.FC = () => {
  return <div></div>;
};


function App() {
  return (
    <>

      <BrowserRouter>
        <div>
          <Navigation />
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/employee/*" element={<Employee />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
