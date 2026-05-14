# Giao diện Giảng viên Chính (Main Lecturer Interface)

## Tổng quan

Giao diện dành cho **Giảng viên Chính** được thiết kế với 3 chức năng chính:
1. **Quản lý CLO** - Tạo, sửa, xóa chuẩn đầu ra
2. **Tạo Rubric** - Xây dựng mẫu đánh giá
3. **Ma trận Rubric** - Ánh xạ CLO với tiêu chí chấm điểm

## Cấu trúc trang

### 1. Dashboard (`/mainlecturer`)
- **Tương tác**: Tổng quan nhanh về các chức năng
- **Thành phần chính**:
  - Thống kê: Số lượng học phần, CLO, Rubric, Ma trận
  - Danh sách CLO gần đây với nút thêm mới
  - Mẹo sử dụng tính năng

### 2. Quản lý CLO (`/mainlecturer/clo`)
**Mục đích**: Tạo, chỉnh sửa, xóa Course Learning Outcomes (CLO)

**Chức năng**:
- Lọc CLO theo trạng thái (Duyệt, Chờ duyệt, Nháp)
- Xem, chỉnh sửa, xóa CLO
- Hiển thị mức độ Bloom's Taxonomy
- Thanh tiến độ hoàn thiện

**Modal tạo/sửa CLO**:
- Mã CLO (VD: CLO1, CLO2)
- Mô tả CLO
- Chọn mức độ Bloom (Nhớ, Hiểu, Vận dụng, Phân tích, Đánh giá, Tổng hợp)
- Nút tạo/cập nhật

### 3. Tạo Rubric (`/mainlecturer/rubric`)
**Mục đích**: Xây dựng và quản lý các mẫu rubric đánh giá

**Chức năng**:
- Xem danh sách các rubric đã tạo dưới dạng card
- Tạo rubric mới
- Xem chi tiết, sao chép, xóa rubric
- Hiển thị tiêu chí, thẻ (tags), trọng số

**Modal tạo/sửa Rubric**:
- Tên rubric
- Mô tả chi tiết
- Thêm/xóa tiêu chí (criteria) với trọng số %
- Thêm thẻ (tags) để phân loại

### 4. Ma trận Rubric (`/mainlecturer/rubric-matrix`)
**Mục đích**: Ánh xạ CLO với Rubric và tiêu chí chấm điểm cho các học phần

**Chức năng**:
- Danh sách các ma trận đã tạo
- Hiển thị số lượng: Học phần, CLO, Tiêu chí
- Trạng thái: Hoàn tất, Chờ duyệt, Nháp
- Xem preview bảng ánh xạ

**Modal tạo/sửa Ma trận**:
- Tên ma trận
- Chọn các CLO cần ánh xạ (checkbox)
- Chọn Rubric (radio button)
- Chọn các học phần áp dụng (select)
- Bảng preview ma trận

## Giao diện thiết kế

### Bảng màu
- **Chính**: Indigo (#4F46E5)
- **Phụ**: Purple, Blue, Fuchsia

### Layout
- Sidebar navigation (desktop)
- Responsive design
- Mobile: Tabs thay vì sidebar

### Thành phần UI
- Card: Rounded-2xl, shadow-sm
- Button: Rounded-lg, transitions
- Input/Select: Rounded-lg, focus states
- Status badges: Rounded-full

## API Endpoints (cần phát triển backend)

```
// CLO Management
GET    /api/mainlecturer/clo              - Danh sách CLO
POST   /api/mainlecturer/clo              - Tạo CLO mới
PUT    /api/mainlecturer/clo/:id          - Cập nhật CLO
DELETE /api/mainlecturer/clo/:id          - Xóa CLO

// Rubric Management
GET    /api/mainlecturer/rubric           - Danh sách Rubric
POST   /api/mainlecturer/rubric           - Tạo Rubric mới
PUT    /api/mainlecturer/rubric/:id       - Cập nhật Rubric
DELETE /api/mainlecturer/rubric/:id       - Xóa Rubric

// Rubric Matrix
GET    /api/mainlecturer/rubric-matrix    - Danh sách Ma trận
POST   /api/mainlecturer/rubric-matrix    - Tạo Ma trận mới
PUT    /api/mainlecturer/rubric-matrix/:id - Cập nhật Ma trận
DELETE /api/mainlecturer/rubric-matrix/:id - Xóa Ma trận
```

## File tạo được

```
src/pages/mainlecturer/
├── MainLecturerLayout.tsx           # Layout chính
├── MainLecturerHeader.tsx           # Header component
├── MainLecturerOverview.tsx         # Dashboard
├── CLOManagement.tsx                # Quản lý CLO
├── RubricBuilder.tsx                # Tạo Rubric
├── RubricMatrix.tsx                 # Ma trận Rubric
└── mainLecturerData.ts              # Dữ liệu mock & config
```

## Các bước tiếp theo

1. **Backend Development**:
   - Tạo API endpoints cho CLO, Rubric, RubricMatrix
   - Implement database models
   - Thêm permission/authorization cho Main Lecturer role

2. **Frontend Integration**:
   - Kết nối các API endpoints
   - Xử lý validation form
   - Thêm error handling

3. **Features bổ sung**:
   - Export rubric & matrix thành PDF/Excel
   - Lịch sử thay đổi (versioning)
   - Share rubric giữa các giảng viên
   - Import template từ file

## Navigating

**Đường dẫn**:
- Dashboard: `/mainlecturer`
- Quản lý CLO: `/mainlecturer/clo`
- Tạo Rubric: `/mainlecturer/rubric`
- Ma trận Rubric: `/mainlecturer/rubric-matrix`
