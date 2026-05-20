import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.stats()
      .then((d) => setStats(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <h1>Thống kê</h1>
      <div className="stats-grid">
        <StatBox value={stats.total_brands} label="Tổng số brand" />
        <StatBox value={stats.total_products} label="Tổng sản phẩm" />
        <StatBox value={stats.total_promotions} label="Tổng khuyến mãi" />
        <StatBox value={stats.active_promotions} label="KM đang chạy" />
        <StatBox
          value={stats.avg_discount ? `${stats.avg_discount.toFixed(1)}%` : '0%'}
          label="Giảm giá TB"
        />
      </div>

      <div className="section">
        <h2>Top brand có nhiều khuyến mãi</h2>
        {(!stats.top_brands || stats.top_brands.length === 0) && (
          <div className="empty">Chưa có dữ liệu</div>
        )}
        {stats.top_brands && stats.top_brands.map((b) => (
          <div key={b.id} className="promo-item">
            <strong>{b.name}</strong>
            <span className="promo-badge">{b.promotion_count} KM</span>
          </div>
        ))}
      </div>

      <div className="section">
        <h2>Khuyến mãi theo danh mục</h2>
        {(!stats.by_category || stats.by_category.length === 0) && (
          <div className="empty">Chưa có dữ liệu</div>
        )}
        {stats.by_category && stats.by_category.map((c) => (
          <div key={c.category} className="promo-item">
            <strong>{c.category || '(Chưa phân loại)'}</strong>
            <span style={{ marginLeft: 8, color: 'var(--muted)' }}>{c.count} khuyến mãi</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="stat-box">
      <div className="value">{value ?? 0}</div>
      <div className="label">{label}</div>
    </div>
  );
}
