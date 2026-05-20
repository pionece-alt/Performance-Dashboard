import { Routes, Route, Link, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BrandPage from './pages/BrandPage.jsx';
import AddPage from './pages/AddPage.jsx';
import StatsPage from './pages/StatsPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="logo">🍀 Lucky</Link>
        <nav>
          <NavLink to="/" end>Brands</NavLink>
          <NavLink to="/add">Thêm mới</NavLink>
          <NavLink to="/stats">Thống kê</NavLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/brand/:id" element={<BrandPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
      <footer className="footer">
        Lucky · Quản lý brand & khuyến mãi · Google Sheet backend
      </footer>
    </div>
  );
}
