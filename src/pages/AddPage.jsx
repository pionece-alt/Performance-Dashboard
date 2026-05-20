import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function AddPage() {
  const [tab, setTab] = useState('brand');
  return (
    <div>
      <h1>Thêm dữ liệu</h1>
      <div className="tabs">
        <button className={tab === 'brand' ? 'active' : ''} onClick={() => setTab('brand')}>Brand</button>
        <button className={tab === 'product' ? 'active' : ''} onClick={() => setTab('product')}>Sản phẩm</button>
        <button className={tab === 'promotion' ? 'active' : ''} onClick={() => setTab('promotion')}>Khuyến mãi</button>
      </div>
      {tab === 'brand' && <BrandForm />}
      {tab === 'product' && <ProductForm />}
      {tab === 'promotion' && <PromotionForm />}
    </div>
  );
}

function useBrands() {
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    api.listBrands().then((d) => setBrands(d.items || [])).catch(() => {});
  }, []);
  return brands;
}

function BrandForm() {
  const [form, setForm] = useState({ name: '', category: '', description: '' });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.addBrand(form);
      setStatus({ type: 'success', msg: 'Đã thêm brand!' });
      setForm({ name: '', category: '', description: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h2>Brand mới</h2>
      {status && <div className={status.type}>{status.msg}</div>}
      <label>
        Tên brand *
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label>
        Danh mục
        <input
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="VD: Thời trang, F&B, Điện tử..."
        />
      </label>
      <label>
        Mô tả
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <button className="btn" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu brand'}</button>
    </form>
  );
}

function ProductForm() {
  const brands = useBrands();
  const [form, setForm] = useState({ brand_id: '', name: '', price: '', description: '' });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.addProduct({ ...form, price: Number(form.price) || 0 });
      setStatus({ type: 'success', msg: 'Đã thêm sản phẩm!' });
      setForm({ brand_id: form.brand_id, name: '', price: '', description: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h2>Sản phẩm mới</h2>
      {status && <div className={status.type}>{status.msg}</div>}
      <label>
        Brand *
        <select required value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
          <option value="">-- Chọn brand --</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
      <label>
        Tên sản phẩm *
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label>
        Giá (VND)
        <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      </label>
      <label>
        Mô tả
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <button className="btn" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}</button>
    </form>
  );
}

function PromotionForm() {
  const brands = useBrands();
  const [form, setForm] = useState({
    brand_id: '', title: '', description: '', discount_percent: '', start_date: '', end_date: '',
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.addPromotion({
        ...form,
        discount_percent: Number(form.discount_percent) || 0,
      });
      setStatus({ type: 'success', msg: 'Đã thêm khuyến mãi!' });
      setForm({ brand_id: form.brand_id, title: '', description: '', discount_percent: '', start_date: '', end_date: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h2>Khuyến mãi mới</h2>
      {status && <div className={status.type}>{status.msg}</div>}
      <label>
        Brand *
        <select required value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
          <option value="">-- Chọn brand --</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
      <label>
        Tiêu đề *
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </label>
      <label>
        Mô tả
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <label>
        % Giảm giá
        <input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
      </label>
      <label>
        Ngày bắt đầu
        <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
      </label>
      <label>
        Ngày kết thúc
        <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
      </label>
      <button className="btn" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu khuyến mãi'}</button>
    </form>
  );
}
