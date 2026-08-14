# Đặc tả các Use Case cốt lõi

## Danh sách chức năng được chọn

| Mã | Chức năng | Tác nhân chính |
|---|---|---|
| UC-03 | Xem đánh giá Rubric | Sinh viên |
| UC-07 | Điểm danh bằng QR và GPS | Sinh viên, Giảng viên |
| UC-08 | Nộp bài và xem phản hồi | Sinh viên |
| UC-09 | Làm bài thi trực tuyến | Sinh viên |
| UC-10 | Quản lý nhóm và nhiệm vụ | Sinh viên, Trưởng nhóm |
| UC-12 | Quản lý lớp học | Giảng viên |
| UC-14 | Quản lý đề cương, CLO và Rubric | Giảng viên chính |
| UC-15 | Giao bài tập | Giảng viên |
| UC-16 | Chấm điểm và phản hồi | Giảng viên |
| UC-17 | Quản lý đề thi trắc nghiệm | Giảng viên |
| UC-18 | Quản lý ngân hàng câu hỏi | Giảng viên, Trưởng bộ môn |
| UC-30 | Phê duyệt Rubric | Trưởng bộ môn |
| UC-34 | Phân tích chuẩn đầu ra OBE | Trưởng bộ môn |

Các chức năng xem bài đăng, danh sách lớp, danh sách sinh viên, lịch sử, thông báo và import dữ liệu được xem là luồng con hoặc extension point của các chức năng trên.

---

## UC-03. Xem đánh giá Rubric

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Xem đánh giá Rubric |
| **Use Case ID** | UC-03 |
| **Brief Description** | Sinh viên xem tiêu chí, mức thể hiện, điểm và nhận xét của các loại đánh giá. |
| **Actor(s)** | Sinh viên |
| **Trigger** | Sinh viên chọn **Xem đánh giá Rubric** trong một học phần. |

### Flow of Events

#### Basic Flow

1. Sinh viên mở học phần.
2. Sinh viên chọn mục đánh giá Rubric.
3. Hệ thống kiểm tra sinh viên thuộc lớp học phần.
4. Hệ thống tải danh sách bài đánh giá.
5. Sinh viên chọn bài tập, dự án, chuyên cần hoặc cuối kỳ.
6. Hệ thống tải Rubric gắn với bài đánh giá (`getRubricMatrixDetail`).
7. Hệ thống tải điểm và phản hồi của sinh viên.
8. Hệ thống hiển thị tiêu chí, trọng số, mức đạt, điểm và nhận xét.
9. Sinh viên xem chi tiết từng tiêu chí.
10. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Chưa có Rubric | 6.1 Hệ thống thông báo bài đánh giá chưa thiết lập Rubric.<br>6.2 Quay lại bước 4. |
| AF2 – Chưa có kết quả | 7.1 Hệ thống chỉ hiển thị cấu trúc Rubric và trạng thái chưa chấm.<br>7.2 Tiếp tục bước 9. |
| AF3 – Không thuộc lớp | 3.1 Hệ thống từ chối truy cập.<br>3.2 Kết thúc use case. |

### Pre-Conditions

| Title | Description |
|---|---|
| Đã đăng nhập | Sinh viên có phiên đăng nhập hợp lệ. |
| Thuộc lớp | Sinh viên đã được ghi danh vào lớp học phần. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Rubric và kết quả được hiển thị; dữ liệu không bị thay đổi. |
| Thất bại | Hệ thống hiển thị lý do không thể xem dữ liệu. |

### Extension Points

Xem biểu đồ năng lực, xem đánh giá môn học.

- [Activity Diagram](UC03_XemRubric/activity.png)
- [Sequence Diagram](UC03_XemRubric/sequence.png)

---

## UC-07. Điểm danh bằng QR và GPS

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Điểm danh bằng QR và GPS |
| **Use Case ID** | UC-07 |
| **Brief Description** | Giảng viên tạo phiên; sinh viên quét QR và gửi vị trí để ghi nhận điểm danh. |
| **Actor(s)** | Giảng viên, Sinh viên |
| **Trigger** | Giảng viên tạo phiên hoặc sinh viên nhấn **Quét QR**. |

### Flow of Events

#### Basic Flow

1. Giảng viên chọn lớp và tạo phiên điểm danh.
2. Giảng viên nhập thời gian, tọa độ và bán kính.
3. Hệ thống tạo token và mã QR (`createAttendanceSession`).
4. Sinh viên quét mã QR.
5. Ứng dụng lấy vị trí GPS sau khi được cho phép.
6. Hệ thống kiểm tra sinh viên thuộc lớp.
7. Hệ thống kiểm tra token, thời gian và lượt điểm danh trùng.
8. Hệ thống tính khoảng cách đến vị trí lớp.
9. Hệ thống lưu trạng thái có mặt (`checkIn`).
10. Hệ thống thông báo thành công.
11. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – QR hết hạn | 7.1 Hệ thống từ chối yêu cầu và yêu cầu quét lại mã đang hoạt động. |
| AF2 – Ngoài bán kính | 8.1 Hệ thống hiển thị khoảng cách và không ghi nhận có mặt. |
| AF3 – Đã điểm danh | 7.1 Hệ thống thông báo lượt điểm danh đã tồn tại. |
| AF4 – Không có GPS | 5.1 Hệ thống yêu cầu bật quyền vị trí và quay lại bước 4. |

### Pre-Conditions

| Title | Description |
|---|---|
| Phiên hợp lệ | Phiên điểm danh đang hoạt động. |
| Thuộc lớp | Sinh viên thuộc lớp học phần tương ứng. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Thời gian, vị trí, khoảng cách và trạng thái điểm danh được lưu. |
| Thất bại | Không tạo bản ghi và hệ thống hiển thị nguyên nhân. |

### Extension Points

Xem lịch sử điểm danh; giảng viên điều chỉnh trạng thái thủ công.

- [Activity Diagram](UC07_DiemDanh/activity.png)
- [Sequence Diagram](UC07_DiemDanh/sequence.png)

---

## UC-08. Nộp bài và xem phản hồi

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Nộp bài và xem phản hồi |
| **Use Case ID** | UC-08 |
| **Brief Description** | Sinh viên nộp bài tập hoặc dự án và xem điểm, phản hồi sau khi công bố. |
| **Actor(s)** | Sinh viên |
| **Trigger** | Sinh viên nhấn **Nộp bài** hoặc **Xem kết quả**. |

### Flow of Events

#### Basic Flow

1. Sinh viên mở bài tập được giao.
2. Hệ thống hiển thị yêu cầu, Rubric và hạn nộp.
3. Sinh viên chọn hoặc kéo thả tệp bài làm.
4. Sinh viên nhấn **Nộp bài**.
5. Hệ thống kiểm tra lớp, thời hạn và tệp.
6. Hệ thống lưu bài làm và thời gian (`submitAssignment`).
7. Hệ thống gửi xác nhận đã nộp.
8. Sau khi điểm được công bố, sinh viên chọn **Xem kết quả**.
9. Hệ thống tải điểm tổng và kết quả từng tiêu chí.
10. Hệ thống hiển thị điểm và phản hồi chi tiết.
11. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Quá hạn | 5.1 Hệ thống từ chối hoặc ghi nhận nộp muộn theo cấu hình. |
| AF2 – Tệp không hợp lệ | 5.1 Hệ thống báo sai định dạng hoặc vượt dung lượng.<br>5.2 Quay lại bước 3. |
| AF3 – Chưa công bố điểm | 9.1 Hệ thống hiển thị trạng thái đang chờ chấm. |

### Pre-Conditions

| Title | Description |
|---|---|
| Bài đã công bố | Bài tập tồn tại và cho phép sinh viên truy cập. |
| Thuộc lớp | Sinh viên thuộc lớp được giao bài. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Bài nộp được lưu hoặc kết quả đã công bố được hiển thị. |
| Thất bại | Bài không được lưu; dữ liệu trước đó được giữ nguyên. |

### Extension Points

Hủy nộp (`unsubmit`), nộp lại, xem biểu đồ năng lực.

- [Activity Diagram](UC08_NopBai/activity.png)
- [Sequence Diagram](UC08_NopBai/sequence.png)

---

## UC-09. Làm bài thi trực tuyến

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Làm bài thi trực tuyến |
| **Use Case ID** | UC-09 |
| **Brief Description** | Sinh viên làm và nộp bài thi trắc nghiệm trong thời gian quy định. |
| **Actor(s)** | Sinh viên |
| **Trigger** | Sinh viên chọn một đề thi đã được phân công. |

### Flow of Events

#### Basic Flow

1. Sinh viên mở danh sách đề thi.
2. Hệ thống hiển thị các đề được phân công.
3. Sinh viên chọn đề và nhấn **Bắt đầu**.
4. Hệ thống kiểm tra trạng thái và thời gian thi.
5. Hệ thống tải câu hỏi của đề.
6. Sinh viên chọn đáp án và chuyển giữa các câu hỏi.
7. Hệ thống lưu tạm tiến độ.
8. Sinh viên nhấn **Nộp bài**.
9. Hệ thống khóa bài, chấm đáp án và lưu kết quả (`submitExam`).
10. Hệ thống hiển thị xác nhận và kết quả theo cấu hình.
11. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Ngoài thời gian thi | 4.1 Hệ thống không cho phép bắt đầu hoặc tự động kết thúc bài. |
| AF2 – Mất kết nối | 7.1 Hệ thống giữ tiến độ gần nhất và đồng bộ lại khi có mạng. |
| AF3 – Đã nộp bài | 4.1 Hệ thống từ chối tạo lượt làm mới và hiển thị trạng thái đã nộp. |

### Pre-Conditions

| Title | Description |
|---|---|
| Đề đã công bố | Đề thi được phân công cho sinh viên. |
| Đúng thời gian | Thời điểm truy cập nằm trong khoảng cho phép. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Bài làm, đáp án, thời gian và kết quả được lưu. |
| Thất bại | Lượt thi không bị ghi sai; hệ thống hiển thị trạng thái phù hợp. |

### Extension Points

Xem kết quả thi (`getExamResult`), xem phản hồi chi tiết.

- [Activity Diagram](UC09_ThiTrucTuyen/activity.png)
- [Sequence Diagram](UC09_ThiTrucTuyen/sequence.png)

---

## UC-10. Quản lý nhóm và nhiệm vụ

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Quản lý nhóm và nhiệm vụ |
| **Use Case ID** | UC-10 |
| **Brief Description** | Quản lý thành viên, quyền, nhiệm vụ và trao đổi trong nhóm học tập. |
| **Actor(s)** | Sinh viên, Trưởng nhóm |
| **Trigger** | Người dùng mở nhóm học tập hoặc trưởng nhóm chọn thao tác quản lý. |

### Flow of Events

#### Basic Flow

1. Người dùng mở nhóm của mình.
2. Hệ thống tải thành viên và nhiệm vụ.
3. Trưởng nhóm thêm, xóa hoặc sửa quyền thành viên.
4. Hệ thống kiểm tra quyền và tình trạng thành viên.
5. Hệ thống lưu thay đổi (`addMember`, `removeMember`, `changeRole`).
6. Trưởng nhóm tạo và giao nhiệm vụ (`createTask`).
7. Thành viên cập nhật trạng thái nhiệm vụ (`updateStatus`).
8. Thành viên mở cuộc trò chuyện nhóm.
9. Hệ thống tải lịch sử trò chuyện.
10. Thành viên gửi tin nhắn (`sendMessage`).
11. Hệ thống lưu và phát tin nhắn.
12. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Không đủ quyền | 4.1 Hệ thống từ chối thao tác quản lý. |
| AF2 – Thành viên đã tồn tại | 4.1 Hệ thống thông báo thành viên đã thuộc nhóm. |
| AF3 – Mất kết nối chat | 11.1 Tin nhắn được giữ ở trạng thái chưa gửi và thử lại. |

### Pre-Conditions

| Title | Description |
|---|---|
| Có nhóm | Nhóm học tập đã được tạo trong lớp. |
| Có quyền | Chỉ trưởng nhóm được quản lý thành viên và giao nhiệm vụ. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Thành viên, nhiệm vụ hoặc tin nhắn được cập nhật. |
| Thất bại | Không thay đổi dữ liệu và hệ thống hiển thị lý do. |

### Extension Points

Giải tán nhóm, chia nhóm tự động, xem bằng chứng nhiệm vụ.

- [Activity Diagram](UC10_NhomTask/activity.png)
- [Sequence Diagram](UC10_NhomTask/sequence.png)

---

## UC-12. Quản lý lớp học

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Quản lý lớp học |
| **Use Case ID** | UC-12 |
| **Brief Description** | Giảng viên quản lý lớp, sinh viên, giáo trình và trao đổi trong lớp. |
| **Actor(s)** | Giảng viên |
| **Trigger** | Giảng viên chọn **Quản lý lớp học**. |

### Flow of Events

#### Basic Flow

1. Giảng viên mở danh sách lớp được phân công.
2. Hệ thống tải danh sách lớp và học phần.
3. Giảng viên chọn một lớp.
4. Hệ thống hiển thị thông tin và danh sách sinh viên.
5. Giảng viên thêm hoặc xóa sinh viên.
6. Hệ thống kiểm tra sinh viên và quyền giảng viên.
7. Hệ thống cập nhật danh sách ghi danh.
8. Giảng viên tải giáo trình hoặc tài liệu môn học.
9. Hệ thống kiểm tra và lưu tệp.
10. Giảng viên tạo bài đăng hoặc trò chuyện trong lớp.
11. Hệ thống lưu nội dung và thông báo cho sinh viên.
12. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Sinh viên đã thuộc lớp | 6.1 Hệ thống thông báo ghi danh đã tồn tại. |
| AF2 – Tệp không hợp lệ | 9.1 Hệ thống từ chối tệp và yêu cầu chọn lại. |
| AF3 – Không có quyền | 6.1 Hệ thống từ chối thay đổi lớp. |

### Pre-Conditions

| Title | Description |
|---|---|
| Được phân công | Giảng viên được phân công vào lớp học phần. |
| Lớp tồn tại | Lớp học phần đã được tạo. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Thành viên hoặc nội dung lớp được cập nhật. |
| Thất bại | Dữ liệu lớp không thay đổi và lỗi được hiển thị. |

### Extension Points

Xem danh sách sinh viên, chat lớp, xóa tài liệu.

- [Activity Diagram](UC12_QuanLyLop/activity.png)
- [Sequence Diagram](UC12_QuanLyLop/sequence.png)

---

## UC-14. Quản lý đề cương, CLO và Rubric

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Quản lý Đề cương và Thiết lập Rubric |
| **Use Case ID** | UC-14 |
| **Brief Description** | Quản lý CLO, Rubric, tiêu chí, trọng số, liên kết CLO và mức thể hiện. |
| **Actor(s)** | Giảng viên chính |
| **Trigger** | Giảng viên chọn học phần và nhấn **Thiết lập CLO/Rubric**. |

### Flow of Events

#### Basic Flow

1. Giảng viên chọn học phần.
2. Hệ thống hiển thị CLO và Rubric hiện có.
3. Giảng viên thêm hoặc sửa CLO.
4. Hệ thống kiểm tra mã CLO (`findByCloCode`).
5. Hệ thống lưu CLO.
6. Giảng viên tạo Rubric và nhập tiêu chí, trọng số.
7. Giảng viên liên kết từng tiêu chí với CLO.
8. Giảng viên tạo ít nhất hai mức thể hiện cho mỗi tiêu chí.
9. Giảng viên nhập mô tả và điểm số cho từng mức.
10. Hệ thống kiểm tra tổng trọng số, liên kết và số mức.
11. Hệ thống lưu Rubric và ma trận (`createRubric`, `updateMatrix`).
12. Hệ thống thông báo thành công.
13. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Mã CLO trùng | 4.1 Hệ thống yêu cầu nhập mã khác và quay lại bước 3. |
| AF2 – Trọng số khác 100% | 10.1 Hệ thống không cho lưu và quay lại bước 6. |
| AF3 – Thiếu CLO hoặc mức | 10.1 Hệ thống đánh dấu tiêu chí chưa hợp lệ và quay lại bước 7 hoặc 8. |

### Pre-Conditions

| Title | Description |
|---|---|
| Có quyền học phần | Giảng viên chính được phân công quản lý học phần. |
| Đã đăng nhập | Phiên đăng nhập còn hiệu lực. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | CLO và cấu trúc Rubric hợp lệ được lưu. |
| Thất bại | Không lưu dữ liệu không hợp lệ; dữ liệu cũ được giữ nguyên. |

### Extension Points

Gửi Rubric chờ duyệt, tạo phiên bản Rubric mới.

- [Activity Diagram](UC14_CloRubric/activity.png)
- [Sequence Diagram](UC14_CloRubric/sequence.png)

---

## UC-15. Giao bài tập

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Giao bài tập |
| **Use Case ID** | UC-15 |
| **Brief Description** | Giảng viên tạo bài tập, tải tệp, thiết lập hạn nộp và chọn Rubric chấm điểm. |
| **Actor(s)** | Giảng viên |
| **Trigger** | Giảng viên nhấn **Tạo bài tập** trong lớp học phần. |

### Flow of Events

#### Basic Flow

1. Giảng viên chọn lớp học phần.
2. Giảng viên chọn **Tạo bài tập**.
3. Hệ thống hiển thị biểu mẫu.
4. Giảng viên nhập tiêu đề, mô tả và điểm tối đa.
5. Giảng viên thiết lập thời gian mở và hạn nộp.
6. Giảng viên tải tệp đính kèm nếu có.
7. Giảng viên chọn Rubric chấm điểm.
8. Hệ thống kiểm tra dữ liệu, thời gian và Rubric.
9. Hệ thống lưu bài đánh giá (`createAssessment`).
10. Giảng viên công bố bài tập.
11. Hệ thống thông báo cho sinh viên.
12. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Hạn nộp không hợp lệ | 8.1 Hệ thống yêu cầu nhập lại thời gian. |
| AF2 – Rubric không hợp lệ | 8.1 Hệ thống yêu cầu chọn Rubric đã được phép sử dụng. |
| AF3 – Tệp lỗi | 8.1 Hệ thống từ chối tệp và quay lại bước 6. |

### Pre-Conditions

| Title | Description |
|---|---|
| Có quyền lớp | Giảng viên được phân công vào lớp học phần. |
| Rubric tồn tại | Rubric đã được tạo nếu sử dụng chấm theo Rubric. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Bài tập được lưu và sinh viên nhận được thông báo khi công bố. |
| Thất bại | Bài tập không được công bố; dữ liệu lỗi được hiển thị. |

### Extension Points

Cập nhật bài tập, xóa bài tập, lưu nháp.

- [Activity Diagram](UC15_GiaoBaiTap/activity.png)
- [Sequence Diagram](UC15_GiaoBaiTap/sequence.png)

---

## UC-16. Chấm điểm và phản hồi

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Chấm điểm và phản hồi |
| **Use Case ID** | UC-16 |
| **Brief Description** | Giảng viên chấm thông thường hoặc theo Rubric, nhập nhận xét và lưu kết quả. |
| **Actor(s)** | Giảng viên |
| **Trigger** | Giảng viên mở bài nộp và nhấn **Chấm điểm**. |

### Flow of Events

#### Basic Flow

1. Giảng viên chọn bài đánh giá.
2. Hệ thống tải danh sách sinh viên và trạng thái nộp.
3. Giảng viên chọn một bài nộp.
4. Hệ thống tải bài làm và Rubric đúng phiên bản.
5. Giảng viên chọn mức cho từng tiêu chí hoặc nhập điểm thông thường.
6. Giảng viên nhập nhận xét hoặc chọn nhận xét mẫu.
7. Giao diện hiển thị điểm tạm tính.
8. Giảng viên nhấn **Lưu kết quả**.
9. Hệ thống kiểm tra và tính lại điểm (`processGrading`).
10. Hệ thống lưu `Grade` và `RubricResult`.
11. Hệ thống thông báo lưu thành công.
12. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Thiếu tiêu chí | 9.1 Hệ thống yêu cầu chấm đủ tiêu chí và quay lại bước 5. |
| AF2 – Mức sai Rubric | 9.1 Hệ thống tải lại Rubric đúng phiên bản. |
| AF3 – Bài chưa nộp | 3.1 Hệ thống cho phép ghi nhận vắng/không nộp theo chính sách. |

### Pre-Conditions

| Title | Description |
|---|---|
| Có bài đánh giá | Bài đánh giá tồn tại và giảng viên có quyền chấm. |
| Rubric hợp lệ | Rubric đúng phiên bản được gắn với bài nếu chấm theo Rubric. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Điểm tổng, kết quả tiêu chí và phản hồi được lưu. |
| Thất bại | Điểm cũ được giữ nguyên và hệ thống hiển thị lỗi. |

### Extension Points

Chấm theo Rubric, dùng thư viện nhận xét mẫu, công bố điểm.

- [Activity Diagram](UC16_ChamDiem/activity.png)
- [Sequence Diagram](UC16_ChamDiem/sequence.png)

---

## UC-17. Quản lý đề thi trắc nghiệm

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Quản lý đề thi trắc nghiệm |
| **Use Case ID** | UC-17 |
| **Brief Description** | Giảng viên tạo, chỉnh sửa, công bố và xem lịch sử đề thi. |
| **Actor(s)** | Giảng viên |
| **Trigger** | Giảng viên chọn **Tạo đề thi**. |

### Flow of Events

#### Basic Flow

1. Giảng viên mở chức năng quản lý đề thi.
2. Hệ thống hiển thị lịch sử đề.
3. Giảng viên chọn tạo đề mới.
4. Giảng viên nhập cấu hình đề và ma trận câu hỏi.
5. Hệ thống lấy câu hỏi phù hợp từ ngân hàng.
6. Hệ thống kiểm tra số lượng và điều kiện câu hỏi.
7. Hệ thống sinh đề (`generateExamPaper`).
8. Giảng viên xem trước và chỉnh sửa đề.
9. Hệ thống lưu thay đổi (`updateExamPaper`).
10. Giảng viên công bố đề (`publishExam`).
11. Hệ thống phân công đề cho sinh viên.
12. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Thiếu câu hỏi | 6.1 Hệ thống báo số lượng thiếu theo ma trận.<br>6.2 Giảng viên điều chỉnh cấu hình hoặc bổ sung câu hỏi. |
| AF2 – Đề đã công bố | 8.1 Hệ thống hạn chế sửa các trường ảnh hưởng bài đang thi. |
| AF3 – Cấu hình sai | 6.1 Hệ thống yêu cầu sửa thời gian, số câu hoặc thang điểm. |

### Pre-Conditions

| Title | Description |
|---|---|
| Có ngân hàng câu hỏi | Kho có câu hỏi phù hợp với học phần. |
| Có quyền | Giảng viên được phân công học phần. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Đề thi được lưu và phân công khi công bố. |
| Thất bại | Không sinh/công bố đề không hợp lệ. |

### Extension Points

Sửa câu hỏi đề thi, xóa đề, xem chi tiết đề.

- [Activity Diagram](UC17_DeThi/activity.png)
- [Sequence Diagram](UC17_DeThi/sequence.png)

---

## UC-18. Quản lý ngân hàng câu hỏi

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Quản lý ngân hàng câu hỏi |
| **Use Case ID** | UC-18 |
| **Brief Description** | Quản lý kho, câu hỏi và phạm vi chia sẻ câu hỏi của học phần. |
| **Actor(s)** | Giảng viên, Trưởng bộ môn |
| **Trigger** | Người dùng chọn **Ngân hàng câu hỏi**. |

### Flow of Events

#### Basic Flow

1. Người dùng mở ngân hàng câu hỏi.
2. Hệ thống tải các kho được phép truy cập.
3. Người dùng chọn hoặc tạo kho câu hỏi (`createBank`).
4. Người dùng thêm câu hỏi thủ công hoặc import từ Excel.
5. Hệ thống kiểm tra nội dung, đáp án và cấu trúc câu hỏi.
6. Hệ thống lưu câu hỏi (`createQuestionToBank`).
7. Người dùng xem danh sách và tìm kiếm câu hỏi.
8. Người dùng sửa hoặc xóa câu hỏi.
9. Hệ thống kiểm tra quyền sở hữu.
10. Hệ thống cập nhật dữ liệu.
11. Trưởng bộ môn có thể thay đổi phạm vi chia sẻ của kho.
12. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – File import sai | 5.1 Hệ thống trả danh sách dòng lỗi và không nhập câu sai. |
| AF2 – Thiếu đáp án đúng | 5.1 Hệ thống yêu cầu hoàn thiện câu hỏi. |
| AF3 – Không có quyền | 9.1 Hệ thống từ chối sửa/xóa hoặc thay đổi chia sẻ. |

### Pre-Conditions

| Title | Description |
|---|---|
| Đã đăng nhập | Người dùng có phiên hợp lệ. |
| Có quyền kho | Người dùng sở hữu kho hoặc được cấp quyền theo bộ môn. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Kho hoặc câu hỏi được cập nhật và có thể dùng để sinh đề. |
| Thất bại | Câu hỏi không hợp lệ không được lưu. |

### Extension Points

Import Excel, chia sẻ kho trong bộ môn, sao chép câu hỏi.

- [Activity Diagram](UC18_NganHangCauHoi/activity.png)
- [Sequence Diagram](UC18_NganHangCauHoi/sequence.png)

---

## UC-30. Phê duyệt Rubric

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Phê duyệt Rubric |
| **Use Case ID** | UC-30 |
| **Brief Description** | Trưởng bộ môn xem xét Rubric và quyết định phê duyệt hoặc yêu cầu chỉnh sửa. |
| **Actor(s)** | Trưởng bộ môn |
| **Trigger** | Trưởng bộ môn chọn một Rubric đang chờ duyệt. |

### Flow of Events

#### Basic Flow

1. Trưởng bộ môn mở danh sách Rubric chờ duyệt.
2. Hệ thống tải danh sách theo bộ môn (`getRubricsForApproval`).
3. Trưởng bộ môn chọn một Rubric.
4. Hệ thống hiển thị CLO, tiêu chí, trọng số và mức thể hiện.
5. Trưởng bộ môn kiểm tra tính phù hợp.
6. Trưởng bộ môn nhập nhận xét.
7. Trưởng bộ môn chọn **Phê duyệt**.
8. Hệ thống kiểm tra quyền và trạng thái Rubric.
9. Hệ thống cập nhật trạng thái `APPROVED` (`reviewRubric`).
10. Hệ thống lưu người duyệt, thời gian và nhật ký.
11. Hệ thống thông báo cho giảng viên tạo Rubric.
12. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Yêu cầu chỉnh sửa | 7.1 Trưởng bộ môn chọn **Yêu cầu chỉnh sửa**.<br>7.2 Hệ thống lưu trạng thái và nhận xét. |
| AF2 – Rubric đã được xử lý | 8.1 Hệ thống yêu cầu tải lại trạng thái mới nhất. |
| AF3 – Không đủ quyền | 8.1 Hệ thống từ chối thao tác và ghi nhật ký. |

### Pre-Conditions

| Title | Description |
|---|---|
| Rubric chờ duyệt | Rubric có trạng thái `PENDING`. |
| Có quyền bộ môn | Người dùng là trưởng bộ môn tương ứng. |

### Post-Conditions

| Title | Description |
|---|---|
| Phê duyệt | Rubric chuyển sang `APPROVED` và có thể sử dụng. |
| Yêu cầu sửa | Rubric được trả về cùng nhận xét. |

### Extension Points

Xem lịch sử phê duyệt, xem nhật ký hoạt động.

- [Activity Diagram](UC30_DuyetRubric/activity.png)
- [Sequence Diagram](UC30_DuyetRubric/sequence.png)

---

## UC-34. Phân tích chuẩn đầu ra OBE

| Thuộc tính | Nội dung |
|---|---|
| **Name of Use Case** | Phân tích chuẩn đầu ra OBE |
| **Use Case ID** | UC-34 |
| **Brief Description** | Tổng hợp kết quả đánh giá để theo dõi mức đạt CLO của lớp và bộ môn. |
| **Actor(s)** | Trưởng bộ môn, Giảng viên |
| **Trigger** | Người dùng chọn **Phân tích chuẩn đầu ra OBE**. |

### Flow of Events

#### Basic Flow

1. Người dùng chọn học kỳ, học phần hoặc lớp học phần.
2. Hệ thống kiểm tra phạm vi dữ liệu được phép xem.
3. Hệ thống tải CLO, bài đánh giá và kết quả đã chấm.
4. Hệ thống chuẩn hóa điểm theo tiêu chí và trọng số.
5. Hệ thống ánh xạ kết quả tiêu chí về CLO.
6. Hệ thống tính tỷ lệ đạt của từng CLO.
7. Hệ thống phân loại đạt, chưa đạt hoặc chưa đủ dữ liệu.
8. Hệ thống hiển thị biểu đồ và thống kê tổng quan (`getOBEForLecturer`).
9. Người dùng chọn một CLO.
10. Hệ thống hiển thị bằng chứng chi tiết (`getCloDetail`).
11. Người dùng xuất hoặc sử dụng kết quả để cải tiến học phần.
12. Kết thúc use case.

#### Alternate Flows

| Title | Description |
|---|---|
| AF1 – Chưa đủ dữ liệu | 3.1 Hệ thống hiển thị trạng thái chưa đủ dữ liệu và các nguồn còn thiếu. |
| AF2 – Không có ánh xạ CLO | 5.1 Hệ thống loại dữ liệu khỏi phép tổng hợp và cảnh báo cấu hình. |
| AF3 – Không có quyền | 2.1 Hệ thống giới hạn hoặc từ chối phạm vi báo cáo. |

### Pre-Conditions

| Title | Description |
|---|---|
| Có kết quả chấm | Ít nhất một bài đánh giá đã được chấm và công bố. |
| Có ánh xạ CLO | Tiêu chí hoặc bài đánh giá đã liên kết CLO. |

### Post-Conditions

| Title | Description |
|---|---|
| Thành công | Báo cáo mức đạt CLO và bằng chứng chi tiết được hiển thị. |
| Thất bại | Không thay đổi dữ liệu; hệ thống thông báo phần dữ liệu còn thiếu. |

### Extension Points

Xuất báo cáo, xem xu hướng học kỳ, xem chi tiết theo sinh viên.

- [Activity Diagram](UC34_OBE/activity.png)
- [Sequence Diagram](UC34_OBE/sequence.png)

> Quy ước đánh số giảng viên: UC-12 quản lý lớp; UC-13 quản lý điểm danh; UC-14 đề cương–CLO–Rubric; UC-15 giao bài; UC-16 chấm điểm; UC-17 đề thi; UC-18 ngân hàng câu hỏi. Các chức năng phụ như nhập điểm cuối kỳ và xem thông báo có thể tiếp tục dùng UC-19 và UC-20.
