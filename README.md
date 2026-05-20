# Lucky 🍀

Web app quản lý **brand** và **khuyến mãi**, dùng Google Sheet làm database, Google Apps Script làm backend, React + Vite làm frontend.

## Tính năng

- Thêm nhiều brand (tên, danh mục, mô tả)
- Thêm sản phẩm cho từng brand (tên, giá, mô tả)
- Thêm khuyến mãi (tiêu đề, mô tả, % giảm, ngày bắt đầu/kết thúc)
- Tìm kiếm brand theo tên/danh mục/mô tả
- Trang thống kê: tổng số, KM đang chạy, top brand, KM theo danh mục

## Cấu trúc

```
.
├── apps-script/Code.gs     # Backend: Google Apps Script
├── src/                    # Frontend: React + Vite
│   ├── pages/
│   ├── api.js
│   └── ...
├── index.html
├── vite.config.js
└── package.json
```

## Cài đặt backend (Google Sheet + Apps Script)

1. Tạo Google Sheet mới. Copy **Spreadsheet ID** từ URL (đoạn giữa `/d/` và `/edit`).
2. Trong Sheet, chọn **Extensions → Apps Script**.
3. Xóa code mặc định, dán toàn bộ nội dung `apps-script/Code.gs` vào.
4. Sửa dòng `const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';` thành ID của bạn.
5. Lưu, chạy hàm `setupSheets` 1 lần (cấp quyền nếu được hỏi). Sheet sẽ có 3 tab: `Brands`, `Products`, `Promotions`.
6. Bấm **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy URL web app (dạng `https://script.google.com/macros/s/.../exec`).

## Cài đặt frontend

```bash
npm install
cp .env.example .env
# Sửa .env, dán URL web app từ bước trên
npm run dev
```

Mở http://localhost:5173.

## Build production

```bash
npm run build
npm run preview
```

## Lưu ý

- Apps Script không hỗ trợ CORS preflight cho `application/json`, nên frontend gửi POST với `Content-Type: text/plain` (Apps Script vẫn nhận `e.postData.contents` JSON).
- Mỗi record có `id` UUID do Apps Script sinh.
- `setupSheets` chỉ cần chạy 1 lần. Chạy lại không phá dữ liệu.
