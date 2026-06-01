import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('orderio-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('orderio-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar theme={theme} onToggleTheme={setTheme} />
        <div className="main-wrapper">
          <Topbar />
          <main className="main-content">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/products"   element={<Products />} />
              <Route path="/customers"  element={<Customers />} />
              <Route path="/orders"     element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
