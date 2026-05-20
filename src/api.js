const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';

async function request(action, params = {}, method = 'GET', body = null) {
  if (!BASE_URL) {
    throw new Error('VITE_APPS_SCRIPT_URL chưa được cấu hình. Xem README.md');
  }
  const url = new URL(BASE_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const opts = { method };
  if (method === 'POST' && body) {
    opts.body = JSON.stringify(body);
    opts.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
  }

  const res = await fetch(url.toString(), opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export const api = {
  listBrands: () => request('brands'),
  getBrand: (id) => request('brand', { id }),
  listProducts: (brandId) => request('products', { brand_id: brandId }),
  listPromotions: (brandId) => request('promotions', { brand_id: brandId }),
  search: (q) => request('search', { q }),
  stats: () => request('stats'),
  addBrand: (data) => request('addBrand', {}, 'POST', data),
  addProduct: (data) => request('addProduct', {}, 'POST', data),
  addPromotion: (data) => request('addPromotion', {}, 'POST', data),
};
