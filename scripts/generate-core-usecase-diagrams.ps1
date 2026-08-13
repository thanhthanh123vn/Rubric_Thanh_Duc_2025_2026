$ErrorActionPreference = "Stop"
$root = Join-Path (Resolve-Path '.').Path 'docs\core-use-cases'

$items = @(
    @{
        Slug = 'UC03_XemRubric'
        Activity = @'
@startuml
title UC-03 Xem đánh giá Rubric
|Sinh viên|
start
:Mở học phần và chọn đánh giá Rubric;
|Hệ thống|
:Kiểm tra sinh viên thuộc lớp;
if (Được phép truy cập?) then (Có)
  :Tải bài đánh giá và Rubric;
  |Sinh viên|
  :Chọn loại đánh giá;
  |Hệ thống|
  :Tải điểm và phản hồi;
  if (Đã có kết quả?) then (Có)
    :Hiển thị mức đạt, điểm và nhận xét;
  else (Không)
    :Hiển thị Rubric và trạng thái chưa chấm;
  endif
else (Không)
  :Từ chối truy cập;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-03 Xem đánh giá Rubric
actor "Sinh viên" as SV
boundary "RubricResultPage" as UI
control "RubricController" as RC
control "RubricService" as RS
control "GradingController" as GC
control "GradingService" as GS
database "Rubric / Grade Repository" as DB
SV -> UI : Chọn bài đánh giá
UI -> RC : getRubricMatrixDetail(rubricId)
RC -> RS : getRubricMatrixDetail(rubricId)
RS -> DB : findRubricWithCriteria(rubricId)
DB --> UI : RubricMatrixResponse
UI -> GC : getGradeByStudentAndAssessment(studentId, assessmentId)
GC -> GS : getGradeByStudentAndAssessmentId(...)
GS -> DB : findGrade(...)
alt Đã có kết quả
  DB --> UI : Grade và RubricResult
  UI --> SV : Hiển thị điểm và phản hồi
else Chưa chấm
  DB --> UI : Không có Grade
  UI --> SV : Hiển thị Rubric, trạng thái chờ
end
@enduml
'@
    },
    @{
        Slug = 'UC07_DiemDanh'
        Activity = @'
@startuml
title UC-07 Điểm danh bằng QR và GPS
|Giảng viên|
start
:Nhập thời gian, tọa độ và bán kính;
|Hệ thống|
:Tạo phiên, token và mã QR;
|Sinh viên|
:Quét QR và cho phép GPS;
|Hệ thống|
:Kiểm tra lớp, token và thời gian;
if (Phiên hợp lệ?) then (Có)
  :Kiểm tra lượt trùng và khoảng cách;
  if (Đủ điều kiện?) then (Có)
    :Lưu trạng thái có mặt;
    :Thông báo thành công;
  else (Không)
    :Từ chối và hiển thị lý do;
  endif
else (Không)
  :Thông báo QR hết hạn;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-07 Điểm danh bằng QR và GPS
actor "Giảng viên" as GV
actor "Sinh viên" as SV
boundary "AttendancePage" as UI
control "AttendanceSessionController" as AC
control "AttendanceSessionService" as AS
control "StudentAttendanceController" as SC
control "StudentAttendanceService" as SS
database "AttendanceRepository" as DB
GV -> UI : Tạo phiên điểm danh
UI -> AC : createAttendanceSession(request)
AC -> AS : createAttendanceSession(request)
AS -> DB : save(session)
DB --> UI : QR và thời hạn
SV -> UI : Quét QR và gửi GPS
UI -> SC : checkIn(request, studentId)
SC -> SS : checkIn(studentId, request)
SS -> DB : findSessionByToken(token)
SS -> SS : validateTimeAndDistance(location)
alt Không hợp lệ
  SS --> UI : AttendanceException
else Hợp lệ
  SS -> DB : save(attendance)
  DB --> UI : AttendanceCheckInResponse
  UI --> SV : Điểm danh thành công
end
@enduml
'@
    },
    @{
        Slug = 'UC08_NopBai'
        Activity = @'
@startuml
title UC-08 Nộp bài và xem phản hồi
|Sinh viên|
start
:Mở bài tập và xem yêu cầu;
:Chọn tệp bài làm;
:Nhấn Nộp bài;
|Hệ thống|
:Kiểm tra lớp, hạn nộp và tệp;
if (Bài nộp hợp lệ?) then (Có)
  :Lưu bài và thời gian nộp;
  :Gửi xác nhận;
  |Sinh viên|
  :Chọn Xem kết quả;
  |Hệ thống|
  if (Điểm đã công bố?) then (Có)
    :Hiển thị điểm và phản hồi;
  else (Không)
    :Hiển thị trạng thái chờ chấm;
  endif
else (Không)
  :Thông báo lỗi bài nộp;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-08 Nộp bài và xem phản hồi
actor "Sinh viên" as SV
boundary "AssessmentPage" as UI
control "AssessmentController" as AC
control "AssessmentService" as AS
control "GradingController" as GC
control "GradingService" as GS
database "Submission / Grade Repository" as DB
SV -> UI : Chọn tệp và nhấn Nộp bài
UI -> AC : submitAssignment(assessmentId, studentId, files)
AC -> AS : submitAssignment(...)
AS -> AS : validateDeadlineAndFiles(...)
alt Bài không hợp lệ
  AS --> UI : SubmissionException
else Hợp lệ
  AS -> DB : save(submission)
  DB --> UI : SubmissionResponse
end
SV -> UI : Xem kết quả
UI -> GC : getGradeByStudentAndAssessment(...)
GC -> GS : getGradeByStudentAndAssessmentId(...)
GS -> DB : findGrade(...)
DB --> UI : Điểm và phản hồi
UI --> SV : Hiển thị kết quả
@enduml
'@
    },
    @{
        Slug = 'UC09_ThiTrucTuyen'
        Activity = @'
@startuml
title UC-09 Làm bài thi trực tuyến
|Sinh viên|
start
:Chọn đề thi và nhấn Bắt đầu;
|Hệ thống|
:Kiểm tra phân công và thời gian;
if (Được phép thi?) then (Có)
  :Tải câu hỏi;
  |Sinh viên|
  :Chọn đáp án;
  |Hệ thống|
  :Lưu tạm tiến độ;
  |Sinh viên|
  :Nhấn Nộp bài;
  |Hệ thống|
  :Khóa bài và chấm đáp án;
  :Lưu kết quả;
  :Hiển thị xác nhận;
else (Không)
  :Thông báo ngoài thời gian hoặc đã nộp;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-09 Làm bài thi trực tuyến
actor "Sinh viên" as SV
boundary "ExamPage" as UI
control "AssessmentPaperController" as PC
control "AssessmentPaperService" as PS
control "StudentExamController" as EC
control "StudentExamService" as ES
database "ExamRepository" as DB
SV -> UI : Mở danh sách đề thi
UI -> PC : getStudentAssignedExams(studentId, offeringId)
PC -> PS : getAssignedExamsForStudent(...)
PS -> DB : findAssignedExams(...)
DB --> UI : Danh sách đề
SV -> UI : Gửi đáp án
UI -> EC : submitExam(studentId, request)
EC -> ES : submitExam(studentId, request)
ES -> ES : validateAndScore(request)
alt Không hợp lệ
  ES --> UI : ExamException
else Hợp lệ
  ES -> DB : save(result)
  DB --> UI : SubmitStudentExamResponse
  UI --> SV : Xác nhận và kết quả
end
@enduml
'@
    },
    @{
        Slug = 'UC10_NhomTask'
        Activity = @'
@startuml
title UC-10 Quản lý nhóm và nhiệm vụ
|Sinh viên / Trưởng nhóm|
start
:Mở nhóm học tập;
|Hệ thống|
:Tải thành viên và nhiệm vụ;
|Trưởng nhóm|
:Quản lý thành viên hoặc giao nhiệm vụ;
|Hệ thống|
:Kiểm tra quyền và dữ liệu;
if (Hợp lệ?) then (Có)
  :Lưu thay đổi nhóm;
  |Thành viên|
  :Cập nhật nhiệm vụ hoặc gửi tin nhắn;
  |Hệ thống|
  :Lưu trạng thái và phát tin nhắn;
else (Không)
  :Thông báo lỗi quyền hoặc dữ liệu;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-10 Quản lý nhóm và nhiệm vụ
actor "Trưởng nhóm" as Leader
boundary "GroupPage" as UI
control "GroupController" as GC
control "GroupService" as GS
control "GroupTaskController" as TC
control "GroupTaskService" as TS
control "ChatController" as CC
database "GroupRepository" as DB
Leader -> UI : Thêm thành viên
UI -> GC : addMember(groupId, request)
GC -> GS : addMember(groupId, memberId, requesterId)
GS -> DB : save(groupMember)
Leader -> UI : Giao nhiệm vụ
UI -> TC : createTask(request, userId)
TC -> TS : createTask(request, userId)
TS -> DB : save(task)
Leader -> UI : Gửi tin nhắn
UI -> CC : sendMessage(conversationId, request)
CC -> DB : save(message)
DB --> UI : Cập nhật thành công
@enduml
'@
    },
    @{
        Slug = 'UC12_QuanLyLop'
        Activity = @'
@startuml
title UC-12 Quản lý lớp học
|Giảng viên|
start
:Chọn lớp được phân công;
|Hệ thống|
:Hiển thị thông tin và sinh viên;
|Giảng viên|
:Thêm hoặc xóa sinh viên;
|Hệ thống|
:Kiểm tra quyền và ghi danh;
if (Hợp lệ?) then (Có)
  :Cập nhật thành viên lớp;
  |Giảng viên|
  :Tải giáo trình hoặc tạo bài đăng;
  |Hệ thống|
  :Kiểm tra và lưu nội dung;
  :Thông báo cho sinh viên;
else (Không)
  :Thông báo lỗi;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-12 Quản lý lớp học
actor "Giảng viên" as GV
boundary "CourseManagementPage" as UI
control "CourseController" as CC
control "CourseService" as CS
control "SyllabusController" as SC
control "PostController" as PC
database "CourseRepository" as DB
GV -> UI : Chọn lớp học phần
UI -> CC : getStudentsByOffering(offeringId)
CC -> CS : getStudentsByOfferingId(offeringId)
CS -> DB : findEnrollments(offeringId)
DB --> UI : Danh sách sinh viên
GV -> UI : Thêm sinh viên
UI -> CC : enroll(studentId, offeringId)
CC -> CS : enroll(studentId, offeringId)
CS -> DB : save(enrollment)
GV -> UI : Tải giáo trình hoặc tạo bài đăng
UI -> SC : uploadSyllabus(courseId, files)
UI -> PC : createPost(request, authorId)
PC -> DB : save(post)
DB --> UI : Cập nhật thành công
@enduml
'@
    },
    @{
        Slug = 'UC14_CloRubric'
        Activity = @'
@startuml
title UC-14 Quản lý đề cương, CLO và Rubric
|Giảng viên chính|
start
:Chọn học phần;
|Hệ thống|
:Hiển thị CLO và Rubric hiện có;
|Giảng viên chính|
:Thêm hoặc sửa CLO;
|Hệ thống|
:Kiểm tra mã CLO;
if (Mã bị trùng?) then (Có)
  :Yêu cầu đổi mã;
else (Không)
  :Lưu CLO;
  |Giảng viên chính|
  :Nhập Rubric, tiêu chí, CLO và mức;
  |Hệ thống|
  :Kiểm tra trọng số và cấu trúc;
  if (Rubric hợp lệ?) then (Có)
    :Lưu Rubric và ma trận;
    :Thông báo thành công;
  else (Không)
    :Hiển thị dữ liệu cần sửa;
  endif
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-14 Quản lý đề cương, CLO và Rubric
actor "Giảng viên chính" as GV
boundary "RubricPage" as UI
control "CourseCloController" as CC
control "CourseCloService" as CS
control "RubricController" as RC
control "RubricService" as RS
control "RubricMatrixService" as MS
database "RubricRepository" as DB
GV -> UI : Nhập CLO
UI -> CC : createCourseClo(request)
CC -> CS : createClo(request)
CS -> DB : findByCloCode(code)
alt Mã CLO trùng
  DB --> UI : Thông báo lỗi
else Hợp lệ
  CS -> DB : save(clo)
end
GV -> UI : Nhập Rubric và ma trận
UI -> RC : createRubric(lecturerId, request)
RC -> RS : createRubric(lecturerId, request)
RS -> DB : save(rubric, criteria)
UI -> MS : updateMatrix(request)
MS -> DB : save(rubric, criteria, levels)
DB --> UI : Lưu thành công
@enduml
'@
    },
    @{
        Slug = 'UC15_GiaoBaiTap'
        Activity = @'
@startuml
title UC-15 Giao bài tập
|Giảng viên|
start
:Chọn lớp và tạo bài tập;
:Nhập nội dung, hạn nộp và tệp;
:Chọn Rubric chấm điểm;
|Hệ thống|
:Kiểm tra dữ liệu, thời gian và Rubric;
if (Hợp lệ?) then (Có)
  :Lưu bài đánh giá;
  |Giảng viên|
  :Nhấn Công bố;
  |Hệ thống|
  :Cập nhật trạng thái;
  :Thông báo cho sinh viên;
else (Không)
  :Hiển thị trường cần sửa;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-15 Giao bài tập
actor "Giảng viên" as GV
boundary "AssessmentEditor" as UI
control "AssessmentController" as C
control "AssessmentService" as S
participant "RubricClient" as RC
participant "NotificationClient" as NC
database "AssessmentRepository" as DB
GV -> UI : Nhập bài tập và hạn nộp
GV -> UI : Chọn Rubric
UI -> C : createAssessment(userId, request, files)
C -> S : createAssessment(userId, request, files)
S -> S : validateScheduleAndFiles(request)
S -> RC : getRubric(rubricId)
alt Dữ liệu không hợp lệ
  S --> UI : ValidationException
else Hợp lệ
  S -> DB : save(assessment)
  S -> NC : notifyStudents(assessmentId)
  DB --> UI : AssessmentLecturerResponse
  UI --> GV : Tạo bài tập thành công
end
@enduml
'@
    },
    @{
        Slug = 'UC16_ChamDiem'
        Activity = @'
@startuml
title UC-16 Chấm điểm và phản hồi
|Giảng viên|
start
:Chọn bài nộp;
|Hệ thống|
:Tải bài làm và Rubric;
|Giảng viên|
:Chọn mức hoặc nhập điểm;
:Nhập nhận xét và nhấn Lưu;
|Hệ thống|
:Kiểm tra các tiêu chí;
if (Kết quả hợp lệ?) then (Có)
  :Tính lại điểm;
  :Lưu Grade và RubricResult;
  :Thông báo thành công;
else (Không)
  :Hiển thị tiêu chí cần sửa;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-16 Chấm điểm và phản hồi
actor "Giảng viên" as GV
boundary "GradingPage" as UI
control "GradingController" as C
control "GradingService" as S
participant "RubricClient" as RC
database "GradeRepository" as DB
GV -> UI : Chọn mức và nhập phản hồi
UI -> C : submitGrade(request)
C -> S : processGrading(request)
S -> RC : getRubric(rubricId)
S -> S : validateAndCalculate(request, rubric)
alt Thiếu hoặc sai tiêu chí
  S --> UI : ValidationException
else Hợp lệ
  S -> DB : save(grade, rubricResults)
  DB --> S : Grade
  S --> UI : Lưu thành công
  UI --> GV : Hiển thị kết quả
end
@enduml
'@
    },
    @{
        Slug = 'UC17_DeThi'
        Activity = @'
@startuml
title UC-17 Quản lý đề thi trắc nghiệm
|Giảng viên|
start
:Nhập cấu hình và ma trận đề;
|Hệ thống|
:Tìm câu hỏi phù hợp;
if (Đủ câu hỏi?) then (Có)
  :Sinh đề thi;
  |Giảng viên|
  :Xem trước và chỉnh sửa;
  :Nhấn Công bố;
  |Hệ thống|
  :Lưu và phân công đề;
else (Không)
  :Báo số câu hỏi còn thiếu;
  |Giảng viên|
  :Điều chỉnh ma trận hoặc bổ sung câu hỏi;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-17 Quản lý đề thi trắc nghiệm
actor "Giảng viên" as GV
boundary "ExamPaperPage" as UI
control "AssessmentPaperController" as C
control "AssessmentPaperService" as S
database "QuestionRepository" as QR
database "AssessmentPaperRepository" as PR
GV -> UI : Nhập ma trận đề
UI -> C : generateExamPaper(userId, request)
C -> S : generateExamQuestions(userId, request)
S -> QR : findEligibleQuestions(matrix)
alt Không đủ câu hỏi
  QR --> UI : Báo số lượng thiếu
else Đủ câu hỏi
  S -> PR : save(assessmentPaper)
  PR --> UI : Danh sách câu hỏi đề
  GV -> UI : Chỉnh sửa và công bố
  UI -> C : updateExamPaper(id, request)
  UI -> C : publishExam(id)
  C -> S : publishExam(id)
  S -> PR : updateStatus(PUBLISHED)
end
@enduml
'@
    },
    @{
        Slug = 'UC18_NganHangCauHoi'
        Activity = @'
@startuml
title UC-18 Quản lý ngân hàng câu hỏi
|Giảng viên / Trưởng bộ môn|
start
:Mở hoặc tạo kho câu hỏi;
:Thêm câu hỏi hoặc chọn Import Excel;
|Hệ thống|
:Kiểm tra cấu trúc, nội dung và đáp án;
if (Câu hỏi hợp lệ?) then (Có)
  :Lưu kho và câu hỏi;
  |Giảng viên / Trưởng bộ môn|
  :Sửa, xóa hoặc thay đổi chia sẻ;
  |Hệ thống|
  :Kiểm tra quyền và cập nhật;
else (Không)
  :Hiển thị danh sách lỗi;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-18 Quản lý ngân hàng câu hỏi
actor "Giảng viên" as GV
boundary "QuestionBankPage" as UI
control "QuestionBankController" as BC
control "QuestionBankService" as BS
control "QuestionController" as QC
database "QuestionBankRepository" as DB
GV -> UI : Tạo kho câu hỏi
UI -> BC : createBank(request, userId)
BC -> BS : createQuestionBank(request, userId)
BS -> DB : save(questionBank)
GV -> UI : Thêm hoặc import câu hỏi
UI -> QC : createQuestionToBank(request) / importQuestionsToBank(file)
QC -> QC : validateQuestionData(...)
alt Dữ liệu không hợp lệ
  QC --> UI : Danh sách lỗi
else Hợp lệ
  QC -> DB : saveAll(questions)
  DB --> UI : Danh sách câu hỏi
  UI --> GV : Cập nhật thành công
end
@enduml
'@
    },
    @{
        Slug = 'UC30_DuyetRubric'
        Activity = @'
@startuml
title UC-30 Phê duyệt Rubric
|Trưởng bộ môn|
start
:Mở danh sách Rubric chờ duyệt;
|Hệ thống|
:Tải Rubric theo bộ môn;
|Trưởng bộ môn|
:Xem CLO, tiêu chí, mức và trọng số;
:Nhập nhận xét;
if (Đồng ý phê duyệt?) then (Có)
  :Chọn Phê duyệt;
  |Hệ thống|
  :Cập nhật trạng thái APPROVED;
else (Không)
  :Chọn Yêu cầu chỉnh sửa;
  |Hệ thống|
  :Lưu nhận xét và trạng thái trả về;
endif
:Ghi nhật ký và gửi thông báo;
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-30 Phê duyệt Rubric
actor "Trưởng bộ môn" as TBM
boundary "RubricApprovalPage" as UI
control "RubricController" as C
control "RubricService" as S
participant "NotificationClient" as NC
database "RubricRepository" as DB
TBM -> UI : Mở Rubric chờ duyệt
UI -> C : getRubricsForApproval(userId, PENDING)
C -> S : getRubricsForApproval(userId, PENDING)
S -> DB : findPendingByDepartment(...)
DB --> UI : Danh sách Rubric
TBM -> UI : Phê duyệt hoặc yêu cầu sửa
UI -> C : reviewRubric(id, request)
C -> S : reviewRubric(id, reviewerId, request)
S -> DB : findById(id)
alt Trạng thái hoặc quyền không hợp lệ
  S --> UI : ApprovalException
else Hợp lệ
  S -> DB : save(rubricStatus, review)
  S -> NC : notifyCreator(rubricId, status)
  DB --> UI : Rubric đã cập nhật
end
@enduml
'@
    },
    @{
        Slug = 'UC34_OBE'
        Activity = @'
@startuml
title UC-34 Phân tích chuẩn đầu ra OBE
|Trưởng bộ môn / Giảng viên|
start
:Chọn học kỳ, học phần hoặc lớp;
|Hệ thống|
:Kiểm tra phạm vi truy cập;
:Tải CLO và kết quả đã chấm;
if (Đủ dữ liệu và ánh xạ?) then (Có)
  :Chuẩn hóa điểm và ánh xạ về CLO;
  :Tính tỷ lệ đạt từng CLO;
  :Hiển thị biểu đồ và thống kê;
  |Trưởng bộ môn / Giảng viên|
  :Chọn CLO cần xem chi tiết;
  |Hệ thống|
  :Hiển thị bằng chứng đánh giá;
else (Không)
  :Hiển thị dữ liệu hoặc ánh xạ còn thiếu;
endif
stop
@enduml
'@
        Sequence = @'
@startuml
autonumber
title UC-34 Phân tích chuẩn đầu ra OBE
actor "Trưởng bộ môn" as TBM
boundary "OBEDashboard" as UI
control "OBEController" as C
control "OBEService" as S
participant "GradingClient" as GC
participant "RubricClient" as RC
database "CourseRepository" as DB
TBM -> UI : Chọn học kỳ và lớp học phần
UI -> C : getOBEForLecturer(offeringId)
C -> S : getOBEForLecturer(offeringId)
S -> GC : getGradesByAssessments(assessmentIds)
S -> RC : getRubricMatrices()
S -> S : aggregateCloAttainment(...)
alt Chưa đủ dữ liệu hoặc ánh xạ
  S --> UI : Trạng thái chưa đủ dữ liệu
else Đủ dữ liệu
  S --> UI : OBELecturerProcessResponse
  TBM -> UI : Chọn một CLO
  UI -> C : getCloDetail(offeringId, cloId)
  C -> S : getCloDetail(offeringId, cloId)
  S -> DB : loadCloEvidence(...)
  DB --> UI : OBECloDetailResponse
end
@enduml
'@
    }
)

$utf8NoBom = [Text.UTF8Encoding]::new($false)
foreach ($item in $items) {
    $dir = Join-Path $root $item.Slug
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    [IO.File]::WriteAllText((Join-Path $dir 'activity.puml'), $item.Activity.Trim() + "`n", $utf8NoBom)
    [IO.File]::WriteAllText((Join-Path $dir 'sequence.puml'), $item.Sequence.Trim() + "`n", $utf8NoBom)
}

Write-Output ("Generated PlantUML files: " + ($items.Count * 2))
