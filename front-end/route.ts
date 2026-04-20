import {createBrowserRouter, redirect} from "react-router-dom";


import Dashboard from "@/pages/Dashboard";
import RegisterPage from "@/user/RegisterPage";
import ForgotPasswordPage from "@/user/ForgotPasswordPage";
import AccountManagement from "@/user/AccountManagement/AccountManagement";
import LoginPage from "@/user/login";
import CourseDetail from "@/features/course/student/components/CourseDetail";
import CourseStudentList from "@/features/course/student/components/CourseStudentList";
import CourseOBE from "@/features/course/student/components/CourseOBE";
import CourseAssignments from "@/features/course/student/components/CourseAssignments";
import CourseGroups from "@/features/course/student/components/CourseGroups";
import AssignmentDetail from "@/features/course/student/components/AssignmentDetail";
import CreateGroup from "@/features/course/student/components/CreateGroup";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLayout from "@/pages/admin/AdminLayout";
import UserManagement from "@/pages/admin/managerUser/UserManagement";
import AdminCreateUser from "@/pages/admin/managerUser/AdminCreateUser";
import ListStudent from "@/pages/admin/managerUser/StudentManagement"

export const router = createBrowserRouter([

    {
        path: "/",

        loader: () => redirect("/dashboard"),
    },
    {
        path: "/dashboard",
        Component: Dashboard,
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
        path: "/course/:id/groups",
        Component: CourseGroups,
    },
    {
        path: "/course/:id/assignments/:assignmentId",
        Component: AssignmentDetail,
    },
    {
        path: "/course/:id/createGroup",
        Component: CreateGroup
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
        path: "/admin",
        Component: AdminLayout,
        children: [

            { index: true, Component: AdminDashboard },
            {
                path: "users/list-users",
                Component: UserManagement,
            },
            // Các module khác sau này:
            { path: "users/create-user", Component: AdminCreateUser },
            { path: "users/list-students", Component: ListStudent },
        ],
    }
]);
