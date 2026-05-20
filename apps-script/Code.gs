/**
 * Lucky - Google Apps Script backend
 *
 * Cài đặt:
 * 1. Tạo Google Sheet mới, copy ID từ URL.
 * 2. Mở Extensions > Apps Script, dán toàn bộ file này.
 * 3. Cập nhật SHEET_ID bên dưới.
 * 4. Chạy hàm `setupSheets()` 1 lần để tạo header cho 3 sheet:
 *    "Brands", "Products", "Promotions".
 * 5. Deploy > New deployment > Web app > Execute as: Me, Access: Anyone.
 * 6. Copy URL web app, dán vào VITE_APPS_SCRIPT_URL trong .env của frontend.
 */

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';

const SCHEMA = {
  Brands: ['id', 'name', 'category', 'description', 'created_at'],
  Products: ['id', 'brand_id', 'name', 'price', 'description', 'created_at'],
  Promotions: ['id', 'brand_id', 'title', 'description', 'discount_percent', 'start_date', 'end_date', 'created_at'],
};

function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Object.keys(SCHEMA).forEach((name) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(SCHEMA[name]);
      sheet.getRange(1, 1, 1, SCHEMA[name].length).setFontWeight('bold');
    }
  });
}

function doGet(e) {
  return handle(e, null);
}

function doPost(e) {
  let body = null;
  try {
    body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;
  } catch (err) {
    return jsonOut({ error: 'Invalid JSON body' });
  }
  return handle(e, body);
}

function handle(e, body) {
  const action = (e.parameter && e.parameter.action) || '';
  try {
    switch (action) {
      case 'brands': return jsonOut({ items: listBrands() });
      case 'brand': return jsonOut({ item: getBrand(e.parameter.id) });
      case 'products': return jsonOut({ items: listProducts(e.parameter.brand_id) });
      case 'promotions': return jsonOut({ items: listPromotions(e.parameter.brand_id) });
      case 'search': return jsonOut({ items: search(e.parameter.q) });
      case 'stats': return jsonOut(computeStats());
      case 'addBrand': return jsonOut({ item: addBrand(body) });
      case 'addProduct': return jsonOut({ item: addProduct(body) });
      case 'addPromotion': return jsonOut({ item: addPromotion(body) });
      default: return jsonOut({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonOut({ error: String(err && err.message || err) });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Chưa có sheet ' + name + '. Hãy chạy setupSheets().');
  return sheet;
}

function readAll(name) {
  const sheet = getSheet(name);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  }).filter((r) => r.id);
}

function appendRow(name, obj) {
  const sheet = getSheet(name);
  const headers = SCHEMA[name];
  if (!obj.id) obj.id = Utilities.getUuid();
  if (!obj.created_at) obj.created_at = new Date().toISOString();
  const row = headers.map((h) => (obj[h] !== undefined ? obj[h] : ''));
  sheet.appendRow(row);
  return obj;
}

function listBrands() {
  const brands = readAll('Brands');
  const promos = readAll('Promotions');
  const promoCount = {};
  promos.forEach((p) => {
    if (!p.brand_id) return;
    promoCount[p.brand_id] = (promoCount[p.brand_id] || 0) + 1;
  });
  return brands.map((b) => ({ ...b, promotion_count: promoCount[b.id] || 0 }));
}

function getBrand(id) {
  if (!id) throw new Error('Thiếu id');
  const list = readAll('Brands');
  return list.find((b) => b.id === id) || null;
}

function listProducts(brandId) {
  const all = readAll('Products');
  if (!brandId) return all;
  return all.filter((p) => p.brand_id === brandId);
}

function listPromotions(brandId) {
  const all = readAll('Promotions');
  if (!brandId) return all;
  return all.filter((p) => p.brand_id === brandId);
}

function search(q) {
  if (!q) return [];
  const needle = String(q).toLowerCase();
  const matches = [];
  readAll('Brands').forEach((b) => {
    const hay = [b.name, b.category, b.description].join(' ').toLowerCase();
    if (hay.indexOf(needle) >= 0) matches.push({ type: 'brand', item: b });
  });
  readAll('Products').forEach((p) => {
    const hay = [p.name, p.description].join(' ').toLowerCase();
    if (hay.indexOf(needle) >= 0) matches.push({ type: 'product', item: p });
  });
  readAll('Promotions').forEach((p) => {
    const hay = [p.title, p.description].join(' ').toLowerCase();
    if (hay.indexOf(needle) >= 0) matches.push({ type: 'promotion', item: p });
  });
  return matches;
}

function addBrand(body) {
  if (!body || !body.name) throw new Error('Thiếu name');
  return appendRow('Brands', {
    name: body.name,
    category: body.category || '',
    description: body.description || '',
  });
}

function addProduct(body) {
  if (!body || !body.name) throw new Error('Thiếu name');
  if (!body.brand_id) throw new Error('Thiếu brand_id');
  return appendRow('Products', {
    brand_id: body.brand_id,
    name: body.name,
    price: Number(body.price) || 0,
    description: body.description || '',
  });
}

function addPromotion(body) {
  if (!body || !body.title) throw new Error('Thiếu title');
  if (!body.brand_id) throw new Error('Thiếu brand_id');
  return appendRow('Promotions', {
    brand_id: body.brand_id,
    title: body.title,
    description: body.description || '',
    discount_percent: Number(body.discount_percent) || 0,
    start_date: body.start_date || '',
    end_date: body.end_date || '',
  });
}

function computeStats() {
  const brands = readAll('Brands');
  const products = readAll('Products');
  const promos = readAll('Promotions');

  const today = new Date();
  let active = 0;
  let discountSum = 0;
  let discountN = 0;
  promos.forEach((p) => {
    const start = p.start_date ? new Date(p.start_date) : null;
    const end = p.end_date ? new Date(p.end_date) : null;
    const inRange = (!start || start <= today) && (!end || end >= today);
    if (inRange) active++;
    if (Number(p.discount_percent) > 0) {
      discountSum += Number(p.discount_percent);
      discountN++;
    }
  });

  const countByBrand = {};
  promos.forEach((p) => {
    if (!p.brand_id) return;
    countByBrand[p.brand_id] = (countByBrand[p.brand_id] || 0) + 1;
  });
  const topBrands = brands
    .map((b) => ({ id: b.id, name: b.name, promotion_count: countByBrand[b.id] || 0 }))
    .filter((b) => b.promotion_count > 0)
    .sort((a, b) => b.promotion_count - a.promotion_count)
    .slice(0, 5);

  const brandCategory = {};
  brands.forEach((b) => { brandCategory[b.id] = b.category || ''; });
  const byCat = {};
  promos.forEach((p) => {
    const cat = brandCategory[p.brand_id] || '';
    byCat[cat] = (byCat[cat] || 0) + 1;
  });
  const byCategory = Object.keys(byCat).map((k) => ({ category: k, count: byCat[k] }))
    .sort((a, b) => b.count - a.count);

  return {
    total_brands: brands.length,
    total_products: products.length,
    total_promotions: promos.length,
    active_promotions: active,
    avg_discount: discountN > 0 ? discountSum / discountN : 0,
    top_brands: topBrands,
    by_category: byCategory,
  };
}
