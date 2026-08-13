# Đặc tả các chức năng chính của hệ thống

## 1. Xác thực và quản lý người dùng

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Xác thực và quản lý người dùng |
| **Use Case ID** | UC-01 |
| **Brief Description** | Cho phép người dùng đăng nhập; quản trị viên quản lý tài khoản và quyền. |
| **Actor(s)** | Người dùng, Quản trị viên |
| **Trigger** | Người dùng nhấn **Đăng nhập** hoặc quản trị viên chọn chức năng quản lý người dùng. |

### Flow of Events

#### Basic Flow

Use case bắt đầu khi người dùng mở màn hình đăng nhập:

1. Người dùng nhập email và mật khẩu.
2. Người dùng nhấn **Đăng nhập**.
3. Hệ thống kiểm tra dữ liệu bắt buộc.
4. Hệ thống tìm tài khoản theo email (`findByEmail`).
5. Hệ thống kiểm tra mật khẩu và trạng thái tài khoản.
6. Hệ thống tạo access token và refresh token.
7. Hệ thống xác định vai trò và điều hướng người dùng.
8. Nếu là quản trị viên, người dùng mở màn hình quản lý tài khoản.
9. Hệ thống hiển thị danh sách người dùng (`getAllUsers`).
10. Quản trị viên thêm, sửa hoặc xóa tài khoản.
11. Hệ thống kiểm tra dữ liệu và quyền thao tác.
12. Hệ thống lưu thay đổi (`createUser`, `updateUser`, `deleteUser`).
13. Hệ thống thông báo thành công.
14. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Sai thông tin đăng nhập | 4.1 Hệ thống không tìm thấy tài khoản hoặc mật khẩu không đúng.<br>4.2 Hệ thống thông báo đăng nhập thất bại.<br>4.3 Quay lại bước 1. |
| AF2 – Tài khoản không hoạt động | 5.1 Hệ thống thông báo tài khoản bị khóa hoặc chưa được phép truy cập.<br>5.2 Kết thúc use case. |
| AF3 – Dữ liệu tài khoản bị trùng | 11.1 Hệ thống thông báo email hoặc mã người dùng đã tồn tại.<br>11.2 Quay lại bước 10. |
| AF4 – Không đủ quyền | 11.1 Hệ thống từ chối thao tác và hiển thị thông báo.<br>11.2 Kết thúc thao tác quản trị. |

### Pre-Conditions

| Title | Description |
|---|---|
| Có tài khoản | Người dùng đã có tài khoản hợp lệ trong hệ thống. |
| Quyền quản trị | Người thao tác quản lý tài khoản phải có vai trò quản trị viên. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Người dùng nhận token và được điều hướng; thay đổi tài khoản được lưu nếu có. |
| Thất bại | Không tạo phiên đăng nhập hoặc không thay đổi dữ liệu; lỗi phù hợp được hiển thị. |

### Extension Points

Làm mới token (`refreshToken`), quên mật khẩu (`forgotPassword`), đặt lại mật khẩu (`resetPassword`).

- [Activity Diagram](CN01_XacThucNguoiDung/activity.png)
- [Sequence Diagram](CN01_XacThucNguoiDung/sequence.png)

---

## 2. Quản lý học phần và nội dung lớp học

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Quản lý học phần và nội dung lớp học |
| **Use Case ID** | UC-02 |
| **Brief Description** | Quản lý học phần, lớp học phần, thành viên, đề cương và bài đăng. |
| **Actor(s)** | Quản trị viên, Giảng viên, Sinh viên |
| **Trigger** | Người dùng chọn một học phần hoặc chọn tạo học phần mới. |

### Flow of Events

#### Basic Flow

1. Người dùng mở màn hình danh sách học phần.
2. Hệ thống tải danh sách học phần theo quyền.
3. Quản trị viên thêm hoặc cập nhật học phần.
4. Hệ thống kiểm tra mã học phần và dữ liệu bắt buộc.
5. Hệ thống lưu học phần (`createCourse`, `updateCourse`).
6. Quản trị viên tạo lớp học phần và phân công giảng viên.
7. Hệ thống lưu lớp và danh sách giảng viên.
8. Sinh viên được ghi danh vào lớp (`enroll`).
9. Giảng viên tải đề cương hoặc tạo bài đăng (`createPost`).
10. Hệ thống lưu nội dung và thông báo cho thành viên.
11. Sinh viên mở lớp học phần.
12. Hệ thống hiển thị đề cương và danh sách bài đăng (`getPostsForCourse`).
13. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Mã học phần bị trùng | 4.1 Hệ thống thông báo mã đã tồn tại.<br>4.2 Quay lại bước 3. |
| AF2 – Không đủ quyền | 3.1 hoặc 9.1 Hệ thống từ chối thao tác.<br>3.2 Kết thúc thao tác hiện tại. |
| AF3 – Ghi danh không hợp lệ | 8.1 Lớp không tồn tại, đã đủ số lượng hoặc sinh viên đã ghi danh.<br>8.2 Hệ thống thông báo lỗi. |
| AF4 – Tệp đề cương không hợp lệ | 9.1 Hệ thống từ chối tệp sai loại hoặc vượt dung lượng.<br>9.2 Quay lại bước 9. |

### Pre-Conditions

| Title | Description |
|---|---|
| Đã đăng nhập | Người dùng có phiên đăng nhập hợp lệ. |
| Có quyền phù hợp | Quyền tạo/sửa phụ thuộc vai trò quản trị viên hoặc giảng viên. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Học phần, lớp, thành viên và nội dung được lưu và có thể truy cập. |
| Thất bại | Dữ liệu cũ được giữ nguyên và hệ thống hiển thị nguyên nhân. |

### Extension Points

Hủy ghi danh (`unenroll`), phân công lại giảng viên (`assignLecturers`), xóa bài đăng (`deletePost`).

- [Activity Diagram](CN02_HocPhanNoiDung/activity.png)
- [Sequence Diagram](CN02_HocPhanNoiDung/sequence.png)

---

## 3. Điểm danh bằng QR và GPS

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Điểm danh bằng QR và GPS |
| **Use Case ID** | UC-03 |
| **Brief Description** | Cho phép giảng viên mở phiên và sinh viên điểm danh bằng QR kết hợp vị trí GPS. |
| **Actor(s)** | Giảng viên, Sinh viên |
| **Trigger** | Giảng viên nhấn **Tạo phiên điểm danh** hoặc sinh viên nhấn **Quét QR**. |

### Flow of Events

#### Basic Flow

1. Giảng viên chọn lớp học phần.
2. Giảng viên nhập thời gian hiệu lực, tọa độ và bán kính.
3. Hệ thống kiểm tra quyền quản lý lớp.
4. Hệ thống tạo phiên, token và mã QR (`createAttendanceSession`).
5. Sinh viên quét mã QR.
6. Ứng dụng lấy vị trí hiện tại sau khi sinh viên cho phép.
7. Hệ thống nhận token, thời gian và tọa độ (`checkIn`).
8. Hệ thống kiểm tra sinh viên thuộc lớp.
9. Hệ thống kiểm tra phiên còn hoạt động và token hợp lệ.
10. Hệ thống kiểm tra sinh viên chưa điểm danh.
11. Hệ thống tính khoảng cách đến vị trí lớp.
12. Hệ thống lưu trạng thái có mặt cùng dữ liệu hậu kiểm.
13. Hệ thống thông báo điểm danh thành công.
14. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – QR không hợp lệ hoặc hết hạn | 9.1 Hệ thống từ chối yêu cầu.<br>9.2 Sinh viên quét mã của phiên đang hoạt động. |
| AF2 – Ngoài bán kính | 11.1 Hệ thống hiển thị khoảng cách và từ chối điểm danh.<br>11.2 Kết thúc use case. |
| AF3 – Đã điểm danh | 10.1 Hệ thống thông báo lượt điểm danh đã tồn tại.<br>10.2 Không tạo bản ghi mới. |
| AF4 – Không lấy được GPS | 6.1 Hệ thống yêu cầu bật quyền vị trí.<br>6.2 Quay lại bước 5. |

### Pre-Conditions

| Title | Description |
|---|---|
| Thuộc lớp | Sinh viên đã được ghi danh vào lớp học phần. |
| Phiên hoạt động | Phiên điểm danh còn thời gian hiệu lực. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Bản ghi điểm danh, thời gian, vị trí và khoảng cách được lưu. |
| Thất bại | Không tạo bản ghi điểm danh và lý do được hiển thị. |

### Extension Points

Giảng viên điều chỉnh trạng thái thủ công (`updateAttendanceStatus`), xem lịch sử điểm danh.

- [Activity Diagram](CN03_DiemDanh/activity.png)
- [Sequence Diagram](CN03_DiemDanh/sequence.png)

---

## 4. Kiểm tra và nộp bài trực tuyến

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Kiểm tra và nộp bài trực tuyến |
| **Use Case ID** | UC-04 |
| **Brief Description** | Cho phép giảng viên công bố bài đánh giá; sinh viên làm trắc nghiệm hoặc nộp bài tập và dự án. |
| **Actor(s)** | Giảng viên, Sinh viên |
| **Trigger** | Giảng viên công bố bài đánh giá hoặc sinh viên nhấn **Nộp bài**. |

### Flow of Events

#### Basic Flow

1. Giảng viên chọn lớp và tạo bài đánh giá (`createAssessment`).
2. Giảng viên nhập nội dung, loại bài, thời gian và hạn nộp.
3. Với bài thi, giảng viên chọn câu hỏi hoặc sinh đề từ ngân hàng.
4. Hệ thống kiểm tra dữ liệu và lưu bài đánh giá.
5. Giảng viên công bố bài đánh giá.
6. Sinh viên mở danh sách bài được giao.
7. Hệ thống kiểm tra sinh viên thuộc lớp và thời gian làm bài.
8. Sinh viên làm trắc nghiệm hoặc tải tệp bài tập/dự án.
9. Sinh viên nhấn **Nộp bài**.
10. Hệ thống kiểm tra thời hạn và dữ liệu bài nộp.
11. Hệ thống lưu bài (`submitAssignment` hoặc `submitExam`).
12. Với trắc nghiệm, hệ thống đối chiếu đáp án và lưu kết quả.
13. Hệ thống gửi xác nhận đã nộp.
14. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Chưa đến giờ hoặc quá hạn | 7.1 Hệ thống không cho phép mở/nộp bài.<br>7.2 Hiển thị thời gian hợp lệ. |
| AF2 – Bài chưa công bố | 6.1 Hệ thống không hiển thị bài cho sinh viên.<br>6.2 Kết thúc use case. |
| AF3 – Tệp không hợp lệ | 10.1 Hệ thống báo sai định dạng hoặc vượt dung lượng.<br>10.2 Quay lại bước 8. |
| AF4 – Nộp trùng | 10.1 Hệ thống yêu cầu xác nhận nộp lại hoặc từ chối theo cấu hình.<br>10.2 Quay lại bước 8. |

### Pre-Conditions

| Title | Description |
|---|---|
| Bài đã công bố | Bài đánh giá tồn tại và được phép hiển thị. |
| Thuộc lớp | Sinh viên thuộc lớp học phần được giao bài. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Bài làm, thời gian nộp và kết quả tự động nếu có được lưu. |
| Thất bại | Bài không được ghi nhận; hệ thống hiển thị lỗi và cho phép thử lại khi phù hợp. |

### Extension Points

Hủy nộp (`unsubmit`), xem kết quả thi (`getExamResult`), gửi thông báo nộp bài.

- [Activity Diagram](CN04_KiemTraNopBai/activity.png)
- [Sequence Diagram](CN04_KiemTraNopBai/sequence.png)

---

## 5. Quản lý nhóm, nhiệm vụ và trò chuyện

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Quản lý nhóm, nhiệm vụ và trò chuyện |
| **Use Case ID** | UC-05 |
| **Brief Description** | Cho phép tạo nhóm, quản lý thành viên, giao nhiệm vụ và trao đổi trong nhóm. |
| **Actor(s)** | Giảng viên, Trưởng nhóm, Thành viên |
| **Trigger** | Người dùng chọn nhóm học tập hoặc nhấn **Tạo nhóm**. |

### Flow of Events

#### Basic Flow

1. Giảng viên hoặc người có quyền tạo nhóm (`createGroup`).
2. Hệ thống kiểm tra lớp học phần và dữ liệu nhóm.
3. Hệ thống lưu nhóm.
4. Trưởng nhóm mở danh sách thành viên.
5. Trưởng nhóm thêm thành viên (`addMember`).
6. Hệ thống kiểm tra thành viên thuộc lớp và chưa ở trong nhóm.
7. Hệ thống lưu thành viên và vai trò.
8. Trưởng nhóm tạo và giao nhiệm vụ (`createTask`).
9. Thành viên xem nhiệm vụ và cập nhật trạng thái (`updateStatus`).
10. Thành viên mở cuộc trò chuyện nhóm.
11. Hệ thống tải lịch sử (`getChatHistory`).
12. Thành viên gửi tin nhắn (`sendMessage`).
13. Hệ thống lưu và phát tin nhắn cho nhóm.
14. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Thành viên đã thuộc nhóm | 6.1 Hệ thống thông báo thành viên đã tồn tại.<br>6.2 Quay lại bước 4. |
| AF2 – Không đủ quyền | 2.1, 5.1 hoặc 8.1 Hệ thống từ chối thao tác.<br>2.2 Kết thúc thao tác hiện tại. |
| AF3 – Nhiệm vụ không tồn tại | 9.1 Hệ thống thông báo nhiệm vụ đã bị xóa hoặc không thuộc nhóm.<br>9.2 Tải lại danh sách. |
| AF4 – Mất kết nối trò chuyện | 13.1 Ứng dụng giữ trạng thái chưa gửi.<br>13.2 Gửi lại khi kết nối được khôi phục. |

### Pre-Conditions

| Title | Description |
|---|---|
| Thuộc lớp học phần | Thành viên nhóm phải thuộc cùng lớp học phần. |
| Có quyền quản lý | Chỉ giảng viên hoặc trưởng nhóm được quản lý thành viên và giao nhiệm vụ. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Nhóm, thành viên, nhiệm vụ hoặc tin nhắn được cập nhật. |
| Thất bại | Không thay đổi dữ liệu và hệ thống hiển thị nguyên nhân. |

### Extension Points

Xóa thành viên (`removeMember`), đổi quyền (`changeRole`), giải tán nhóm (`dissolveGroup`).

- [Activity Diagram](CN05_NhomNhiemVu/activity.png)
- [Sequence Diagram](CN05_NhomNhiemVu/sequence.png)

---

## 6. Quản lý đề cương, CLO và Rubric

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Quản lý Đề cương và Thiết lập Rubric |
| **Use Case ID** | UC-14 |
| **Brief Description** | Cho phép giảng viên chính quản lý đề cương, CLO, tiêu chí, trọng số, liên kết CLO và mức thể hiện của Rubric. |
| **Actor(s)** | Giảng viên chính |
| **Trigger** | Giảng viên chọn học phần và nhấn **Thiết lập CLO/Rubric**. |

### Flow of Events

#### Basic Flow

1. Giảng viên chọn học phần cần thiết lập.
2. Hệ thống hiển thị đề cương, CLO và Rubric hiện có.
3. Giảng viên thêm hoặc chỉnh sửa CLO.
4. Hệ thống kiểm tra dữ liệu và mã CLO (`findByCloCode`).
5. Hệ thống lưu CLO (`createClo`, `updateClo`).
6. Giảng viên tạo Rubric mới.
7. Giảng viên nhập tiêu chí và trọng số.
8. Giảng viên liên kết từng tiêu chí với CLO.
9. Giảng viên thiết lập ít nhất hai mức thể hiện cho mỗi tiêu chí.
10. Giảng viên nhập tên mức, mô tả và điểm số.
11. Giảng viên nhấn **Lưu**.
12. Hệ thống kiểm tra tổng trọng số, liên kết CLO và số mức.
13. Hệ thống lưu Rubric, tiêu chí và mức (`createRubric`, `updateMatrix`).
14. Hệ thống thông báo thành công.
15. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Mã CLO bị trùng | 4.1 Hệ thống thông báo mã CLO đã tồn tại.<br>4.2 Quay lại bước 3. |
| AF2 – Tổng trọng số khác 100% | 12.1 Hệ thống hiển thị tổng trọng số hiện tại.<br>12.2 Không cho phép lưu và quay lại bước 7. |
| AF3 – Thiếu liên kết CLO | 12.1 Hệ thống đánh dấu tiêu chí chưa liên kết.<br>12.2 Quay lại bước 8. |
| AF4 – Tiêu chí có ít hơn hai mức | 12.1 Hệ thống yêu cầu bổ sung mức thể hiện.<br>12.2 Quay lại bước 9. |
| AF5 – Thiếu dữ liệu bắt buộc | 12.1 Hệ thống hiển thị lỗi cạnh trường tương ứng.<br>12.2 Quay lại bước có dữ liệu thiếu. |

### Pre-Conditions

| Title | Description |
|---|---|
| Đã đăng nhập | Giảng viên chính có phiên đăng nhập hợp lệ. |
| Có quyền học phần | Giảng viên được phân công quản lý học phần. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | CLO và cấu trúc Rubric hợp lệ được lưu đầy đủ. |
| Thất bại | Không lưu dữ liệu không hợp lệ; dữ liệu trước đó không bị thay đổi. |

### Extension Points

Gửi Rubric chờ duyệt, cập nhật ma trận (`updateMatrix`), tạo phiên bản Rubric mới.

- [Activity Diagram](CN06_CloRubric/activity.png)
- [Sequence Diagram](CN06_CloRubric/sequence.png)

---

## 7. Chấm điểm, phản hồi và xem kết quả OBE

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Chấm điểm, phản hồi và xem kết quả OBE |
| **Use Case ID** | UC-15 |
| **Brief Description** | Cho phép giảng viên chấm theo Rubric, công bố phản hồi; sinh viên xem điểm và mức đạt CLO. |
| **Actor(s)** | Giảng viên, Sinh viên, Trưởng bộ môn |
| **Trigger** | Giảng viên mở một bài nộp để chấm hoặc sinh viên chọn **Xem kết quả**. |

### Flow of Events

#### Basic Flow

1. Giảng viên chọn bài đánh giá và sinh viên cần chấm.
2. Hệ thống tải bài nộp và đúng phiên bản Rubric.
3. Giảng viên chọn một mức cho từng tiêu chí.
4. Giao diện hiển thị điểm tạm tính.
5. Giảng viên nhập phản hồi chung hoặc theo tiêu chí.
6. Giảng viên nhấn **Lưu điểm**.
7. Hệ thống kiểm tra đủ tiêu chí và mức đã chọn thuộc Rubric.
8. Hệ thống tính lại điểm tại máy chủ (`processGrading`).
9. Hệ thống lưu `Grade` và các `RubricResult`.
10. Giảng viên công bố kết quả.
11. Hệ thống thông báo cho sinh viên.
12. Sinh viên chọn **Xem kết quả**.
13. Hệ thống tải điểm, phản hồi và tổng hợp CLO (`getCloDetail`).
14. Hệ thống hiển thị kết quả chi tiết và biểu đồ năng lực.
15. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Thiếu tiêu chí | 7.1 Hệ thống đánh dấu tiêu chí chưa chấm.<br>7.2 Quay lại bước 3. |
| AF2 – Mức không thuộc Rubric | 7.1 Hệ thống từ chối dữ liệu và tải lại Rubric đúng phiên bản.<br>7.2 Quay lại bước 2. |
| AF3 – Chưa công bố kết quả | 12.1 Hệ thống thông báo kết quả chưa được công bố.<br>12.2 Kết thúc use case phía sinh viên. |
| AF4 – Không đủ dữ liệu OBE | 13.1 Hệ thống hiển thị trạng thái chưa đủ dữ liệu thay vì phần trăm đạt.<br>13.2 Vẫn hiển thị các điểm đã có. |

### Pre-Conditions

| Title | Description |
|---|---|
| Có bài nộp | Bài làm của sinh viên đã được hệ thống ghi nhận. |
| Rubric hợp lệ | Bài đánh giá đã gắn với Rubric đúng phiên bản. |
| Có quyền chấm | Giảng viên được phân công cho lớp hoặc bài đánh giá. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Điểm tổng, kết quả từng tiêu chí, phản hồi và dữ liệu CLO được lưu hoặc hiển thị. |
| Thất bại | Không lưu điểm không hợp lệ; kết quả cũ được giữ nguyên và lỗi được thông báo. |

### Extension Points

Sử dụng phản hồi mẫu, sửa điểm có lưu nhật ký, xuất sổ điểm và báo cáo OBE.

- [Activity Diagram](CN07_ChamDiemOBE/activity.png)
- [Sequence Diagram](CN07_ChamDiemOBE/sequence.png)

> Mã UC-14 được giữ theo đặc tả đã cung cấp. Các mã còn lại có thể đổi theo bảng Use Case tổng quát chính thức của báo cáo.
