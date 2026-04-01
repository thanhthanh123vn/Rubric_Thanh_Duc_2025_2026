"use client"

import { useState } from "react"
import { GraduationCap, User, Mail, Lock, Phone, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        studentId: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu không khớp!")
            return
        }
        console.log("Gửi yêu cầu tạo tài khoản:", formData)
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            <div className="hidden lg:flex lg:w-1/3 bg-emerald-900 p-12 text-white flex-col justify-between">
                <div>
                    <GraduationCap className="w-16 h-16 mb-8 text-yellow-400" />
                    <h1 className="text-4xl font-bold">Gia nhập cộng đồng OBE NLU</h1>
                    <p className="mt-4 text-emerald-100/80">Quản lý lộ trình học tập và đánh giá năng lực một cách khoa học.</p>
                </div>
                <div className="text-sm text-emerald-200">© 2026 Đại học Nông Lâm TP.HCM</div>
            </div>

            <div className="w-full lg:w-2/3 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 sm:p-12 border border-gray-100">
                    <a href="/login" className="flex items-center text-emerald-700 mb-8 hover:gap-2 transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại đăng nhập
                    </a>

                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Đăng ký tài khoản sinh viên</h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Họ và tên</Label>
                            <Input id="fullName" placeholder="Nguyễn Văn Thạnh" required className="h-11"
                                   onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentId">Mã số sinh viên</Label>
                            <Input id="studentId" placeholder="22130260" required className="h-11"
                                   onChange={(e) => setFormData({...formData, studentId: e.target.value})} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="email">Email sinh viên</Label>
                            <Input id="email" type="email" placeholder="22130260@st.hcmuaf.edu.vn" required className="h-11"
                                   onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input id="password" type="password" required className="h-11"
                                   onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <Input id="confirmPassword" type="password" required className="h-11"
                                   onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                        </div>

                        <Button type="submit" className="md:col-span-2 h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold mt-4 shadow-lg shadow-emerald-700/30">
                            Xác nhận đăng ký
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}