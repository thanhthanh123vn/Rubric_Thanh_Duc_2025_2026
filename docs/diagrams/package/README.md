# Lược đồ đóng gói hệ thống

Các sơ đồ được trình bày theo thứ tự từ tổng quan đến chi tiết:

1. [PackageDiagramTongQuan.puml](PackageDiagramTongQuan.puml): frontend, hạ tầng, các microservice và kho dữ liệu.
2. [PackageDiagramFrontend.puml](PackageDiagramFrontend.puml): các package chính của frontend React.
3. [PackageDiagramApiGateway.puml](PackageDiagramApiGateway.puml): xác thực JWT và định tuyến yêu cầu.
4. [PackageDiagramEurekaServer.puml](PackageDiagramEurekaServer.puml): đăng ký và khám phá dịch vụ.
5. [PackageDiagramUserService.puml](PackageDiagramUserService.puml): người dùng, hồ sơ và xác thực.
6. [PackageDiagramCourseService.puml](PackageDiagramCourseService.puml): lớp học, bài đăng, bài đánh giá, điểm danh, bài thi, nhóm và nhiệm vụ.
7. [PackageDiagramRubricService.puml](PackageDiagramRubricService.puml): Rubric, tiêu chí, mức đánh giá và chuẩn đầu ra.
8. [PackageDiagramGradingService.puml](PackageDiagramGradingService.puml): chấm điểm và kết quả Rubric.
9. [PackageDiagramNotificationService.puml](PackageDiagramNotificationService.puml): thông báo, Redis và WebSocket.

Trong mỗi sơ đồ chi tiết, package được thể hiện bằng khung ngoài và các class thuộc package nằm bên trong. Mũi tên giữa các package biểu diễn chiều phụ thuộc chính.

Các class diagram có thuộc tính và phương thức được tách riêng tại [thư mục class](../class/README.md).

Course Service có số lượng lớp lớn nên sơ đồ chỉ giữ các class phục vụ phạm vi Sinh viên và các class nền tảng trực tiếp liên quan. Các DTO báo cáo quản trị và lớp tiện ích nhỏ được lược bỏ để hình có thể đọc được khi đưa vào luận văn.
