import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';

const App = () => {
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
