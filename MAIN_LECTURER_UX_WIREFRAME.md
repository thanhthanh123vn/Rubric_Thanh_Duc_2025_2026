# UX Flow & Wireframe - Giảng viên Chính

## 1. User Flow Diagram

```
Login
  ↓
[Xác định vai trò] 
  ├─→ Main Lecturer
  ├─→ Teacher
  └─→ Admin
  
Main Lecturer Dashboard
  ├─→ Quản lý CLO
  │    ├─→ Xem danh sách
  │    ├─→ Tạo CLO
  │    ├─→ Chỉnh sửa CLO
  │    └─→ Xóa CLO
  │
  ├─→ Tạo Rubric
  │    ├─→ Xem danh sách
  │    ├─→ Tạo Rubric mới
  │    ├─→ Xem chi tiết
  │    ├─→ Sao chép Rubric
  │    └─→ Xóa Rubric
  │
  └─→ Ma trận Rubric
       ├─→ Xem danh sách
       ├─→ Tạo Ma trận
       ├─→ Xem ánh xạ
       └─→ Xóa Ma trận
```

## 2. Wireframe Chi tiết

### A. Dashboard Main Lecturer

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Main Lecturer | [Search] [Notification] [Profile]   │
├─────────┬─────────────────────────────────────────────────┤
│ SIDEBAR │ Dashboard                                       │
│         │ ┌─────────────────────────────────────────────┐│
│ • Tổng  │ │ HEADER                                    ││
│   quan  │ │ Quản lý chuẩn chất lượng đào tạo          ││
│ • CLO   │ ├─────────────────────────────────────────────┤│
│ • Rubric│ │ STATS (4 cards)                           ││
│ • Matrix│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐              ││
│         │ │ │ 6  │ │ 48 │ │ 32 │ │ 12 │              ││
│         │ │ │Học │ │CLO │ │Rubr│ │Matr│              ││
│         │ │ └────┘ └────┘ └────┘ └────┘              ││
│         │ ├─────────────────────────────────────────────┤│
│         │ │ CONTENT (2 columns)                       ││
│         │ │ ┌────────────────┐ ┌────────────────┐     ││
│         │ │ │ CLO Gần đây    │ │ Tính năng nổi  │     ││
│         │ │ │ ┌──────────┐   │ │ bật            │     ││
│         │ │ │ │ CLO1...  │   │ │ • Quản lý CLO  │     ││
│         │ │ │ │ CLO2...  │   │ │ • Rubric STD   │     ││
│         │ │ │ │ [Xem tất] │   │ │ • Kiểm soát    │     ││
│         │ │ │ └──────────┘   │ │   chất lượng    │     ││
│         │ │ └────────────────┘ └────────────────┘     ││
│         │ └─────────────────────────────────────────────┘│
└─────────┴─────────────────────────────────────────────────┘
```

### B. Quản lý CLO

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Quản lý CLO | [+ Tạo CLO mới]                      │
├─────────────────────────────────────────────────────────────┤
│ FILTERS: [Tất cả] [Duyệt] [Chờ duyệt] [Nháp]              │
├─────────────────────────────────────────────────────────────┤
│ CLO LIST                                                    │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ [1] Hiểu nguyên lý hệ thống                             ││
│ │     [Hiểu] [Duyệt]                                      ││
│ │     Progress: ████████████░░░░░░░░░░░░░░░░░ 100%       ││
│ │     [Xem] [Sửa] [Xóa]                                   ││
│ └──────────────────────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────────────────────┐│
│ │ [2] Thiết kế dữ liệu rubric                             ││
│ │     [Vận dụng] [Chờ duyệt]                              ││
│ │     Progress: ███████████░░░░░░░░░░░░░░░░░░░░ 75%       ││
│ │     [Xem] [Sửa] [Xóa]                                   ││
│ └──────────────────────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────────────────────┐│
│ │ [3] Ánh xạ bài làm theo tiêu chí                        ││
│ │     [Phân tích] [Nháp]                                  ││
│ │     Progress: ██████░░░░░░░░░░░░░░░░░░░░░░░░░░ 50%      ││
│ │     [Xem] [Sửa] [Xóa]                                   ││
│ └──────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ BLOOM'S TAXONOMY REFERENCE                                  │
│ [Nhớ] [Hiểu] [Vận dụng] [Phân tích] [Đánh giá] [Tổng hợp] │
└─────────────────────────────────────────────────────────────┘
```

### C. Tạo Rubric

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Tạo Rubric | [+ Rubric mới]                        │
├─────────────────────────────────────────────────────────────┤
│ RUBRIC CARDS GRID (3 columns on desktop)                    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Báo cáo kỹ   │ │ Dự án phần   │ │ Thuyết trình │         │
│ │ thuật        │ │ mềm          │ │ học phần     │         │
│ │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │         │
│ │ │ Mô tả... │ │ │ │ Mô tả... │ │ │ │ Mô tả... │ │         │
│ │ │          │ │ │ │          │ │ │ │          │ │         │
│ │ │ Tags:    │ │ │ │ Tags:    │ │ │ │ Tags:    │ │         │
│ │ │ [Essay]  │ │ │ │[Teamwork]│ │ │ │[Content] │ │         │
│ │ │[Citation]│ │ │ │[Source]  │ │ │ │[Delivery]│ │         │
│ │ │          │ │ │ │          │ │ │ │          │ │         │
│ │ │[Chi tiết]│ │ │ │[Chi tiết]│ │ │ │[Chi tiết]│ │         │
│ │ │[Sao chép]│ │ │ │[Sao chép]│ │ │ │[Sao chép]│ │         │
│ │ │[Xóa]    │ │ │ │[Xóa]    │ │ │ │[Xóa]    │ │         │
│ │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### D. Ma trận Rubric

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Ma trận Rubric | [+ Ma trận mới]                    │
├─────────────────────────────────────────────────────────────┤
│ INFO BOX: Mô tả ma trận rubric                              │
├─────────────────────────────────────────────────────────────┤
│ MATRIX LIST                                                 │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Ma trận OBE - Lập trình       │ Hoàn tất               ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ Học phần: 4  │ CLO: 6  │ Tiêu chí: 8                  ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ CLO | Mức độ | Tiêu chí | Trọng số                    ││
│ │ CLO1│ Vận dụng│ Tiêu chí 1│ 30%                       ││
│ │ CLO2│ Phân tích│ Tiêu chí 2│ 35%                      ││
│ │ CLO3│ Vận dụng│ Tiêu chí 3│ 35%                       ││
│ │ [Xem] [Sửa] [Xóa]                                      ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 3. Modal Dialogs

### A. Modal: Tạo CLO

```
┌──────────────────────────────────┐
│ Tạo CLO mới                  [×] │
├──────────────────────────────────┤
│ Mã CLO                           │
│ [_________________]              │
│                                  │
│ Mô tả CLO                        │
│ [_________________________________│
│  _________________________________│
│  _________________________________]│
│                                  │
│ Mức độ Bloom                     │
│ [Chọn ▼]                        │
│                                  │
│ [Hủy] [Tạo]                     │
└──────────────────────────────────┘
```

### B. Modal: Tạo Rubric

```
┌──────────────────────────────────┐
│ Tạo Rubric mới               [×] │
├──────────────────────────────────┤
│ Tên Rubric                       │
│ [_________________]              │
│                                  │
│ Mô tả                            │
│ [_________________________________│
│  _________________________________]│
│                                  │
│ Tiêu chí đánh giá                │
│ ┌──────────────────────────────┐ │
│ │ [Tiêu chí 1] [%] [×]         │ │
│ │ [Tiêu chí 2] [%] [×]         │ │
│ │ [Tiêu chí 3] [%] [×]         │ │
│ └──────────────────────────────┘ │
│ [+ Thêm tiêu chí]                │
│                                  │
│ Thẻ (Tags)                       │
│ [_________________]              │
│                                  │
│ [Hủy] [Tạo]                     │
└──────────────────────────────────┘
```

### C. Modal: Tạo Ma trận Rubric

```
┌──────────────────────────────────┐
│ Tạo Ma trận mới              [×] │
├──────────────────────────────────┤
│ Tên Ma trận                      │
│ [_________________]              │
│                                  │
│ Chọn CLO cần ánh xạ              │
│ ☐ CLO1 - Mô tả                  │
│ ☐ CLO2 - Mô tả                  │
│ ☑ CLO3 - Mô tả                  │
│                                  │
│ Chọn Rubric                      │
│ ○ Báo cáo kỹ thuật               │
│ ○ Dự án phần mềm                 │
│ ○ Thuyết trình học phần          │
│                                  │
│ Chọn học phần áp dụng            │
│ [Lập trình K65 ▼]               │
│                                  │
│ [Hủy] [Tạo]                     │
└──────────────────────────────────┘
```

## 4. Responsive Design

### Desktop (1280px+)
- Sidebar navigation 80px fixed width
- Main content full width
- 3-4 columns grid

### Tablet (768px - 1279px)
- Tabs navigation top
- 2-3 columns grid
- Sidebar hidden

### Mobile (< 768px)
- Bottom tab navigation
- 1 column grid
- Stacked modals

## 5. Color & Typography

### Color Palette
- **Primary**: Indigo-600 (#4F46E5)
- **Secondary**: Purple-600 (#9333EA)
- **Success**: Green-600 (#16A34A)
- **Warning**: Amber-600 (#D97706)
- **Error**: Red-600 (#DC2626)
- **Background**: Slate-50 (#F8FAFC)

### Typography
- **Heading**: Bold, 24px-32px
- **Subheading**: Semi-bold, 16px-20px
- **Body**: Regular, 14px-16px
- **Caption**: Regular, 12px-13px

## 6. Interactions

### Hover States
- Cards: +shadow, -border opacity
- Buttons: +5% brightness
- Links: +underline

### Loading States
- Skeleton screens for lists
- Spinner in modals
- Disabled state for buttons

### Empty States
- Illustration + message
- Call-to-action button
- Example text
