import React from 'react';
import { Link } from 'react-router-dom';

const EmpMenu: React.FC = () => {
  return (
    <div className='menu-container'>
      <nav>
        <ul className='menu-list'>
          <li className='menu-item'><Link to="/employee/availability">Availability</Link></li>
          <li className='menu-item'><Link to="/employee/shifts">Shifts</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default EmpMenu;
