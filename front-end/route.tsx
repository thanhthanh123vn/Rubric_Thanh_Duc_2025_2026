import {createBrowserRouter, redirect} from "react-router-dom";


import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/CalendarPage";
import RegisterPage from "@/user/RegisterPage";
import ForgotPasswordPage from "@/user/ForgotPasswordPage";
import AccountManagement from "@/user/AccountManagement/AccountManagement";
import LoginPage from "@/user/login";
import CourseDetail from "@/features/course/student/components/CourseDetail";
import CourseStudentList from "@/features/course/student/components/CourseStudentList";
import CourseOBE from "@/features/course/student/components/CourseOBE";
import CourseAssignments from "@/features/course/student/components/CourseAssignments";
import CourseEvaluations from "@/features/course/student/components/CourseEvaluations";
import CourseGroups from "@/features/course/student/components/CourseGroups";
import AssignmentDetail from "@/features/course/student/components/AssignmentDetail";
import CreateGroup from "@/features/course/student/components/CreateGroup";
import TeacherLayout from "@/pages/teacher/TeacherLayout";
import TeacherOverview from "@/pages/teacher/TeacherOverview";
import TeacherCourseLayout from "@/pages/teacher/TeacherCourseLayout";
import TeacherCourseOverview from "@/pages/teacher/TeacherCourseOverview";
import TeacherCourseStudents from "@/pages/teacher/TeacherCourseStudents";
import TeacherCourseAssignments from "@/pages/teacher/TeacherCourseAssignments";
import TeacherCourseRubric from "@/pages/teacher/TeacherCourseRubric";
import TeacherCourseOBE from "@/pages/teacher/TeacherCourseOBE";
import TeacherCourseGroups from "@/pages/teacher/TeacherCourseGroups";
import TeacherCourses from "@/pages/teacher/TeacherCourses";
import TeacherAssessmentList from "@/pages/teacher/TeacherAssessmentList.tsx";
import CreateQrAttendancePage from "@/pages/teacher/CreateQrAttendancePage";
import TeacherReport from "@/pages/teacher/TeacherReport";
import TeacherRubric from "@/pages/teacher/TeacherRubric";
import TeacherQuestionBank from "@/pages/teacher/TeacherQuestionBank";
import PublicQuestionBank from "@/pages/teacher/PublicQuestionBank";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/managerUser/UserManagement";
import AdminCreateUser from "@/pages/admin/managerUser/AdminCreateUser";
import LecturerManagement from "@/pages/admin/managerUser/LecturerManagement.tsx";
import CourseManagement from "@/pages/admin/managarCourse/CourseManagement.tsx";
import ListStudent from "@/pages/admin/managerUser/StudentManagement"
import AdminManagement from "@/pages/admin/managerUser/AdminManagement.tsx";
import AssessmentManagement from "@/pages/admin/managarCourse/AssessmentManagement.tsx";
import TeacherOBEDetail from "@/pages/teacher/TeacherOBEDetail.tsx";
import TeacherOBEAnalytics from "@/pages/teacher/TeacherOBEAnalytics.tsx";
import AssignmentDetailPost from "@/features/course/student/components/AssignmentDetailPost.tsx";
import MainLecturerLayout from "@/pages/mainlecturer/MainLecturerLayout.tsx";
import MainLecturerOverview from "@/pages/mainlecturer/MainLecturerOverview.tsx";
import CLOManagement from "@/pages/mainlecturer/CLOManagement.tsx";
import CLODetail from "@/pages/mainlecturer/CLODetail.tsx";
import RubricBuilder from "@/pages/mainlecturer/RubricBuilder.tsx";
import RubricDetail from "@/pages/mainlecturer/RubricDetail.tsx";
import RubricMatrix from "@/pages/mainlecturer/RubricMatrix.tsx";
import SemesterManagement from "@/pages/mainlecturer/SemesterManagement.tsx";
import CourseAssignment from "@/pages/mainlecturer/CourseAssignment.tsx";
import TeacherRubricDetail from "@/pages/teacher/TeacherRubricDetail.tsx";
import TeacherGrading from "@/pages/teacher/TeacherGrading.tsx";
import CourseList from "@/pages/teacher/BankQuestions.tsx";
import StudentCourseMaterials from "@/features/course/student/components/StudentCourseMaterials.tsx";
import MaterialDetail from "@/features/course/student/components/MaterialDetail.tsx";
import CourseOfferingManagement from "@/pages/admin/managarCourse/CourseOfferingManagement.tsx";
import DeanLayout from "@/pages/dean/DeanLayout.tsx";
import DeanDashboard from "@/pages/dean/DeanDashboard.tsx";
import RoleProtectedRoute from "@/components/RoleProtectedRoute.tsx";
import RubricApproval from "@/pages/dean/RubricApproval.tsx";
import FacultyReport from "@/pages/dean/FacultyReport.tsx";
import DepartmentHeadLayout from "@/pages/department/DepartmentHeadLayout.tsx";
import DepartmentDashboard from "@/pages/department/DepartmentDashboard.tsx";
import QuestionBankManagement from "@/pages/department/QuestionBankManagement.tsx";
import QuestionFormPage from "@/pages/department/QuestionFormPage.tsx";
import ListQuestionBank from "@/pages/department/ListQuestionBank.tsx";
import AssessmentDetailAdmin from "@/pages/admin/managarCourse/AssessmentDetailAdmin.tsx";
import DepartmentOBE from "@/pages/department/DepartmentOBE.tsx";

import AdminLayout from "@/pages/admin/AdminLayout.tsx";
import FacultyManagement from "@/pages/admin/departments/FacultyManagement.tsx";
import SubjectManagement from "@/pages/admin/departments/SubjectManagement.tsx";
import SyllabusManager from "@/pages/admin/managarCourse/SyllabusManager.tsx";
import CourseContentManager from "@/pages/admin/managarCourse/CourseContentManager.tsx";
import CourseAssignmentsManager from "@/pages/admin/managarCourse/CourseAssignmentsManager.tsx";
import CreateExamPage from "@/pages/teacher/CreateExamPage.tsx";
import TeacherProjects from "@/pages/teacher/TeacherProjects.tsx";
import TeacherExamList from "@/pages/teacher/TeacherExamList.tsx";
import StudentExamListPage from "@/features/course/student/components/StudentExamListPage.tsx";
import LecturerExamDetailPage from "@/pages/teacher/LecturerExamDetailPage.tsx";
import StudentTakeExamPage from "@/features/course/student/components/StudentTakeExamPage.tsx";

export const router = createBrowserRouter([

    {
        path: "/",

        loader: () => redirect("/login"),
    },
    {
        path: "/dashboard",
        Component: Dashboard,
    },
    {
        path: "/calendar",
        Component: CalendarPage,
    },
    {
        path: "/course/:id",
        Component: CourseDetail,
    },
    {
        path: "/course/:id/students",
        Component: CourseStudentList,
    },
    {
        path: "/course/:id/obe",
        Component: CourseOBE,
    },
    {
        path: "/course/:id/assignments",
        Component: CourseAssignments,
    },
    {
        path: "/course/:id/document",
        Component: StudentCourseMaterials,
    },
    {


        path: "/course/:id/my-exams",
        Component: StudentExamListPage,
    },
    {
        path: "/course/:id/document/materials/:postId",
        Component: MaterialDetail,
    },
    {
        path: "/course/:id/evaluations",
        Component: CourseEvaluations,
    },
    {
        path: "/course/:id/groups",
        Component: CourseGroups,
    },

    {
        path: "/course/:id/assignments/:assignmentId",
        Component: AssignmentDetailPost,
    },
    {
        path: "/course/:id/createGroup",
        Component: CreateGroup
    },
    {
        path: "/course/:id/my-exams/:examId",
        Component: StudentTakeExamPage,
    },
    {
        path: "/login",
        Component: LoginPage,
    },
    {
        path: "/register",
        Component: RegisterPage,
    },
    {
        path: "/forgot-password",
        Component: ForgotPasswordPage,
    },
    {
        path: "/profile",
        Component: AccountManagement,
    },
    {
        path: "/teacher",
        Component: TeacherLayout,
        children: [
            { index: true, Component: TeacherOverview },
            { path: "courses", loader: () => redirect("/teacher") },
            {
                path: "course/:id",
                Component: TeacherCourseLayout,
                children: [





                    { index: true, Component: TeacherCourseOverview },
                    { path: "students", Component: TeacherCourseStudents },
                    { path: "assignments", Component: TeacherCourseAssignments },
                    {
                        path: "exams",
                        children: [
                            {
                                index: true,
                                loader: () => redirect("exam-list"),
                            },
                            {
                                path: "create-exam",
                                Component: CreateExamPage,
                            },
                            {
                                path: "exam-list",
                                Component: TeacherExamList,
                            },
                            {
                                path: "view-exam-list/:examId",
                                Component: LecturerExamDetailPage,
                            },
                            // {
                            //     path: "grading-final",
                            //     Component: FinalGradePage,
                            // },
                        ],
                    },


                    {
                        path: "assessment/:assessmentId/submissions",
                        loader: async ({ params }) =>
                            redirect(`/teacher/course/${params.id}/assessment/${params.assessmentId}/grading`),
                    },
                    { path: "rubric", Component: TeacherCourseRubric },
                    { path: "rubric/:id", Component: TeacherRubricDetail },
                    { path: "questions/bank/:bankId", Component: TeacherQuestionBank },
                    { path: "obe", Component: TeacherCourseOBE },
                    { path: "obe/analytics", Component: TeacherOBEAnalytics },
                    { path: "obe/:cloId", Component: TeacherOBEDetail },
                    { path: "groups", Component: TeacherCourseGroups },
                    { path: "grading", Component: TeacherAssessmentList },
                    { path: "assessment/:assessmentId/grading", Component: TeacherGrading },
                    {
                        path: "projects",
                        loader: async ({ params }) => redirect(`/teacher/course/${params.id}/groups`),
                    },
                    { path: "attendance", Component: CreateQrAttendancePage },
                    { path: "report", Component: TeacherReport },

                ],
            },

            {path: "course", Component: TeacherCourses},
            {path: "questions", Component: CourseList},
            {path: "questions/public/:bankId", Component: PublicQuestionBank},
            {path: "rubric", Component: TeacherRubric},
            {path: "rubric/:id", Component: TeacherRubricDetail},

        ],
    },
    {
        path: "/mainlecturer",
        Component: MainLecturerLayout,
        children: [
            {index: true, Component: MainLecturerOverview},
            {path: "clo", Component: CLOManagement},
            {path: "clo/:cloId", Component: CLODetail},
            {path: "rubric", Component: RubricBuilder},
            {path: "rubric/:rubricId", Component: RubricDetail},

            {path: "rubric-matrix", Component: RubricMatrix},
            {path: "semester", Component: SemesterManagement},
            {path: "assign", Component: CourseAssignment},
        ],
    },


    {
        path: "/admin",
        element: <RoleProtectedRoute allowedRoles={["ADMIN"]} />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    {index: true, Component: AdminDashboard},
                    {
                        path: "users/list-users",
                        Component: UserManagement,
                    },
                    {path: "users/create-user", Component: AdminCreateUser},
                    {path: "users/list-students", Component: ListStudent},
                    {path: "users/list-lecturers", Component: LecturerManagement},

                    { path: "departments/list", Component: FacultyManagement },
                    { path: "departments/subjects", Component: SubjectManagement },

                    {path: "rubrics/list", Component: TeacherCourseRubric},
                    {path: "rubrics/list/:id", Component: TeacherRubricDetail},
                    {path: "rubrics-matrix", Component: RubricMatrix},
                    {path: "users/list-admins", Component: AdminManagement},
                    {path: "syllabus", Component: SyllabusManager},

                    {path: "assignments/list", Component: CourseContentManager},
                    {path: "assignments/list/:id/courseOffering-assignment", Component: CourseAssignmentsManager},
                    {path: "courses/list", Component: CourseManagement},

                    {path: "courses/assessments", Component: AssessmentManagement},

                    {path: "classes/list", Component: CourseOfferingManagement},
                ],
            },
        ],

    },
    {
        path: "/dean",
        Component: DeanLayout,
        children: [
            {index: true, Component: DeanDashboard},
            {path: "rubrics", Component: RubricApproval},
            {path: "reports", Component: FacultyReport},
            {path: "courses", Component: CourseManagement},
        ],
    },

    {
        path: "/department",
        Component: DepartmentHeadLayout,
        children: [
            {index: true, Component: DepartmentDashboard},
            {path: "rubrics", Component: RubricApproval},
            {path: "clo", Component: CLOManagement},
            {path: "obe", Component: DepartmentOBE},
            {path: "obe/:id/analytics", Component: TeacherOBEAnalytics},
            {path: "question-banks", Component: QuestionBankManagement},
            {path: "question-banks/:id/form-question/:bankId", Component: TeacherQuestionBank},
            {path: "questions/public/:id", Component: ListQuestionBank},
            {path: "assessments", Component: AssessmentManagement},
            {path: "assessments/:id", Component: AssessmentDetailAdmin},
            {path: "offerings", Component: CourseOfferingManagement},
        ],
    },
]);
