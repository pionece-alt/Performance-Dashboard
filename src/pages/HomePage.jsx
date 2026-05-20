import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function HomePage() {
  const [brands, setBrands] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.listBrands()
      .then((data) => { if (active) setBrands(data.items || []); })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = brands.filter((b) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (b.name || '').toLowerCase().includes(q) ||
      (b.category || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="search-bar">
        <input
          type="search"
          placeholder="Tìm brand theo tên, danh mục, mô tả..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Đang tải...</div>}
      {!loading && filtered.length === 0 && (
        <div className="empty">
          Chưa có brand nào. <Link to="/add">Thêm brand đầu tiên →</Link>
        </div>
      )}

      <div className="grid">
        {filtered.map((b) => (
          <Link key={b.id} to={`/brand/${b.id}`} className="card brand-card">
            <h3>
              {b.name}
              {b.promotion_count > 0 && (
                <span className="promo-badge">{b.promotion_count} KM</span>
              )}
            </h3>
            {b.category && <span className="category">{b.category}</span>}
            <p className="desc">{b.description || 'Chưa có mô tả'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
