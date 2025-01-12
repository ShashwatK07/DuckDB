import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import useAuthStore from '../store/authStore';

const App = () => {

  const checkTokenExpiration = useAuthStore(
    (state) => state.checkTokenExpiration,
  );

  useEffect(() => {
    checkTokenExpiration();
  }, [checkTokenExpiration]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<AuthPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
