import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function BrandPage() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [tab, setTab] = useState('promotions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getBrand(id), api.listProducts(id), api.listPromotions(id)])
      .then(([brandRes, prodRes, promoRes]) => {
        if (!active) return;
        setBrand(brandRes.item || null);
        setProducts(prodRes.items || []);
        setPromotions(promoRes.items || []);
      })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!brand) return <div className="empty">Không tìm thấy brand. <Link to="/">Về danh sách</Link></div>;

  return (
    <div>
      <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Tất cả brand</Link>
      <h1>{brand.name}</h1>
      {brand.category && <span className="category">{brand.category}</span>}
      <p style={{ color: 'var(--muted)' }}>{brand.description}</p>

      <div className="tabs">
        <button
          className={tab === 'promotions' ? 'active' : ''}
          onClick={() => setTab('promotions')}
        >
          Khuyến mãi ({promotions.length})
        </button>
        <button
          className={tab === 'products' ? 'active' : ''}
          onClick={() => setTab('products')}
        >
          Sản phẩm ({products.length})
        </button>
      </div>

      {tab === 'promotions' && (
        <div>
          {promotions.length === 0 && <div className="empty">Brand này chưa có khuyến mãi.</div>}
          {promotions.map((p) => (
            <div key={p.id} className="promo-item">
              <div>
                <span className="title">{p.title}</span>
                {p.discount_percent > 0 && (
                  <span className="discount">-{p.discount_percent}%</span>
                )}
              </div>
              {p.description && <div style={{ marginTop: 4 }}>{p.description}</div>}
              <div className="meta">
                {p.start_date && <>Bắt đầu: {formatDate(p.start_date)} </>}
                {p.end_date && <>· Kết thúc: {formatDate(p.end_date)}</>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div>
          {products.length === 0 && <div className="empty">Brand này chưa có sản phẩm.</div>}
          {products.map((p) => (
            <div key={p.id} className="product-item">
              <strong>{p.name}</strong>
              {p.price > 0 && <span style={{ marginLeft: 8 }}>{formatPrice(p.price)}</span>}
              {p.description && <div className="meta">{p.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('vi-VN');
}

function formatPrice(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}
