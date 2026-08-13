# Đề xuất tách schema theo microservice

## Hiện trạng

User Service, Course Service, Rubric Service, Grading Service và Notification Service đang dùng chung database MySQL `db_rubric`. Cách này cho phép các service phụ thuộc trực tiếp vào cùng một schema và làm giảm tính độc lập khi triển khai.

## Kiến trúc đề xuất

| Service | Kho dữ liệu sở hữu | Dữ liệu chính |
|---|---|---|
| User Service | `user_db` | Tài khoản, sinh viên, giảng viên, khoa và bộ môn |
| Course Service | `course_db` | Lớp học phần, ghi danh, bài đánh giá, bài nộp, điểm danh, nhóm và chat |
| Course Service | `course_document_db` | Bài đăng, câu hỏi, đề thi và bài thi được giao |
| Rubric Service | `rubric_db` | Rubric, tiêu chí, mức đánh giá và chuẩn đầu ra |
| Grading Service | `grading_db` | Điểm tổng hợp, kết quả từng tiêu chí và mẫu phản hồi |
| Notification Service | `notification_db` | Thông báo bền vững |
| Notification Service | Redis | Phát thông báo thời gian thực và dữ liệu tạm |

API Gateway và Eureka Server không cần database nghiệp vụ.

## Gợi ý cấu hình kết nối

Không nên tiếp tục dùng một biến `SPRING_DATASOURCE_URL` chung trong khối môi trường dùng lại cho mọi container. Mỗi service nên ghi đè URL riêng:

```yaml
user-service:
  environment:
    SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/user_db

course-service:
  environment:
    SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/course_db
    SPRING_DATA_MONGODB_URI: mongodb://mongodb:27017/course_document_db

rubric-service:
  environment:
    SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/rubric_db

grading-service:
  environment:
    SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/grading_db

notification-service:
  environment:
    SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/notification_db
```

Các database có thể chạy chung một máy chủ MySQL trong giai đoạn đầu nhưng phải dùng database, tài khoản và quyền truy cập riêng. Khi cần mở rộng, từng database có thể được chuyển sang máy chủ riêng mà không đổi quyền sở hữu dữ liệu.

## Nguyên tắc thiết kế

- Mỗi service chỉ được đọc và ghi database do chính nó sở hữu.
- Không tạo khóa ngoại giữa hai database của hai service.
- Các trường `student_id`, `course_id`, `assessment_id`, `submission_id` và `rubric_id` xuyên service chỉ là tham chiếu logic.
- Kiểm tra dữ liệu xuyên service thông qua API hoặc sự kiện.
- Không thực hiện phép nối bảng trực tiếp giữa các database.
- Tệp được lưu trong S3; database chỉ lưu URL và metadata.
- Redis không phải nguồn dữ liệu chính và không thay thế `notification_db`.

## Điểm cần xử lý khi tách

1. Hai mô hình `Post` và `Topic` hiện cùng biểu diễn bài đăng nhưng nằm ở MongoDB và MySQL. Nên chọn một nguồn dữ liệu chính; đề xuất dùng collection `course_posts` trong MongoDB và lưu bình luận theo `post_id`.
2. `CourseCLO` đang xuất hiện ở Course Service và `CourseCloEntity` xuất hiện ở Rubric Service. Nên để Rubric Service sở hữu CLO; Course Service chỉ giữ `clo_id` trong bảng liên kết bài đánh giá.
3. Điểm tổng hợp hiện có cả trong `enrollments` và `grades`. `grading_db` nên sở hữu kết quả chấm chi tiết; `enrollments` chỉ giữ bản tổng hợp đã công bố nếu màn hình lớp cần đọc nhanh.
4. Khi xóa bài đánh giá hoặc lớp học, nên phát sự kiện để Grading Service và Notification Service tự dọn dữ liệu liên quan.

## Thứ tự chuyển đổi an toàn

1. Tạo các database và tài khoản riêng.
2. Sao chép bảng hiện tại sang database của service sở hữu.
3. Cấu hình từng service đọc database mới trong môi trường thử nghiệm.
4. Thay truy vấn xuyên miền bằng Feign Client hoặc sự kiện.
5. So sánh số bản ghi và chạy kiểm thử nghiệp vụ.
6. Ngừng ghi vào schema dùng chung.
7. Chỉ xóa bảng cũ sau khi đã có bản sao lưu và xác nhận hệ thống ổn định.

## Danh sách sơ đồ

1. [SchemaTongQuanTheoService.puml](SchemaTongQuanTheoService.puml)
2. [UserServiceSchema.puml](UserServiceSchema.puml)
3. [CourseServiceSchema.puml](CourseServiceSchema.puml)
4. [CourseDocumentSchema.puml](CourseDocumentSchema.puml)
5. [RubricServiceSchema.puml](RubricServiceSchema.puml)
6. [GradingServiceSchema.puml](GradingServiceSchema.puml)
7. [NotificationServiceSchema.puml](NotificationServiceSchema.puml)
