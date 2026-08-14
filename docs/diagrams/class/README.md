# Sơ đồ lớp tổng quan theo service

Mỗi sơ đồ thể hiện package, class chính, thuộc tính, phương thức công khai quan trọng và quan hệ phụ thuộc trong một service:

1. [ApiGatewayClassDiagram.puml](ApiGatewayClassDiagram.puml)
2. [EurekaServerClassDiagram.puml](EurekaServerClassDiagram.puml)
3. [UserServiceClassDiagram.puml](UserServiceClassDiagram.puml)
4. [CourseServiceClassDiagram.puml](CourseServiceClassDiagram.puml)
5. [RubricServiceClassDiagram.puml](RubricServiceClassDiagram.puml)
6. [GradingServiceClassDiagram.puml](GradingServiceClassDiagram.puml)
7. [NotificationServiceClassDiagram.puml](NotificationServiceClassDiagram.puml)

Các sơ đồ không liệt kê getter, setter, constructor sinh tự động, phương thức private hỗ trợ và toàn bộ DTO nhỏ. Việc lược bỏ này giúp sơ đồ thể hiện thiết kế tổng quan thay vì trở thành bản sao toàn bộ mã nguồn.

Lược đồ đóng gói không có thuộc tính và phương thức được giữ riêng tại thư mục [package](../package/README.md).
