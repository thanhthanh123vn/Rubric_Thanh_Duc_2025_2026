# Hướng dẫn Phát triển - Main Lecturer Interface

## Quick Start

### 1. Cấu trúc tệp đã tạo

```
front-end/src/pages/mainlecturer/
├── MainLecturerLayout.tsx          # Layout chính (sidebar + routing)
├── MainLecturerHeader.tsx          # Header (search, notification)
├── MainLecturerOverview.tsx        # Dashboard (trang chủ)
├── CLOManagement.tsx               # Quản lý CLO
├── RubricBuilder.tsx               # Tạo Rubric
├── RubricMatrix.tsx                # Ma trận Rubric
└── mainLecturerData.ts             # Constants, mock data, colors
```

### 2. Routes đã được cấu hình

```
/mainlecturer                   → MainLecturerOverview
/mainlecturer/clo               → CLOManagement
/mainlecturer/rubric            → RubricBuilder
/mainlecturer/rubric-matrix     → RubricMatrix
```

### 3. Cách sử dụng

Truy cập tại: `http://localhost:3000/mainlecturer`

## Phát triển tiếp theo

### Step 1: Kết nối Backend API

Cập nhật các component để gọi API:

```typescript
// CLOManagement.tsx - Example
import { useEffect, useState } from 'react';

export default function CLOManagement() {
  const [clos, setClos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API
    fetch('/api/mainlecturer/clo')
      .then(res => res.json())
      .then(data => {
        setClos(data);
        setLoading(false);
      });
  }, []);

  // ... phần còn lại
}
```

### Step 2: Thêm Backend Endpoints

Tạo các controller và service cho Main Lecturer:

```
user-service/
├── MainLecturerController.java
├── MainLecturerService.java
├── CLOController.java
├── CLOService.java
├── RubricController.java
├── RubricService.java
├── RubricMatrixController.java
└── RubricMatrixService.java
```

### Step 3: Database Design

```sql
-- CLO Table
CREATE TABLE clo (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  bloom_level VARCHAR(50), -- Remember, Understand, Apply, Analyze, Evaluate, Create
  status VARCHAR(50), -- Draft, Pending, Approved
  main_lecturer_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rubric Table
CREATE TABLE rubric (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[], -- JSON array or varchar array
  created_by UUID NOT NULL, -- main lecturer
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rubric Criteria Table
CREATE TABLE rubric_criteria (
  id UUID PRIMARY KEY,
  rubric_id UUID NOT NULL REFERENCES rubric(id) ON DELETE CASCADE,
  criteria_name VARCHAR(255) NOT NULL,
  weight DECIMAL(5, 2), -- percentage
  order_index INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rubric Matrix Table
CREATE TABLE rubric_matrix (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL, -- main lecturer
  status VARCHAR(50), -- Draft, Pending, Approved
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rubric Matrix Mapping (CLO → Criteria)
CREATE TABLE rubric_matrix_mapping (
  id UUID PRIMARY KEY,
  matrix_id UUID NOT NULL REFERENCES rubric_matrix(id) ON DELETE CASCADE,
  clo_id UUID NOT NULL REFERENCES clo(id),
  criteria_id UUID NOT NULL REFERENCES rubric_criteria(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Course-Matrix Assignment
CREATE TABLE course_rubric_matrix (
  id UUID PRIMARY KEY,
  course_id UUID NOT NULL,
  matrix_id UUID NOT NULL REFERENCES rubric_matrix(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 4: API Endpoints

```
# CLO Management
GET    /api/mainlecturer/clo
POST   /api/mainlecturer/clo
GET    /api/mainlecturer/clo/:id
PUT    /api/mainlecturer/clo/:id
DELETE /api/mainlecturer/clo/:id
GET    /api/mainlecturer/clo/filter?status=approved&bloom=apply

# Rubric Management
GET    /api/mainlecturer/rubric
POST   /api/mainlecturer/rubric
GET    /api/mainlecturer/rubric/:id
PUT    /api/mainlecturer/rubric/:id
DELETE /api/mainlecturer/rubric/:id

# Rubric Matrix
GET    /api/mainlecturer/rubric-matrix
POST   /api/mainlecturer/rubric-matrix
GET    /api/mainlecturer/rubric-matrix/:id
PUT    /api/mainlecturer/rubric-matrix/:id
DELETE /api/mainlecturer/rubric-matrix/:id

# Matrix Mapping
POST   /api/mainlecturer/rubric-matrix/:id/mapping
DELETE /api/mainlecturer/rubric-matrix/:id/mapping/:mappingId
```

### Step 5: Form Validation

```typescript
// Validation schema (nếu sử dụng Zod/Yup)
import { z } from 'zod';

export const CLOSchema = z.object({
  code: z.string().min(1).regex(/^CLO\d+$/),
  title: z.string().min(5).max(255),
  description: z.string().min(10),
  bloomLevel: z.enum(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']),
});

export const RubricSchema = z.object({
  name: z.string().min(5).max(255),
  description: z.string().min(10),
  tags: z.array(z.string()),
  criteria: z.array(z.object({
    name: z.string().min(3),
    weight: z.number().min(0).max(100),
  })),
});
```

## Integration Points

### 1. Authentication
```typescript
// Check if user is Main Lecturer
const userRole = localStorage.getItem('userRole');
if (userRole !== 'MAIN_LECTURER') {
  redirect('/dashboard');
}
```

### 2. State Management
```typescript
// Sử dụng Redux hoặc Context API
import { useAppDispatch, useAppSelector } from '@/hooks';

const dispatch = useAppDispatch();
const clos = useAppSelector(state => state.mainlecturer.clos);
```

### 3. Error Handling
```typescript
try {
  const response = await fetch('/api/mainlecturer/clo', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create CLO');
  }
  
  const data = await response.json();
  setClos([...clos, data]);
} catch (error) {
  setError(error.message);
  toast.error('Lỗi khi tạo CLO');
}
```

## Testing

### Unit Tests
```typescript
describe('CLOManagement', () => {
  it('should display list of CLOs', () => {
    // mock data
    // render component
    // assert
  });

  it('should create new CLO', async () => {
    // fill form
    // submit
    // assert API call
  });
});
```

### E2E Tests
```typescript
describe('Main Lecturer Flow', () => {
  it('should create CLO, Rubric, and Matrix', () => {
    cy.visit('/mainlecturer');
    cy.get('[data-testid=create-clo]').click();
    // fill form
    cy.get('[data-testid=submit]').click();
    // verify
  });
});
```

## Performance Considerations

1. **Pagination**: Thêm pagination cho danh sách dài
2. **Lazy Loading**: Load dữ liệu khi cần
3. **Caching**: Cache CLO, Rubric để tránh requests lặp lại
4. **Debouncing**: Debounce search input

## Accessibility

- ✅ Add ARIA labels
- ✅ Keyboard navigation
- ✅ Color contrast
- ✅ Form validation messages

## Security

- ✅ CSRF protection
- ✅ Input validation
- ✅ XSS prevention
- ✅ Role-based access control

## Deployment

1. Build: `npm run build`
2. Test: `npm run test`
3. Deploy: Push to production branch

## Troubleshooting

### Issue: "Cannot find module"
- Run `npm install`
- Check import paths

### Issue: "404 Not Found"
- Check API endpoints
- Verify backend service is running

### Issue: "Unauthorized"
- Check JWT token
- Verify user role

## Support

Liên hệ team backend nếu cần API support.
