# Tai lieu cong nghe va giai thuat trong phan Rubric

## 1. Tong quan

Phan `rubric` trong he thong co ung dung cong nghe phan mem ro rang, va co su dung mot so giai thuat xu ly nghiep vu o muc rule-based. Tuy nhien, hien tai he thong **chua ap dung cac thuat toan AI, machine learning, data mining, hay toi uu phuc tap**. Phan lon logic trong module nay la:

- Quan ly rubric, criteria, level va CLO.
- Dong bo rubric matrix tu du lieu frontend vao database.
- Tong hop du lieu rubric de phuc vu hien thi va cham diem.
- Xac thuc va lien ket du lieu giua cac microservice.

Noi cach khac, day la mot module co tinh ung dung cong nghe va xu ly du lieu nghiep vu, nhung chua phai he thong tri tue nhan tao hay giai thuat hoc may.

## 2. Cac cong nghe duoc ap dung

### 2.1. Kien truc Microservice

Phan Rubric duoc xay dung duoi dang mot service rieng la `rubric-service`, tach biet voi `grading-service`, `user-service`, `notification-service` va `api-gateway`. Cach to chuc nay giup:

- Tach rieng chuc nang quan ly rubric.
- De mo rong, bao tri va trien khai doc lap.
- Ho tro giao tiep lien service trong he thong LMS.

Minh chung trong code:

- Cau hinh service tai [rubric-service/rubric-service/pom.xml](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/pom.xml:17>).
- Kich hoat service discovery va Feign tai [rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/RubricServiceApplication.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/RubricServiceApplication.java:10>).

### 2.2. Spring Boot

`rubric-service` duoc xay dung tren `Spring Boot 3.2.5`, cung cap cac thanh phan:

- REST API voi `spring-boot-starter-web`
- Xu ly nghiep vu voi `@Service`
- Quan ly dependency injection voi `@Autowired`
- Cau hinh chay doc lap cho moi service

Minh chung:

- Dependency `spring-boot-starter-web` tai [rubric-service/rubric-service/pom.xml](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/pom.xml:47>).

### 2.3. Spring Data JPA va ORM

He thong su dung `Spring Data JPA` de anh xa doi tuong Java voi bang trong MySQL. Day la cong nghe quan trong giup module Rubric:

- Luu rubric, criteria, level, CLO vao database.
- Quan ly quan he 1-n va n-1 giua cac bang.
- Truy van va cap nhat du lieu thong qua repository.

Minh chung:

- Dependency JPA tai [rubric-service/rubric-service/pom.xml](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/pom.xml:53>).
- `RubricRepository` su dung `JpaRepository` tai [RubricRepository.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/repository/RubricRepository.java:10>).

### 2.4. MySQL

Du lieu rubric duoc luu tru bang co so du lieu quan he MySQL. Viec dung MySQL phu hop voi cac du lieu co cau truc ro rang nhu:

- Rubric
- Rubric Criteria
- Rubric Level
- Course CLO
- Bang mapping CLO voi course

Minh chung:

- Dependency `mysql-connector-j` tai [rubric-service/rubric-service/pom.xml](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/pom.xml:59>).

### 2.5. OpenFeign trong giao tiep lien service

Phan rubric co su dung `OpenFeign` de giao tiep giua cac microservice. Day la mot diem cong nghe quan trong, vi no cho phep:

- Goi service khac thong qua interface Java.
- Xac minh thong tin hoac dong bo du lieu giua rubric-service va service khac.
- Giu token `Authorization` khi chuyen request noi bo.

Minh chung:

- Dependency `spring-cloud-starter-openfeign` tai [rubric-service/rubric-service/pom.xml](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/pom.xml:75>).
- Kich hoat Feign client tai [RubricServiceApplication.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/RubricServiceApplication.java:12>).
- Truyen tiep JWT token sang service khac tai [FeignClientInterceptor.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/client/FeignClientInterceptor.java:13>).

### 2.6. Eureka Service Discovery

He thong su dung `Eureka Client` de dang ky va tim kiem service trong kien truc microservice. Nhieu service trong he thong co the tim thay `rubric-service` ma khong can hard-code dia chi IP.

Minh chung:

- Dependency `spring-cloud-starter-netflix-eureka-client` tai [rubric-service/rubric-service/pom.xml](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/pom.xml:65>).
- Annotation `@EnableDiscoveryClient` tai [RubricServiceApplication.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/RubricServiceApplication.java:13>).

### 2.7. JWT cho xac thuc va uy quyen

Module Rubric co khai bao thu vien `jjwt` va co interceptor de chuyen header `Authorization` khi goi service noi bo. Dieu nay cho thay he thong ap dung co che xac thuc dua tren JWT.

Minh chung:

- Thu vien JWT trong [rubric-service/rubric-service/pom.xml](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/pom.xml:81>).
- Chuyen token trong [FeignClientInterceptor.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/client/FeignClientInterceptor.java:19>).

### 2.8. Transaction Management

Khi cap nhat rubric matrix, he thong dung `@Transactional` de dam bao tinh toan ven du lieu. Neu qua trinh cap nhat rubric, criteria, level gap loi thi co the rollback theo co che transaction.

Minh chung:

- `@Transactional` tai [RubricMatrixService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/RubricMatrixService.java:35>).

### 2.9. EntityGraph toi uu truy van

He thong su dung `@EntityGraph` de nap san `criteria` va `levels` khi lay rubric. Day la mot ky thuat toi uu truy van trong JPA, giup han che tinh trang N+1 query.

Minh chung:

- `@EntityGraph(attributePaths = {"criteria", "criteria.levels"})` tai [RubricRepository.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/repository/RubricRepository.java:12>).

### 2.10. Redis

Trong code co xuat hien `AttendanceRedisService`, nhung phan Redis hien dang o trang thai du phong hoac chua kich hoat thuc te.

Minh chung:

- Dependency Redis dang duoc comment trong [rubric-service/rubric-service/pom.xml](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/pom.xml:69>).
- Logic Redis trong `AttendanceRedisService` dang duoc comment.

Ket luan cho muc nay: co nhac den Redis, nhung chua nen ghi la he thong da trien khai Redis day du.

## 3. Cac giai thuat va ky thuat xu ly du lieu da duoc ap dung

### 3.1. Kiem tra trung ma CLO

Khi tao CLO moi, he thong thuc hien kiem tra ton tai theo `cloCode`. Neu ma CLO da co trong he thong, request se bi tu choi.

Y nghia:

- Dam bao tinh duy nhat cua CLO.
- Tranh lap du lieu.
- Giu tinh nhat quan cho phan mapping rubric va course.

Minh chung:

- Logic kiem tra trung du lieu tai [CourseCloService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/CourseCloService.java:28>).

Danh gia:

- Day la mot **thuat toan kiem tra rang buoc nghiep vu**, khong phuc tap nhung can thiet trong he thong.

### 3.2. Tinh tong trong so rubric

Moi rubric gom nhieu criteria, moi criterion co `weight`. He thong su dung phep cong don tat ca trong so de tinh `totalWeight`.

Cong thuc:

`totalWeight = sum(weight_i)`

Muc dich:

- Xac dinh rubric da du trong so hay chua.
- Phuc vu kiem tra tinh hop le cua rubric.
- Ho tro hien thi trang thai rubric.

Minh chung:

- Tinh tong trong so tai [RubricService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/RubricService.java:86>).

Danh gia:

- Day la **giai thuat tong hop du lieu** don gian, co do phuc tap O(n) voi `n` la so criteria.

### 3.3. Dem so CLO duoc bao phu trong rubric

He thong lay danh sach `cloId` tu cac criterion, loai bo gia tri `null`, sau do dung `distinct()` de dem so CLO khac nhau.

Muc dich:

- Xac dinh rubric dang danh gia bao nhieu CLO.
- Phuc vu bao cao OBE va quan ly muc do bao phu chuan dau ra.

Minh chung:

- Logic dem CLO tai [RubricService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/RubricService.java:90>).

Danh gia:

- Day la **ky thuat dem phan tu duy nhat** tren tap du lieu, do phuc tap xap xi O(n).

### 3.4. Sap xep muc danh gia theo diem giam dan

Trong qua trinh tao response cho rubric matrix, danh sach `RubricLevel` duoc sap xep theo `score` giam dan. Neu diem bang nhau hoac `null`, he thong tiep tuc so sanh theo `levelName`.

Muc dich:

- Dam bao muc danh gia hien thi theo thu tu hop ly.
- Ho tro giao dien va giang vien de doc rubric nhat quan.

Minh chung:

- Comparator sap xep tai [RubricService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/RubricService.java:17>).
- Ap dung sap xep tai [RubricService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/RubricService.java:104>).

Danh gia:

- Day la **giai thuat sap xep du lieu** co do phuc tap O(m log m) voi `m` la so level trong moi criterion.

### 3.5. Xac dinh trang thai hoan thien cua rubric

He thong xac dinh trang thai rubric dua tren tong trong so:

- Neu `totalWeight >= 100` thi rubric duoc xem la hoan thien.
- Nguoc lai rubric o trang thai chua hoan thien.

Muc dich:

- Ho tro validate nghiep vu.
- Canh bao giang vien khi rubric chua dat tong trong so mong muon.

Minh chung:

- Logic trang thai tai [RubricService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/RubricService.java:127>).

Danh gia:

- Day la **luat ra quyet dinh dua tren nguong**.

### 3.6. Giai thuat dong bo Rubric Matrix tu request vao CSDL

Day la phan xu ly nghiep vu trung tam cua module rubric. Khi frontend gui `RubricMatrixRequest`, he thong se:

1. Tach danh sach criteria, levels va descriptors.
2. Tim rubric theo ID; neu chua ton tai thi tao moi.
3. Duyet tung criterion trong request.
4. Tim criterion theo ID; neu chua co thi tao moi.
5. Cap nhat ten criterion, trong so, CLO gan voi criterion.
6. Tao tap level cho criterion.
7. Neu score va description cua level dang thieu, he thong tim bo descriptor tuong ung de bo sung.
8. Xoa lien ket level cu, gan lai tap level moi.
9. Xoa danh sach criterion cu cua rubric, gan lai danh sach moi.
10. Luu toan bo rubric vao database trong mot transaction.

Minh chung:

- Toan bo quy trinh nam trong [RubricMatrixService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/RubricMatrixService.java:36>).

Danh gia:

- Day la **giai thuat dong bo cau truc du lieu phan cap** gom 3 tang: `rubric -> criteria -> levels`.
- Ban chat la mot quy trinh merge/cap nhat du lieu, rat phu hop de mo ta trong bao cao do an.
- Do phuc tap phu thuoc vao so criterion, so level va so descriptor. Neu ky hieu:
  - `n`: so criterion
  - `m`: so level tren moi criterion
  - `k`: so descriptor
  - thi do phuc tap tong quat gan dung co the xem la O(n * m * k) trong truong hop tim descriptor bang stream tuyen tinh.

### 3.7. Bo sung descriptor khi level thieu thong tin

Neu `LevelRequest` khong co `score` va `description`, he thong se tim trong `descriptorRequests` cap `(criterionId, levelId)` tuong ung de bo sung.

Muc dich:

- Tach cau truc du lieu nhap tu frontend thanh hai lop: dinh nghia level va noi dung descriptor.
- Cho phep frontend gui du lieu mem deo hon.

Minh chung:

- Logic bo sung descriptor tai [RubricMatrixService.java](</d:/SourCode/KLTN/LMS_rubric/rubric-service/rubric-service/src/main/java/hcmuaf/edu/vn/fit/rubric_service/service/RubricMatrixService.java:90>).

Danh gia:

- Day la **ky thuat ghep noi du lieu theo khoa ket hop** `(criterionId, levelId)`.

## 4. Moi lien he voi phan cham diem

Trong `grading-service`, he thong co goi sang `rubric-service` thong qua `RubricClient` de lay thong tin rubric truoc khi cham.

Minh chung:

- Goi `rubricClient.getRubric(rubricId)` tai [GradingService.java](</d:/SourCode/KLTN/LMS_rubric/grading-service/grading-service/src/main/java/hcmuaf/edu/vn/fit/grading_service/service/GradingService.java:31>).

Tuy nhien, can luu y:

- Ham `gradeStudent` hien tai dang dung `Math.random() * 10` de tao diem tong.
- Dieu nay cho thay **thuat toan tinh diem theo rubric chua duoc cai dat hoan chinh** trong code hien tai.

Vi vay, neu viet bao cao dung voi hien trang du an, nen ghi:

- He thong da co nen tang rubric de ho tro cham diem.
- Da co lien ket giua grading-service va rubric-service.
- Nhung cong thuc tinh diem tu criteria/level sang total score hien chua duoc trien khai day du trong ma nguon hien tai.

## 5. Ket luan

Co the khang dinh rang phan Rubric **co ung dung cong nghe va co su dung mot so giai thuat xu ly nghiep vu**, cu the:

- Cong nghe: Spring Boot, Spring Data JPA, MySQL, OpenFeign, Eureka, JWT, transaction management, EntityGraph.
- Giai thuat/ky thuat xu ly: kiem tra trung CLO, tinh tong trong so, dem CLO duy nhat, sap xep level theo diem, xac dinh nguong hoan thien rubric, dong bo rubric matrix, ghep descriptor theo khoa ket hop.

Tuy nhien, can mo ta trung thuc rang:

- He thong **chua ap dung AI hay machine learning** trong phan rubric.
- He thong **chua co thuat toan tinh diem rubric hoan chinh** trong `grading-service`.
- Gia tri ky thuat noi bat nhat cua module nay hien nam o **xu ly nghiep vu theo luat, quan tri du lieu rubric da tang, va giao tiep microservice**.

## 6. Mau mo ta ngan de dua vao bao cao

Co the su dung doan van sau:

> Phan Rubric cua he thong LMS ap dung kien truc microservice tren nen tang Spring Boot, ket hop Spring Data JPA va MySQL de quan ly du lieu rubric, criteria, level va CLO. He thong su dung OpenFeign va Eureka de giao tiep va dinh vi service trong moi truong phan tan, dong thoi su dung JWT de bao toan thong tin xac thuc giua cac request noi bo. Ve mat xu ly, module Rubric ap dung cac giai thuat nghiep vu nhu kiem tra trung ma CLO, tinh tong trong so rubric, dem so CLO duoc bao phu, sap xep muc danh gia theo diem giam dan, va dong bo cau truc rubric matrix tu frontend vao co so du lieu. Day la nhom giai thuat xu ly du lieu va rang buoc nghiep vu, chua bao gom cac ky thuat AI hay hoc may.
