import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatPage from './pages/ChatPage';
import IntroPage from './pages/IntroPage';
import useAuthStore from '../store/authStore';
import HomePage from './pages/HomePage';

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
          <Route path="" element={<HomePage />} />
          <Route path="intro" element={<IntroPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
