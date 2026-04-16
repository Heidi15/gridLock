import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const Layout = () => (
  <div className="flex min-h-screen bg-neutral-50">
    <Sidebar />
    <main className="flex-1 md:ml-60 p-6 md:p-8 max-w-7xl">
      <Outlet />
    </main>
  </div>
);

export default Layout;
