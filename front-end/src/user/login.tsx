"use client"

import {useState} from "react"
import {Eye, EyeOff, GraduationCap, BookOpen, Lock, Mail, User} from "lucide-react"
import {Button} from "../components/ui/button"
import {Input} from "../components/ui/input"
import {Checkbox} from "../components/ui/checkbox"
import {Label} from "../components/ui/label"
import authService from '../user/api/authService';
import {LoginResponse} from '../user/api/types';
import { useNavigate } from 'react-router-dom';
type UserRole = "student" | "teacher"


export default function LoginPage() {
    const [role, setRole] = useState<UserRole>("student")
    const [showPassword, setShowPassword] = useState(false)
    const [studentId, setStudentId] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [identifier, setIdentifier] = useState<string>('');
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        const currentIdentifier = role === "student" ? studentId : email;

        if (!currentIdentifier || !password) {
            alert("nhập đủ tài khoản và mật khẩu !");
            return;
        }

        try {
            const data: LoginResponse = await authService.login({
                identifier: currentIdentifier,
                password: password,


            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                studentId: data.studentId,
                role: data.role,
                fullName: data.fullName
            }));


            const displayName = data.fullName ? data.fullName : data.studentId;
            alert(`Đăng nhập thành công! Chào ${displayName}`);
            navigate('/dashboard');


        } catch (error: any) {
            console.error("Lỗi Login:", error);
            alert(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu rồi!");
        }
    }
    const handleWithGoogle = (e: React.FormEvent) => {
        e.preventDefault();
        authService.loginWithGoogle();
    };

    function forgotPassword() {
        navigate("/forgot-password");
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Column - Branding */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-800 via-emerald-700 to-yellow-500 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"/>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"/>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white w-full">
                    {/* Logo Area */}
                    <div className="mb-8">
                        <div
                            className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                            <GraduationCap className="w-14 h-14 text-white"/>
                        </div>
                    </div>

                    {/* Slogan */}
                    <h1 className="text-3xl md:text-4xl font-bold text-center leading-tight text-balance max-w-md">
                        Hệ thống Đánh giá Năng lực OBE - Quản lý Rubric thông minh
                    </h1>

                    <p className="mt-6 text-white/80 text-center max-w-sm">
                        Đại học Nông Lâm TP.HCM
                    </p>

                    {/* Decorative dots */}
                    <div className="mt-12 flex gap-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full"/>
                        <div className="w-2 h-2 bg-white/40 rounded-full"/>
                        <div className="w-2 h-2 bg-white/20 rounded-full"/>
                    </div>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div
                            className="w-16 h-16 bg-gradient-to-br from-emerald-700 to-emerald-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-10 h-10 text-white"/>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Chào mừng trở lại
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Đăng nhập để tiếp tục vào hệ thống E-Learning Rubric
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
                        <button
                            type="button"
                            onClick={() => setRole("student")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                role === "student"
                                    ? "bg-emerald-700 text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <User className="w-4 h-4"/>
                            Sinh viên
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("teacher")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                role === "teacher"
                                    ? "bg-emerald-700 text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <BookOpen className="w-4 h-4"/>
                            Giảng viên
                        </button>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username/Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="identifier" className="text-gray-700">
                                {role === "student" ? "Mã số sinh viên" : "Email giảng viên"}
                            </Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {role === "student" ? (
                                        <User className="w-5 h-5"/>
                                    ) : (
                                        <Mail className="w-5 h-5"/>
                                    )}
                                </div>
                                <Input
                                    id="identifier"
                                    type={role === "student" ? "text" : "email"}
                                    placeholder={
                                        role === "student"
                                            ? "Mã số sinh viên (VD: 22130260)"
                                            : "Email giảng viên (@hcmuaf.edu.vn)"
                                    }
                                    value={role === "student" ? studentId : email}
                                    onChange={(e) =>
                                        role === "student"
                                            ? setStudentId(e.target.value)
                                            : setEmail(e.target.value)
                                    }
                                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">
                                Mật khẩu
                            </Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5"/>
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu của bạn"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-12 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5"/>
                                    ) : (
                                        <Eye className="w-5 h-5"/>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}

                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                                    className="border-gray-300 w-5 h-5"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-gray-600 cursor-pointer font-normal"
                                >
                                    Ghi nhớ đăng nhập
                                </Label>
                            </div>
                            <a
                                onClick={forgotPassword}
                                className="text-sm text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                            >
                                Quên mật khẩu?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-base font-semibold shadow-lg shadow-emerald-700/25 transition-all duration-200"
                        >
                            Đăng nhập
                        </Button>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><span
                                className="w-full border-t border-gray-200"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span
                                className="bg-white px-2 text-gray-500">Hoặc</span></div>
                        </div>

                        {/* Nút Đăng nhập Google */}
                        <Button value="outline" type="button"
                                onClick={handleWithGoogle}

                                className="w-full h-12 border-gray-300 flex gap-3 items-center justify-center ">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"/>
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"/>
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"/>
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"/>
                            </svg>
                            Tiếp tục với Google
                        </Button>
                    </form>
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Chưa có tài khoản? <a href="/register" className="text-emerald-700 font-bold hover:underline">Đăng
                        ký ngay</a>
                    </p>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Bạn cần hỗ trợ?{" "}
                        <a
                            href="#"
                            className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                        >
                            Liên hệ phòng CNTT
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
