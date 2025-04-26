import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    if (token) {
      fetch(`http://localhost:8080/api/v1/user/id/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setIsLoggedIn(true);
            setUsername(data.username);
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
          setUsername('');
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};
