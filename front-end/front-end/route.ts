import { createBrowserRouter, redirect } from "react-router-dom";


import Dashboard from "@/pages/Dashboard";
import RegisterPage from "@/user/RegisterPage";
import ForgotPasswordPage from "@/user/ForgotPasswordPage";
import AccountManagement from "@/user/AccountManagement/AccountManagement";
import LoginPage from "@/user/login";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLayout from "@/pages/admin/AdminLayout";
import UserManagement from "@/pages/admin/UserManagement";

export const router = createBrowserRouter([

    {
        path: "/",

        loader: () => redirect("/dashboard"),
    },
    {
        path: "/dashboard",
        Component: Dashboard,
    },
    // {
    //     path: "/course/:id",
    //     Component: CourseDetail,
    // },
    // {
    //     path: "/course/:id/students",
    //     Component: CourseStudentList,
    // },
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
                path: "users",
                Component: UserManagement,
            },
            // Các module khác sau này:
            // { path: "courses", Component: CourseManagement },
            // { path: "rubrics", Component: RubricManagement },
        ],
    }
]);