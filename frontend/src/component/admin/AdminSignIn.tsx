import React, { useState } from 'react';

const AdminSignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const response = await fetch('http://localhost:3004/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email , password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        window.location.href = '/admin/availability';
      } else {
        console.error('Sign-in failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="parent-container">
    <div className="sign-in-container">
      <div>
        <h2 className="sign-in-heading">Admin Sign In</h2>
        <input className="sign-input" type="email" placeholder="Username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="sign-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="button" onClick={handleSignIn}>Sign In</button>
      </div>
    </div>
    </div>
   
  );
};

export default AdminSignIn;
