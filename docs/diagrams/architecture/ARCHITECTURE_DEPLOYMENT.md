# KIẾN TRÚC TRIỂN KHAI LMS RUBRIC

> Bản này mô tả cấu hình hiện tại dùng chung `db_rubric`. Kiến trúc mục tiêu
> tách năm database nằm tại
> [`ARCHITECTURE_5_DATABASES.md`](./ARCHITECTURE_5_DATABASES.md).

Tài liệu này vẽ lại `architecture_ver1.pdf` theo cấu hình đang có trong
`compose.yaml`, các `Dockerfile`, `front-end/nginx.conf` và mã nguồn các
Feign client. Sơ đồ dùng Mermaid, không chèn ảnh, có thể chỉnh sửa trực tiếp.

## 1. Kiến trúc triển khai trên Ubuntu

```mermaid
flowchart TB
    U["Người dùng<br/>Web browser"]

    subgraph UBUNTU["Ubuntu Server - 192.168.181.134"]
        direction TB
        HOSTPORT["Host port được publish<br/>0.0.0.0:80 → front-end:80"]

        subgraph DOCKER["Docker Compose"]
            direction TB

            subgraph NET["Bridge network: lms-network"]
                direction TB

                FE["front-end container<br/>Nginx 1.27 + React static files<br/>container port 80"]
                GW["api-gateway container<br/>Spring Cloud Gateway<br/>internal port 8080"]
                EU["eureka-server container<br/>Service registry<br/>internal port 8761"]

                subgraph SERVICES["Java 21 microservice containers"]
                    direction LR
                    US["user-service<br/>8081<br/>JWT, OAuth2, user/profile"]
                    CS["course-service<br/>8082<br/>course, assessment, chat"]
                    RS["rubric-service<br/>8083<br/>rubric, criteria, CLO"]
                    NS["notification-service<br/>8084<br/>notification, email, STOMP"]
                    GS["grading-service<br/>8085<br/>grade, rubric result"]
                end

                subgraph DATA["Data containers - không publish ra host"]
                    direction LR
                    SQL["mysql service<br/>MariaDB 10.4 :3306<br/>database: db_rubric"]
                    MONGO["mongodb service<br/>MongoDB 7 :27017<br/>database: db_rubric"]
                    REDIS["redis service<br/>Redis 7 :6379<br/>AOF + Pub/Sub"]
                end
            end

            VSQL[("mysql-data<br/>/var/lib/mysql")]
            VMONGO[("mongo-data<br/>/data/db")]
            VREDIS[("redis-data<br/>/data")]
        end
    end

    GOOGLE["Google OAuth2"]
    SMTP["Gmail SMTP :587"]
    CLOUDINARY["Cloudinary"]
    S3["AWS S3<br/>bucket lms-upload-ducvan"]

    U -->|"HTTP http://192.168.181.134<br/>hoặc HTTPS khi có TLS reverse proxy"| HOSTPORT
    HOSTPORT --> FE
    FE -->|"/api/** HTTP proxy"| GW
    FE -->|"/oauth2/** và /login/oauth2/**"| US
    FE -->|"/ws - SockJS/STOMP"| CS
    FE -->|"/ws-notifications - SockJS/STOMP"| NS

    GW -->|"lb://USER-SERVICE"| US
    GW -->|"lb://COURSE-SERVICE"| CS
    GW -->|"lb://RUBRIC-SERVICE"| RS
    GW -->|"lb://NOTIFICATION-SERVICE"| NS
    GW -->|"lb://GRADING-SERVICE"| GS

    GW -.->|"fetch registry"| EU
    US -.->|"register/fetch"| EU
    CS -.->|"register/fetch"| EU
    RS -.->|"register/fetch"| EU
    NS -.->|"register/fetch"| EU
    GS -.->|"register/fetch"| EU

    US -->|"JDBC"| SQL
    CS -->|"JDBC"| SQL
    RS -->|"JDBC"| SQL
    NS -->|"JDBC"| SQL
    GS -->|"JDBC"| SQL
    CS -->|"Spring Data MongoDB"| MONGO
    NS -->|"Redis Pub/Sub<br/>notification-channel"| REDIS

    SQL --- VSQL
    MONGO --- VMONGO
    REDIS --- VREDIS

    US -->|"OAuth2"| GOOGLE
    US -->|"OTP/email"| SMTP
    NS -->|"notification email"| SMTP
    US -->|"avatar upload"| CLOUDINARY
    CS -->|"file upload"| S3
```

## 2. Giao tiếp giữa các service

```mermaid
flowchart LR
    FE["React trong Nginx"]
    NG["Nginx reverse proxy"]
    GW["API Gateway :8080"]
    EU["Eureka :8761"]
    US["User :8081"]
    CS["Course :8082"]
    RS["Rubric :8083"]
    NS["Notification :8084"]
    GS["Grading :8085"]
    RD["Redis :6379"]

    FE -->|"Axios + Bearer JWT<br/>base /api/v1"| NG
    NG -->|"/api/**"| GW
    NG -->|"OAuth2 endpoints"| US
    NG -->|"/ws"| CS
    NG -->|"/ws-notifications"| NS

    GW -->|"validate JWT;<br/>add X-User-Id, X-User-Role,<br/>X-User-Username, X-User-IP"| US
    GW -->|"REST, Eureka load balancing"| CS
    GW -->|"REST, Eureka load balancing"| RS
    GW -->|"REST, Eureka load balancing"| NS
    GW -->|"REST, Eureka load balancing"| GS
    GW -.->|"resolve lb:// service name"| EU

    US -->|"OpenFeign: write system log<br/>fixed Docker URL course-service:8082"| CS
    CS -->|"OpenFeign: user/profile lookup<br/>fixed Docker URL user-service:8081"| US
    CS -->|"OpenFeign: grade lookup/count<br/>Eureka service name"| GS
    CS -->|"OpenFeign: create/delete notification<br/>Eureka service name"| NS
    RS -->|"OpenFeign: user/lecturer lookup<br/>fixed Docker URL user-service:8081"| US
    RS -->|"OpenFeign: course/CLO + system log<br/>fixed Docker URL course-service:8082"| CS
    RS -->|"OpenFeign: notification<br/>Eureka service name"| NS
    NS -->|"OpenFeign: owner/user lookup<br/>fixed Docker URL user-service:8081"| US
    GS -->|"OpenFeign: notification<br/>Eureka service name"| NS
    GS -.->|"CẤU HÌNH HIỆN TẠI BỊ SAI:<br/>CourseClient gọi localhost:8082"| CS
    GS -.->|"CẤU HÌNH HIỆN TẠI BỊ SAI:<br/>RubricClient khai báo name=user-service"| RS

    NS -->|"publish JSON"| RD
    RD -->|"subscribe notification-channel"| NS
    NS -->|"STOMP /topic/user/{ownerId}"| NG
    CS -->|"STOMP chat /topic/**"| NG
    NG -->|"SockJS/STOMP realtime"| FE
```

## 3. Đóng gói và đường đi của request

| Thành phần | Cách đóng gói | Cách truy cập khi deploy |
|---|---|---|
| Front-end | Multi-stage: `node:22-alpine` chạy `npm ci` + `npm run build:docker`; thư mục `dist` được copy sang `nginx:1.27-alpine` | Chỉ container này publish `${APP_PORT:-80}:80`; người dùng mở `http://192.168.181.134` |
| API Gateway | Multi-stage Maven 3.9/Temurin 21; chạy `app.jar` trên `eclipse-temurin:21-jre` | Chỉ Nginx và container trong `lms-network` gọi `api-gateway:8080` |
| 5 backend service | Mỗi service là một image/container độc lập; Maven build JAR, JRE 21 chạy JAR | Giao tiếp nội bộ bằng Docker DNS (`user-service`, `course-service`,...) và/hoặc Eureka |
| Eureka | Image Java riêng | Chỉ nội bộ tại `eureka-server:8761` |
| MariaDB, MongoDB, Redis | Image chính thức; dữ liệu tách khỏi container bằng named volume | Chỉ nội bộ; không có ánh xạ `ports` ra Ubuntu |

Luồng REST chuẩn:

1. Browser gửi request tới `192.168.181.134:80` cùng Bearer JWT.
2. Nginx nhận `/api/**` và proxy tới `api-gateway:8080` bằng Docker DNS.
3. Gateway kiểm tra JWT, bổ sung các header định danh người dùng.
4. Gateway hỏi Eureka để định tuyến `lb://...` tới đúng service.
5. Service xử lý nghiệp vụ, gọi service khác bằng OpenFeign khi cần và đọc/ghi data store.
6. Response quay lại qua Gateway → Nginx → Browser.

Luồng realtime không đi qua Gateway: Nginx proxy `/ws` thẳng tới
`course-service:8082` và `/ws-notifications` thẳng tới
`notification-service:8084`.

## 4. FE và BE có deploy chung IP không?

**Có, nếu chạy đúng `compose.yaml` hiện tại:** FE, Gateway, backend và data store
đều chạy trên cùng máy Ubuntu có IP vật lý `192.168.181.134`.

Tuy nhiên cần phân biệt:

- Chỉ FE/Nginx dùng IP host và port public: `192.168.181.134:80`.
- Backend không publish port `8080`–`8085` ra host, nên máy ngoài không gọi trực
  tiếp `192.168.181.134:8080`.
- Mỗi container có IP nội bộ riêng, có thể thay đổi. Các container gọi nhau bằng
  tên service Docker, không dùng IP container cố định.
- Với browser, FE và API có cùng origin. Biến build `VITE_API_BASE=/api/v1`
  khiến Axios gọi URL tương đối; Nginx chuyển tiếp request vào Gateway.

## 5. Chênh lệch giữa PDF và cấu hình thật cần lưu ý

1. PDF ghi Grading `8084` và Notification `8085`; mã nguồn/Dockerfile thực tế là
   Notification `8084`, Grading `8085`.
2. PDF chỉ thể hiện MySQL/Redis. Compose thực tế còn có MongoDB cho
   `course-service`, Eureka, Nginx reverse proxy và các named volume.
3. `grading-service` có hai cấu hình liên-service chưa chạy đúng trong Docker:
   `CourseClient` hard-code `localhost:8082`, còn `RubricClient` khai báo nhầm
   `name = "user-service"`.
4. `notification-service` đọc `${URL_FRONTEND}` trong `WebSocketConfig`, nhưng
   `compose.yaml` chưa truyền biến này. Container có thể không khởi động nếu
   không có nguồn cấu hình khác cung cấp giá trị.
5. Trong một file FE còn URL `localhost` hard-code ở trang tạo assignment; các
   luồng đó sẽ không gọi được server Ubuntu từ máy người dùng nếu được sử dụng.
