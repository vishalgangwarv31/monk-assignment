import React from 'react';
import { Link } from 'react-router-dom';

const AdminMenu: React.FC = () => {
  return (
    <div className='menu-container'>
      <nav>
        <ul className='menu-list'>
          <li className='menu-item'><Link to="/admin/availability">Availability</Link></li>
          <li className='menu-item'><Link to="/admin/shifts">Shifts</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminMenu;
